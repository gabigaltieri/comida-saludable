import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";
import { ARG_OFFSET_MS } from "@/lib/utils";

export const dynamic = "force-dynamic";

function toArgentina(date: Date): Date {
  return new Date(date.getTime() + ARG_OFFSET_MS);
}

function startOfDayArg(date: Date): Date {
  const ar = toArgentina(date);
  const y = ar.getUTCFullYear();
  const m = ar.getUTCMonth();
  const d = ar.getUTCDate();
  // Medianoche Argentina → UTC (UTC-3 = +3 horas)
  return new Date(Date.UTC(y, m, d, 3, 0, 0, 0));
}

function formatDayLabel(date: Date): string {
  const ar = toArgentina(date);
  return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][ar.getUTCDay()];
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const now = new Date();
  const todayStart = startOfDayArg(now);
  const weekAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);

  // --- Pedidos últimos 7 días (para el chart + stats) ---
  const { data: weekOrders, error: weekErr } = await supabaseAdmin
    .from("orders")
    .select("id, total, estado, telefono, created_at")
    .gte("created_at", weekAgo.toISOString())
    .order("created_at", { ascending: false });

  if (weekErr) return NextResponse.json({ error: weekErr.message }, { status: 500 });

  // --- Últimos 6 pedidos para la tabla ---
  const { data: latestOrders, error: latestErr } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, cliente, telefono, productos, total, estado, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  if (latestErr) return NextResponse.json({ error: latestErr.message }, { status: 500 });

  // --- Productos ---
  const { data: products, error: prodErr } = await supabaseAdmin
    .from("products")
    .select("id, category, available");

  if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 500 });

  // --- Combos ---
  const { data: combos, error: combosErr } = await supabaseAdmin
    .from("combos")
    .select("id, available");

  if (combosErr) return NextResponse.json({ error: combosErr.message }, { status: 500 });

  // --- Calcular métricas ---
  const orders = weekOrders ?? [];

  const todayOrders = orders.filter(
    (o) => new Date(o.created_at) >= todayStart
  );

  // Solo los entregados cuentan como venta efectiva
  const entregadosHoy = todayOrders.filter((o) => o.estado === "entregado");
  const ventasHoy = entregadosHoy.reduce((sum, o) => sum + Number(o.total), 0);
  const pedidosHoy = todayOrders.length;
  const pedidosPendientes = orders.filter((o) => o.estado === "pendiente").length;

  const telefonosUnicos = new Set(orders.map((o) => o.telefono));
  const clientesSemana = telefonosUnicos.size;

  const productosTotal = products?.length ?? 0;
  const productosActivos = products?.filter((p) => p.available).length ?? 0;

  const combosTotal = combos?.length ?? 0;
  const combosActivos = combos?.filter((c) => c.available).length ?? 0;

  // --- Ventas por día (últimos 7 días) — solo pedidos entregados ---
  const ventasSemana: { day: string; date: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const total = orders
      .filter((o) => {
        const t = new Date(o.created_at);
        return t >= dayStart && t < dayEnd && o.estado === "entregado";
      })
      .reduce((sum, o) => sum + Number(o.total), 0);
    ventasSemana.push({
      day: formatDayLabel(dayStart),
      date: toArgentina(dayStart).toISOString().slice(0, 10),
      value: total,
    });
  }

  // --- Distribución por categoría ---
  const prods = products ?? [];
  const catCount: Record<string, number> = {};
  for (const p of prods) {
    catCount[p.category] = (catCount[p.category] ?? 0) + 1;
  }
  const distribucionCategorias = Object.entries(catCount).map(([cat, count]) => ({
    category: cat,
    count,
    pct: productosTotal > 0 ? Math.round((count / productosTotal) * 100) : 0,
  }));

  return NextResponse.json({
    ventasHoy,
    pedidosHoy,
    pedidosPendientes,
    productosActivos,
    productosTotal,
    combosActivos,
    combosTotal,
    clientesSemana,
    ultimosPedidos: latestOrders ?? [],
    ventasSemana,
    distribucionCategorias,
  });
}
