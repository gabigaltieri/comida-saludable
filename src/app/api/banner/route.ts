import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data } = await supabaseAdmin
    .from("banners")
    .select("image_url, active")
    .eq("id", "tienda-hero")
    .single();

  return NextResponse.json(data ?? { image_url: null, active: false });
}
