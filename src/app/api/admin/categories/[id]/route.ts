import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const payload: Record<string, unknown> = {};
  if (body.name !== undefined) payload.name = body.name;
  if (body.slug !== undefined) payload.slug = body.slug;
  if (body.description !== undefined) payload.description = body.description;
  if (body.image !== undefined) payload.image = body.image;
  if (body.emoji !== undefined) payload.emoji = body.emoji;
  if (body.sort_order !== undefined) payload.sort_order = body.sort_order;
  if (body.active !== undefined) payload.active = body.active;

  const { data, error } = await supabaseAdmin
    .from("categories")
    .update(payload)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  await supabaseAdmin.from("subcategories").delete().eq("category_id", params.id);
  const { error } = await supabaseAdmin.from("categories").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
