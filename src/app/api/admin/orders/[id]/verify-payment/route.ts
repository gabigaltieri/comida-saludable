import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";
import { getMPCredentials } from "@/lib/mpCredentials";

export const dynamic = "force-dynamic";

// Consulta en vivo a MercadoPago (no confía en el estado guardado en la base)
// para saber si un pedido puntual tiene un pago real detrás.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const { accessToken } = await getMPCredentials();
  if (!accessToken) {
    return NextResponse.json({ error: "MercadoPago no está configurado" }, { status: 500 });
  }

  const client = new MercadoPagoConfig({ accessToken });
  const paymentClient = new Payment(client);

  let results: Array<{ id: string; status?: string; status_detail?: string; transaction_amount?: number; date_created?: string; payment_type_id?: string }> = [];

  try {
    const search = await paymentClient.search({
      options: { external_reference: order.order_number, sort: "date_created", criteria: "desc" },
    });
    results = (search.results ?? []).map((p) => ({
      id: String(p.id),
      status: p.status,
      status_detail: p.status_detail,
      transaction_amount: p.transaction_amount,
      date_created: p.date_created,
      payment_type_id: p.payment_type_id,
    }));
  } catch (err) {
    console.error("Error consultando pagos en MercadoPago:", err);
    return NextResponse.json({ error: "Error al consultar MercadoPago" }, { status: 502 });
  }

  const approved = results.find((p) => p.status === "approved");
  const now = new Date().toISOString();

  const updateFields: Record<string, unknown> = { payment_checked_at: now };
  if (approved) {
    updateFields.mp_payment_id = String(approved.id);
    updateFields.mp_payment_status = approved.status;
    // Igual que el webhook: si seguia en pago pendiente, al confirmarse el
    // pago pasa a "pagado" solo. "pendiente_pago" ya no es un estado que el
    // admin pueda elegir a mano, asi que no puede quedar huerfano ahi.
    if (order.estado === "pendiente_pago") {
      updateFields.estado = "pagado";
    }
  } else if (results.length > 0) {
    // Sin aprobado, pero guardamos el último intento visto para no perder el rastro.
    const ultimo = results[0];
    updateFields.mp_payment_status = ultimo.status;
  }

  const { data: updated } = await supabaseAdmin
    .from("orders")
    .update(updateFields)
    .eq("id", id)
    .select("estado")
    .single();

  await supabaseAdmin.from("order_events").insert({
    order_id: id,
    order_number: order.order_number,
    event_type: "payment_verified_manually",
    detail: { found: results.length, approved: Boolean(approved) },
  });

  return NextResponse.json({
    order_number: order.order_number,
    pagado: Boolean(approved),
    pagos_encontrados: results,
    estado: updated?.estado ?? order.estado,
  });
}
