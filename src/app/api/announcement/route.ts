import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data } = await supabaseAdmin
    .from("announcements")
    .select("text, color, link, active")
    .eq("id", "main")
    .single();

  return NextResponse.json(data ?? { text: "", color: "green", link: null, active: false });
}
