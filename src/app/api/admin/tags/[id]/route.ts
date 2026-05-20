import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { name, color } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("tags")
    .update({ name: name.trim(), color })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { error } = await supabaseAdmin.from("tags").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
