import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const payload: Record<string, unknown> = {};
  if (body.name !== undefined) payload.name = body.name;
  if (body.description !== undefined) payload.description = body.description;
  if (body.price !== undefined) payload.price = body.price;
  if (body.category !== undefined) payload.category = body.category;
  if (body.image !== undefined) payload.image = body.image;
  if (body.image2 !== undefined) payload.image2 = body.image2 || null;
  if (body.image3 !== undefined) payload.image3 = body.image3 || null;
  if (body.imageAlt !== undefined) payload.image_alt = body.imageAlt;
  if (body.tags !== undefined) payload.tags = body.tags;
  if (body.featured !== undefined) payload.featured = body.featured;
  if (body.available !== undefined) payload.available = body.available;

  const { data, error } = await supabaseAdmin
    .from("products")
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

  const { error } = await supabaseAdmin.from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
