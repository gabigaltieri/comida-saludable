// Backfill: para cada pedido con pago = "MercadoPago" ya existente en la base,
// consulta MercadoPago por su external_reference (order_number) y completa
// mp_payment_id / mp_payment_status / payment_checked_at.
//
// Requiere haber corrido antes supabase/migrations/0001_payment_tracking.sql
// en el SQL Editor de Supabase (agrega esas columnas a "orders").
//
// Uso: node --env-file=.env.local scripts/backfill-mp-payments.js

const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function getMPAccessToken() {
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["mp_access_token"]);
  const fromSettings = data?.find((r) => r.key === "mp_access_token")?.value;
  return fromSettings || process.env.MP_ACCESS_TOKEN || "";
}

async function searchPayment(accessToken, orderNumber) {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(orderNumber)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`MP search fallo (${res.status}) para ${orderNumber}`);
  const json = await res.json();
  return json.results || [];
}

async function main() {
  const accessToken = await getMPAccessToken();
  if (!accessToken) {
    console.error("No se encontro mp_access_token (ni en settings ni en MP_ACCESS_TOKEN).");
    process.exit(1);
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, pago, estado, mp_payment_id")
    .eq("pago", "MercadoPago");

  if (error) throw error;

  console.log(`Revisando ${orders.length} pedidos de MercadoPago...\n`);

  let sinPago = [];
  let actualizados = 0;

  for (const order of orders) {
    if (order.mp_payment_id) continue; // ya tiene dato, no reconsultar

    const payments = await searchPayment(accessToken, order.order_number);
    const approved = payments.find((p) => p.status === "approved");

    const update = { payment_checked_at: new Date().toISOString() };
    if (approved) {
      update.mp_payment_id = String(approved.id);
      update.mp_payment_status = "approved";
    } else if (payments.length > 0) {
      update.mp_payment_status = payments[0].status;
    }

    await supabase.from("orders").update(update).eq("id", order.id);

    await supabase.from("order_events").insert({
      order_id: order.id,
      order_number: order.order_number,
      event_type: "payment_verified_backfill",
      detail: { found: payments.length, approved: Boolean(approved) },
    });

    actualizados++;

    if (!approved) {
      sinPago.push({ order_number: order.order_number, estado: order.estado, intentos: payments.length });
      console.log(`⚠️  ${order.order_number} (estado: ${order.estado}) — SIN pago aprobado en MercadoPago (${payments.length} intentos)`);
    } else {
      console.log(`✅ ${order.order_number} — pago aprobado ${approved.id}`);
    }
  }

  console.log(`\nListo. ${actualizados} pedidos actualizados.`);
  if (sinPago.length > 0) {
    console.log(`\n${sinPago.length} pedido(s) de MercadoPago SIN pago aprobado confirmado:`);
    sinPago.forEach((o) => console.log(`  - ${o.order_number} (estado actual: ${o.estado})`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
