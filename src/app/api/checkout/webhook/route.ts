import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabaseAdmin } from "@/lib/supabase";
import { getMPCredentials } from "@/lib/mpCredentials";
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

  // Rechazar webhooks con más de 5 minutos de antigüedad (previene replay attacks)
  const tsNum = parseInt(ts, 10);
  if (isNaN(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 300) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  // Comparación en tiempo constante para prevenir timing attacks
  const expectedBuf = Buffer.from(expected, "hex");
  const v1Buf = Buffer.from(v1, "hex");
  if (expectedBuf.length !== v1Buf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, v1Buf);
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

  // Solo procesamos notificaciones de pagos
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
