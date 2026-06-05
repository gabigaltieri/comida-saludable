import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from("viandas_combos")
    .select("*")
    .order("size", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const { id, price, size, badge } = body;

  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (price !== undefined) updates.price = Number(price);
  if (size !== undefined) updates.size = Number(size);
  if (badge !== undefined) updates.badge = badge;

  const { data, error } = await supabaseAdmin
    .from("viandas_combos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { size, price, badge } = await req.json();
  if (!size || !price || !badge)
    return NextResponse.json({ error: "size, price y badge son requeridos" }, { status: 400 });

  const id = `combo-${size}-${Date.now()}`;

  const { data, error } = await supabaseAdmin
    .from("viandas_combos")
    .insert({ id, size: Number(size), price: Number(price), badge, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const { error } = await supabaseAdmin.from("viandas_combos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
