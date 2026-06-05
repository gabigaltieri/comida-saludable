import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

const VALID_IDS = ["tienda-hero", "home-hero"];

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const id = req.nextUrl.searchParams.get("id") ?? "tienda-hero";
  if (!VALID_IDS.includes(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const { data } = await supabaseAdmin
    .from("banners")
    .select("*")
    .eq("id", id)
    .single();

  return NextResponse.json(data ?? { id, image_url: null, active: true });
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const id = body.id ?? "tienda-hero";
  if (!VALID_IDS.includes(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const payload: Record<string, unknown> = { id, updated_at: new Date().toISOString() };
  if (body.image_url !== undefined) payload.image_url = body.image_url || null;
  if (body.active !== undefined) payload.active = body.active;
  if (body.heading_text !== undefined) payload.heading_text = body.heading_text || null;
  if (body.subheading_text !== undefined) payload.subheading_text = body.subheading_text || null;

  const { data, error } = await supabaseAdmin
    .from("banners")
    .upsert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
