import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

function verifySignature(req: NextRequest, body: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return false; // Sin secret configurado, rechazar toda firma

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  const dataId = new URL(req.url).searchParams.get("data.id");

  if (!xSignature || !xRequestId || !dataId) return false;

  const tsPart = xSignature.split(",").find((p) => p.startsWith("ts="));
  const v1Part = xSignature.split(",").find((p) => p.startsWith("v1="));
  if (!tsPart || !v1Part) return false;

  const ts = tsPart.replace("ts=", "");
  const v1 = v1Part.replace("v1=", "");

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return expected === v1;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let notification: { type?: string; data?: { id?: string } };
  try {
    notification = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // Solo procesamos notificaciones de pagos
  if (notification.type !== "payment" || !notification.data?.id) {
    return NextResponse.json({ received: true });
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json({ received: true });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: notification.data.id });

    if (payment.status === "approved" && payment.external_reference) {
      await supabaseAdmin
        .from("orders")
        .update({
          estado: "pagado",
          notas: `MP Payment ID: ${payment.id} | Método: ${payment.payment_type_id}`,
        })
        .eq("order_number", payment.external_reference);
    }
  } catch (err) {
    console.error("Error procesando webhook MP:", err);
    // Devolvemos 200 igual para que MP no reintente indefinidamente
  }

  return NextResponse.json({ received: true });
}
