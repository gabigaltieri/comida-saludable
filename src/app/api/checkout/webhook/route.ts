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
  order_number: string;
  cliente: string;
  telefono: string;
  email: string | null;
  productos: { nombre: string; cantidad: number; precio: number }[];
  total: number;
  entrega: string;
  direccion: string | null;
  pago: string;
};

async function notifyAdmin(order: OrderRow, paymentId: string | null) {
  const productosList = order.productos
    .map((p) => `• ${p.cantidad}× ${p.nombre} — ${formatPrice(p.precio * p.cantidad)}`)
    .join("\n");

  const entregaLabel = order.entrega === "envio" ? "Envío a domicilio" : "Retiro en local";

  // ── Email ────────────────────────────────────────────────────────────────
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

  // ── WhatsApp (CallMeBot) ──────────────────────────────────────────────────
  const callmebotKey = process.env.CALLMEBOT_API_KEY;
  const adminPhone = process.env.ADMIN_WHATSAPP || "5491138567142";

  if (callmebotKey) {
    try {
      const msg = [
        `✅ *Nuevo pedido pagado — ${order.order_number}*`,
        `👤 ${order.cliente} | 📞 ${order.telefono}`,
        `📦 ${entregaLabel}${order.direccion ? ": " + order.direccion : ""}`,
        ``,
        productosList,
        ``,
        `💰 *Total: ${formatPrice(order.total)}*`,
      ].join("\n");

      const url = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(msg)}&apikey=${callmebotKey}`;
      await fetch(url);
    } catch (err) {
      console.error("Error enviando WhatsApp al admin:", err);
    }
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const { accessToken, webhookSecret } = await getMPCredentials();

  if (!verifySignature(req, rawBody, webhookSecret)) {
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
    return NextResponse.json({ received: true });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: notification.data.id });

    if (payment.status === "approved" && payment.external_reference) {
      const { data: order } = await supabaseAdmin
        .from("orders")
        .update({
          estado: "pagado",
          notas: `MP Payment ID: ${payment.id} | Método: ${payment.payment_type_id}`,
        })
        .eq("order_number", payment.external_reference)
        .select()
        .single();

      if (order) {
        // Notificar al admin sin bloquear la respuesta a MP
        notifyAdmin(order as OrderRow, String(payment.id)).catch(() => {});
      }
    }
  } catch (err) {
    console.error("Error procesando webhook MP:", err);
  }

  return NextResponse.json({ received: true });
}
