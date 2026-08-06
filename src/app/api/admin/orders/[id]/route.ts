import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const { estado } = await req.json();

  const ESTADOS_VALIDOS = [
    "pendiente", "en preparación", "entregado",
    "cancelado", "pendiente_pago", "pagado", "pendiente_envio",
  ] as const;

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("pago, mp_payment_id, payment_override_note")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (existing.pago === "MercadoPago" && !existing.mp_payment_id && !existing.payment_override_note) {
    return NextResponse.json(
      { error: "No se puede cambiar el estado: este pedido no tiene un pago confirmado por MercadoPago." },
      { status: 409 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ estado })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar pedido:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("orders").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
