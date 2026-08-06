import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Vercel Cron pega acá una vez por día (ver vercel.json).
// Borra únicamente el log de auditoría de webhooks/verificaciones viejo —
// nunca toca la tabla "orders". Se mantiene 90 días, suficiente para
// diagnosticar un pedido reciente sin dejar la tabla crecer sin límite.
const RETENTION_DAYS = 90;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const limite = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error, count } = await supabaseAdmin
    .from("order_events")
    .delete({ count: "exact" })
    .lt("created_at", limite);

  if (error) {
    console.error("Error limpiando order_events:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, borrados: count ?? 0, limite });
}
