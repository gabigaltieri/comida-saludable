import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

const KEYS = ["mp_access_token", "mp_public_key", "mp_webhook_secret"] as const;
type SettingKey = (typeof KEYS)[number];

function mask(value: string): string {
  if (!value) return "";
  if (value.length <= 12) return "***";
  return value.slice(0, 12) + "***";
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { data } = await supabaseAdmin
    .from("settings")
    .select("key, value")
    .in("key", KEYS);

  const map: Record<string, string> = {};
  data?.forEach((row) => { map[row.key] = row.value || ""; });

  const result: Record<string, { configured: boolean; masked: string }> = {};
  for (const key of KEYS) {
    result[key] = { configured: !!map[key], masked: mask(map[key]) };
  }

  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();

  const upserts: { key: SettingKey; value: string; updated_at: string }[] = [];
  for (const key of KEYS) {
    if (typeof body[key] === "string" && body[key].trim()) {
      upserts.push({ key, value: body[key].trim(), updated_at: new Date().toISOString() });
    }
  }

  if (upserts.length === 0) {
    return NextResponse.json({ error: "No hay datos para guardar" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("settings").upsert(upserts);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
