import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";
import { getMPCredentials } from "@/lib/mpCredentials";
import { formatPrice } from "@/lib/cart";
import crypto from "crypto";

function verifySignature(req: NextRequest, body: string, secret: string): boolean {
  if (!secret) return false;

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  const dataId = new URL(req.url).searchParams.get("data.id");

  if (!xSignature || !xRequestId || !dataId) return false;

  const tsPart = xSignature.split(",").find((p) => p.startsWith("ts="));
  const v1Part = xSignature.split(",").find((p) => p.startsWith("v1="));
  if (!tsPart || !v1Part) return false;

  const ts = tsPart.replace("ts=", "");
  const v1 = v1Part.replace("v1=", "");

  const tsNum = parseInt(ts, 10);
  if (isNaN(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 300) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const v1Buf = Buffer.from(v1, "hex");
  if (expectedBuf.length !== v1Buf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, v1Buf);
}

type OrderRow = {
  id: number;
  order_number: string;
  cliente: string;
  telefono: string;
  email: string | null;
  productos: { nombre: string; cantidad: number; precio: number; descripcion?: string }[];
  total: number;
  estado: string;
  entrega: string;
  direccion: string | null;
  pago: string;
  mp_payment_id: string | null;
  mp_payment_status: string | null;
};

// Estados terminales de pago que ya no van a cambiar en MercadoPago.
const ESTADOS_RECHAZO = new Set(["rejected", "cancelled", "refunded", "charged_back"]);

async function logEvent(
  orderNumber: string,
  eventType: string,
  detail: Record<string, unknown>,
  orderId?: number
) {
  try {
    await supabaseAdmin.from("order_events").insert({
      order_id: orderId ?? null,
      order_number: orderNumber,
      event_type: eventType,
      detail,
    });
  } catch (err) {
    // El log de auditoría nunca debe tumbar el webhook.
    console.error("Error guardando order_event:", err);
  }
}

async function notifyAdmin(order: OrderRow, paymentId: string | null) {
  const productosList = order.productos
    .map((p) => {
      const linea = `• ${p.cantidad}× ${p.nombre} — ${formatPrice(p.precio * p.cantidad)}`;
      return p.descripcion ? `${linea}\n   ${p.descripcion}` : linea;
    })
    .join("\n");

  const entregaLabel = order.entrega === "envio" ? "Envío a domicilio" : "Retiro en local";

  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.CONTACT_EMAIL || "262cosasricas.web@gmail.com";

  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "noreply@262cosasricas.com.ar",
        to: adminEmail,
        subject: `🛒 Nuevo pedido pagado — ${order.order_number}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#333">
            <h2 style="color:#4a7c59">✅ Nuevo pedido pagado con MercadoPago</h2>
            <p><strong>Número de orden:</strong> ${order.order_number}</p>
            <p><strong>Cliente:</strong> ${order.cliente}</p>
            <p><strong>Teléfono:</strong> ${order.telefono}</p>
            ${order.email ? `<p><strong>Email:</strong> ${order.email}</p>` : ""}
            <p><strong>Entrega:</strong> ${entregaLabel}</p>
            ${order.direccion ? `<p><strong>Dirección:</strong> ${order.direccion}</p>` : ""}
            <hr style="margin:16px 0;border:none;border-top:1px solid #eee"/>
            <h3 style="color:#4a7c59">Productos</h3>
            <pre style="background:#f8f8f8;padding:12px;border-radius:8px;font-size:14px">${productosList}</pre>
            <p style="font-size:18px"><strong>Total: ${formatPrice(order.total)}</strong></p>
            ${paymentId ? `<p style="color:#888;font-size:12px">MP Payment ID: ${paymentId}</p>` : ""}
          </div>
        `,
      });
    } catch (err) {
      console.error("Error enviando email al admin:", err);
    }
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const { accessToken, webhookSecret } = await getMPCredentials();

  if (!verifySignature(req, rawBody, webhookSecret)) {
    // Solo registramos si la request tiene forma real de venir de MercadoPago
    // (trae los headers de firma); así no llenamos la auditoría con bots/escaneos
    // que le pegan a la URL del webhook sin ningún dato válido.
    const pareceSerMP = req.headers.get("x-signature") && req.headers.get("x-request-id");
    if (pareceSerMP) {
      await logEvent("desconocido", "webhook_signature_invalid", { hasSecret: Boolean(webhookSecret) });
    }
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let notification: { type?: string; data?: { id?: string } };
  try {
    notification = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (notification.type !== "payment" || !notification.data?.id) {
    return NextResponse.json({ received: true });
  }

  if (!accessToken) {
    await logEvent("desconocido", "webhook_error", {
      reason: "MP_ACCESS_TOKEN no configurado",
      paymentNotificationId: notification.data.id,
    });
    return NextResponse.json({ received: true });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: notification.data.id });

    const externalReference = payment.external_reference;
    const paymentId = String(payment.id);
    const status = payment.status ?? "unknown";

    if (!externalReference) {
      await logEvent("desconocido", "webhook_error", {
        reason: "Pago sin external_reference",
        paymentId,
        status,
      });
      return NextResponse.json({ received: true });
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("order_number", externalReference)
      .single();

    if (fetchError || !order) {
      // El pago existe en MercadoPago pero no hay pedido que lo reciba: no perderlo en el vacío.
      await logEvent(externalReference, "payment_orphaned", {
        paymentId,
        status,
        amount: payment.transaction_amount,
      });
      return NextResponse.json({ received: true });
    }

    const orderRow = order as OrderRow;

    // Idempotencia: si ya procesamos este mismo pago con el mismo estado, no repetir efectos secundarios.
    if (orderRow.mp_payment_id === paymentId && orderRow.mp_payment_status === status) {
      await logEvent(externalReference, "webhook_duplicate_ignored", { paymentId, status }, orderRow.id);
      return NextResponse.json({ received: true });
    }

    const updateFields: Record<string, unknown> = {
      mp_payment_id: paymentId,
      mp_payment_status: status,
      payment_checked_at: new Date().toISOString(),
    };

    // Solo tocamos el estado del pedido si sigue en pago pendiente:
    // no pisar decisiones manuales posteriores del admin (en preparación, entregado, etc).
    if (orderRow.estado === "pendiente_pago") {
      if (status === "approved") {
        updateFields.estado = "pagado";
      } else if (ESTADOS_RECHAZO.has(status)) {
        updateFields.estado = "cancelado";
      }
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("orders")
      .update(updateFields)
      .eq("id", orderRow.id)
      .select()
      .single();

    if (updateError) {
      await logEvent(externalReference, "webhook_error", {
        reason: "Fallo al actualizar el pedido",
        message: updateError.message,
        paymentId,
        status,
      }, orderRow.id);
      return NextResponse.json({ received: true });
    }

    await logEvent(externalReference, `payment_${status}`, {
      paymentId,
      amount: payment.transaction_amount,
      paymentType: payment.payment_type_id,
    }, orderRow.id);

    if (status === "approved") {
      notifyAdmin(updated as OrderRow, paymentId).catch(() => {});
    }
  } catch (err) {
    await logEvent("desconocido", "webhook_error", {
      reason: err instanceof Error ? err.message : "Error desconocido",
      paymentNotificationId: notification.data.id,
    });
    console.error("Error procesando webhook MP:", err);
  }

  return NextResponse.json({ received: true });
}
