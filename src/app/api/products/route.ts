import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("Supabase error:", JSON.stringify(error));
    return NextResponse.json({ error: error.message, code: error.code, hint: error.hint }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}
