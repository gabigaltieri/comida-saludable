import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const id = `sub-${Date.now()}`;
  const { data, error } = await supabaseAdmin
    .from("subcategories")
    .insert({
      id,
      category_id: body.category_id,
      name: body.name,
      slug: body.slug,
      description: body.description ?? "",
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
