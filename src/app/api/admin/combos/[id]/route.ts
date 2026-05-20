import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const { name, description, price, image, imageAlt, product_ids, available, sort_order } = body;

  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (description !== undefined) update.description = description;
  if (price !== undefined) update.price = Number(price);
  if (image !== undefined) update.image = image;
  if (imageAlt !== undefined) update.image_alt = imageAlt;
  if (product_ids !== undefined) update.product_ids = product_ids;
  if (available !== undefined) update.available = available;
  if (sort_order !== undefined) update.sort_order = sort_order;

  const { data, error } = await supabaseAdmin
    .from("combos")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { error } = await supabaseAdmin.from("combos").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
