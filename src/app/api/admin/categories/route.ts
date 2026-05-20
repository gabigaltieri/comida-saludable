import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { data: categories, error: catErr } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order");

  if (catErr) return NextResponse.json({ error: catErr.message }, { status: 500 });

  const { data: subcategories, error: subErr } = await supabaseAdmin
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

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const id = `cat-${Date.now()}`;
  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      id,
      name: body.name,
      slug: body.slug,
      description: body.description ?? "",
      image: body.image ?? "",
      emoji: body.emoji ?? "",
      sort_order: body.sort_order ?? 0,
      active: body.active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
