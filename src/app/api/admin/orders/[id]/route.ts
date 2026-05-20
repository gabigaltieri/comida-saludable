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
    "cancelado", "pendiente_pago", "pagado",
  ] as const;

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
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
