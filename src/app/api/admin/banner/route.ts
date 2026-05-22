import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { data } = await supabaseAdmin
    .from("banners")
    .select("*")
    .eq("id", "tienda-hero")
    .single();

  return NextResponse.json(data ?? { id: "tienda-hero", image_url: null, active: true });
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const payload: Record<string, unknown> = { id: "tienda-hero", updated_at: new Date().toISOString() };
  if (body.image_url !== undefined) payload.image_url = body.image_url || null;
  if (body.active !== undefined) payload.active = body.active;

  const { data, error } = await supabaseAdmin
    .from("banners")
    .upsert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
