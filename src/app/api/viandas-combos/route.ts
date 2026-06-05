import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("viandas_combos")
    .select("*")
    .order("size", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
