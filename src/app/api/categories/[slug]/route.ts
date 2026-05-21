import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  // Algunas categorías tienen el slug en el campo `id` (creadas antes del ALTER TABLE).
  // Buscar por slug primero; si no encuentra, buscar por id.
  const { data: category, error } = await supabase
    .from("categories")
    .select("*")
    .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
    .eq("active", true)
    .single();

  if (error || !category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", category.id)
    .order("sort_order");

  return NextResponse.json({ ...category, subcategories: subcategories ?? [] });
}
