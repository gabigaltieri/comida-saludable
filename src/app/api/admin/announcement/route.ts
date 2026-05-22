import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { data } = await supabaseAdmin
    .from("announcements")
    .select("*")
    .eq("id", "main")
    .single();

  return NextResponse.json(data ?? { id: "main", text: "", color: "green", link: null, active: false });
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const payload: Record<string, unknown> = { id: "main", updated_at: new Date().toISOString() };
  if (body.text !== undefined) payload.text = body.text;
  if (body.color !== undefined) payload.color = body.color;
  if (body.link !== undefined) payload.link = body.link || null;
  if (body.active !== undefined) payload.active = body.active;

  const { data, error } = await supabaseAdmin
    .from("announcements")
    .upsert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
