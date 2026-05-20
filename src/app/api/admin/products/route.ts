import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const id = `p-${Date.now()}`;
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      id,
      name: body.name,
      description: body.description,
      price: body.price,
      category: body.category,
      image: body.image,
      image2: body.image2 || null,
      image3: body.image3 || null,
      image_alt: body.imageAlt,
      tags: body.tags,
      featured: body.featured ?? false,
      available: body.available,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
