import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "tienda-hero";

  const { data } = await supabaseAdmin
    .from("banners")
    .select("image_url, active, heading_text, subheading_text")
    .eq("id", id)
    .single();

  return NextResponse.json(data ?? { image_url: null, active: false, heading_text: null, subheading_text: null });
}
