"use client";

import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/lib/cart";
import { ARG_OFFSET_MS } from "@/lib/utils";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Gift,
} from "lucide-react";

// ── Tipos ──────────────────────────────────────────────────

interface DashboardData {
  ventasHoy: number;
  pedidosHoy: number;
  pedidosPendientes: number;
  productosActivos: number;
  productosTotal: number;
  combosActivos: number;
  combosTotal: number;
  clientesSemana: number;
  ultimosPedidos: UltimoPedido[];
  ventasSemana: { day: string; date: string; value: number }[];
  distribucionCategorias: { category: string; count: number; pct: number }[];
}

interface UltimoPedido {
  id: number;
  order_number: string;
  cliente: string;
  telefono: string;
  productos: { nombre: string; cantidad: number; precio: number }[];
  total: number;
  estado: "pendiente" | "en preparación" | "entregado" | "cancelado";
  created_at: string;
}

// ── Configuración visual de estados ────────────────────────

const ESTADO_CONFIG = {
  pendiente: { label: "Pendiente", color: "bg-amber-100 text-amber-700", icon: Clock },
  "en preparación": { label: "En preparación", color: "bg-blue-100 text-blue-700", icon: Loader2 },
  entregado: { label: "Entregado", color: "bg-sage-100 text-sage-700", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-500", icon: XCircle },
} as const;

const CAT_NAMES: Record<string, string> = {
  "viandas-diarias": "Diarias",
  "viandas-congeladas": "Congeladas",
  "ensaladas-tartas": "Ensaladas",
};

// ── Helpers ─────────────────────────────────────────────────

function formatHora(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const dateAr = new Date(date.getTime() + ARG_OFFSET_MS);
  const nowAr = new Date(now.getTime() + ARG_OFFSET_MS);
  const isToday =
    dateAr.getUTCFullYear() === nowAr.getUTCFullYear() &&
    dateAr.getUTCMonth() === nowAr.getUTCMonth() &&
    dateAr.getUTCDate() === nowAr.getUTCDate();
  const yesterdayAr = new Date(nowAr.getTime() - 24 * 60 * 60 * 1000);
  const isYesterday =
    dateAr.getUTCFullYear() === yesterdayAr.getUTCFullYear() &&
    dateAr.getUTCMonth() === yesterdayAr.getUTCMonth() &&
    dateAr.getUTCDate() === yesterdayAr.getUTCDate();
  const timeStr = dateAr.toISOString().slice(11, 16);
  if (isToday) return `Hoy, ${timeStr}`;
  if (isYesterday) return `Ayer, ${timeStr}`;
  return dateAr.toISOString().slice(0, 10);
}

function todayLabelArg(): string {
  const ar = new Date(Date.now() + ARG_OFFSET_MS);
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${dias[ar.getUTCDay()]} ${ar.getUTCDate()} de ${meses[ar.getUTCMonth()]} · Buenos Aires`;
}

// ── Componente principal ─────────────────────────────────────

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Suscripción realtime a la tabla orders
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    const channel = supabase
      .channel("dashboard-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchData(true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="font-sans text-sm text-gray-400">Error al cargar el dashboard</p>
        <button
          onClick={() => fetchData()}
          className="font-sans text-xs text-sage-500 hover:text-sage-700 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const maxVal = Math.max(...data.ventasSemana.map((d) => d.value), 1);

  const stats = [
    {
      label: "Ventas hoy",
      value: formatPrice(data.ventasHoy),
      sub: data.ventasHoy === 0 ? "Sin entregas aún hoy" : "Pedidos entregados",
      icon: TrendingUp,
      iconBg: "bg-sage-500",
    },
    {
      label: "Pedidos hoy",
      value: String(data.pedidosHoy),
      sub: data.pedidosPendientes === 0
        ? "Sin pendientes"
        : `${data.pedidosPendientes} pendiente${data.pedidosPendientes !== 1 ? "s" : ""}`,
      icon: ShoppingBag,
      iconBg: "bg-blue-500",
    },
    {
      label: "Productos activos",
      value: String(data.productosActivos),
      sub: `de ${data.productosTotal} totales`,
      icon: Package,
      iconBg: "bg-purple-500",
    },
    {
      label: "Combos activos",
      value: String(data.combosActivos),
      sub: `de ${data.combosTotal} totales`,
      icon: Gift,
      iconBg: "bg-pink-500",
    },
    {
      label: "Clientes esta semana",
      value: String(data.clientesSemana),
      sub: "teléfonos únicos",
      icon: Users,
      iconBg: "bg-amber-500",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1
            className="font-serif text-3xl md:text-4xl text-sage-800 font-semibold"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            Dashboard
          </h1>
          <p className="font-sans text-sm text-gray-400 mt-1">{todayLabelArg()}</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:border-sage-400 hover:text-sage-600 text-gray-500 font-sans text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p
              className="font-serif text-3xl font-semibold text-gray-800 mb-1"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              {s.value}
            </p>
            <p className="font-sans text-sm text-gray-500">{s.label}</p>
            <p className="font-sans text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Últimos pedidos */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-sans text-base font-semibold text-gray-700">Últimos pedidos</h2>
            <a
              href="/admin/pedidos"
              className="font-sans text-xs text-sage-500 hover:text-sage-700 transition-colors"
            >
              Ver todos →
            </a>
          </div>

          {data.ultimosPedidos.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="font-sans text-sm text-gray-400">Aún no hay pedidos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {["Pedido", "Cliente", "Productos", "Total", "Estado", "Hora"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left font-sans text-[11px] uppercase tracking-wider text-gray-400 font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.ultimosPedidos.map((order) => {
                    const cfg = ESTADO_CONFIG[order.estado] ?? ESTADO_CONFIG.pendiente;
                    const cantProductos = order.productos.reduce((s, p) => s + p.cantidad, 0);
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-sans text-sm font-semibold text-gray-700">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4 font-sans text-sm text-gray-600">{order.cliente}</td>
                        <td className="px-6 py-4 font-sans text-sm text-gray-500 text-center">
                          {cantProductos}
                        </td>
                        <td className="px-6 py-4 font-sans text-sm font-medium text-gray-700">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 font-sans text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}
                          >
                            <cfg.icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-sans text-xs text-gray-400">
                          {formatHora(order.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Panel lateral */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="font-sans text-base font-semibold text-gray-700 mb-1">
            Ventas esta semana
          </h2>
          <p className="font-sans text-xs text-gray-400 mb-6">Últimos 7 días</p>

          {/* Barchart */}
          <div className="flex items-end gap-2 h-40">
            {data.ventasSemana.map((d, i) => {
              const isToday = i === data.ventasSemana.length - 1;
              const height = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {d.value > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-[10px] font-sans px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {formatPrice(d.value)}
                    </div>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.5 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                    className={`w-full rounded-t-lg ${isToday ? "bg-sage-500" : "bg-sage-100"}`}
                    style={{ minHeight: height > 0 ? 4 : 0 }}
                  />
                  <span className="font-sans text-[10px] text-gray-400">{d.day}</span>
                </div>
              );
            })}
          </div>

          {/* Ventas totales semana */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="font-sans text-xs text-gray-400">Total semana</span>
            <span
              className="font-serif text-lg font-semibold text-gray-700"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              {formatPrice(data.ventasSemana.reduce((s, d) => s + d.value, 0))}
            </span>
          </div>

          {/* Distribución categorías */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="font-sans text-xs text-gray-400 mb-3">Productos por categoría</p>
            {data.distribucionCategorias.length === 0 ? (
              <p className="font-sans text-xs text-gray-300 italic">Sin productos cargados</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {data.distribucionCategorias.map(({ category, pct }) => (
                  <div key={category} className="flex items-center gap-3">
                    <span className="font-sans text-xs text-gray-500 w-24 truncate">
                      {CAT_NAMES[category] ?? category}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="h-full bg-sage-400 rounded-full"
                      />
                    </div>
                    <span className="font-sans text-xs text-gray-400 w-8 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Indicador realtime */}
      <div className="mt-6 flex items-center justify-end gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-500" />
        </span>
        <span className="font-sans text-[11px] text-gray-400">Actualización en tiempo real</span>
      </div>
    </div>
  );
}
