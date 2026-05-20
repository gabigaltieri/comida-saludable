import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from("combos")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error GET /api/admin/combos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const { name, description, price, image, imageAlt, product_ids, available } = body;

  if (!name || !price) {
    return NextResponse.json({ error: "Nombre y precio son requeridos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("combos")
    .insert({
      id: randomUUID(),
      name,
      description: description ?? "",
      price: Number(price),
      image: image ?? "",
      image_alt: imageAlt ?? "",
      product_ids: product_ids ?? [],
      available: available ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
