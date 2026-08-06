import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

// Desbloqueo manual: el admin certifica que el pedido se cobro por otro medio
// (transferencia, efectivo, arreglo directo) aunque MercadoPago no tenga un
// pago aprobado para el. Queda registrado el motivo, a diferencia de la
// confirmacion automatica via webhook/verificacion que trae un mp_payment_id real.
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

  const { note } = await req.json();
  if (!note || typeof note !== "string" || !note.trim()) {
    return NextResponse.json({ error: "Hay que indicar cómo se resolvió el pago." }, { status: 400 });
  }

  const { data: order, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("id, order_number")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ payment_override_note: note.trim(), payment_override_at: now })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from("order_events").insert({
    order_id: id,
    order_number: order.order_number,
    event_type: "payment_manually_unlocked",
    detail: { note: note.trim() },
  });

  return NextResponse.json(data);
}
