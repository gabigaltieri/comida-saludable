import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { order } = await req.json() as { order: string[] };

  if (!Array.isArray(order)) {
    return NextResponse.json({ error: "order debe ser un array" }, { status: 400 });
  }

  const rows = order.map((id, index) => ({ id, sort_order: index + 1 }));
  const { error } = await supabaseAdmin
    .from("products")
    .upsert(rows, { onConflict: "id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
