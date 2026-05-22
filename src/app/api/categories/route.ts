import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  if (catErr) return NextResponse.json({ error: catErr.message }, { status: 500 });

  const { data: subcategories, error: subErr } = await supabase
    .from("subcategories")
    .select("*")
    .order("sort_order");

  if (subErr) return NextResponse.json({ error: subErr.message }, { status: 500 });

  const result = (categories ?? []).map((cat) => ({
    ...cat,
    subcategories: (subcategories ?? []).filter((s) => s.category_id === cat.id),
  }));

  return NextResponse.json(result);
}
