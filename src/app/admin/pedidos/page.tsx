"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/cart";
import { getOrders, updateOrderStatus, Order } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Clock, Loader2, CheckCircle2, XCircle, MessageCircle,
  Search, ChevronDown, Package, Truck, Store, Save,
} from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/data";

type Estado = Order["estado"];

const ESTADOS: { value: Estado; label: string; color: string; icon: React.ElementType }[] = [
  { value: "pendiente", label: "Pendiente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  { value: "en preparación", label: "En preparación", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Loader2 },
  { value: "entregado", label: "Entregado", color: "bg-sage-100 text-sage-700 border-sage-200", icon: CheckCircle2 },
  { value: "cancelado", label: "Cancelado", color: "bg-red-100 text-red-500 border-red-200", icon: XCircle },
];

const PAGE_SIZE = 20;

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<Estado | "todos">("todos");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  // estadoLocal guarda la selección pendiente de guardar por pedido
  const [estadoLocal, setEstadoLocal] = useState<Record<number, Estado>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [savedOk, setSavedOk] = useState<number | null>(null);

  useEffect(() => {
    getOrders()
      .then(setPedidos)
      .finally(() => setLoading(false));
  }, []);

  const filtered = pedidos.filter((p) => {
    const matchSearch =
      p.cliente.toLowerCase().includes(search.toLowerCase()) ||
      p.order_number.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === "todos" || p.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  useEffect(() => { setPage(0); }, [search, filterEstado]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const guardarEstado = async (id: number) => {
    const nuevoEstado = estadoLocal[id];
    if (!nuevoEstado) return;
    setSaving(id);
    await updateOrderStatus(id, nuevoEstado);
    setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, estado: nuevoEstado } : p));
    setEstadoLocal((prev) => { const next = { ...prev }; delete next[id]; return next; });
    setSaving(null);
    setSavedOk(id);
    setTimeout(() => setSavedOk(null), 2000);
  };

  const countByEstado = (e: Estado) => pedidos.filter((p) => p.estado === e).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-sage-800 font-semibold"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
          Pedidos
        </h1>
        <p className="font-sans text-sm text-gray-400 mt-1">{pedidos.length} pedidos registrados</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {ESTADOS.map(({ value, label, icon: Icon, color }) => (
          <button key={value}
            onClick={() => setFilterEstado(filterEstado === value ? "todos" : value)}
            className={cn(
              "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
              filterEstado === value ? `${color} shadow-sm scale-[1.02]` : "bg-white border-gray-100 hover:border-gray-200"
            )}>
            <div>
              <p className="font-sans text-2xl font-bold text-gray-700">{countByEstado(value)}</p>
              <p className="font-sans text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
            <Icon className="w-5 h-5 text-gray-300" />
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente o número..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-sans text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-sage-400 transition-colors" />
      </div>

      {/* Orders list */}
      <div className="flex flex-col gap-3">
        {paginated.length === 0 && (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="font-sans text-sm text-gray-400">
              {pedidos.length === 0 ? "Aún no hay pedidos registrados" : "Sin pedidos"}
            </p>
          </div>
        )}
        <AnimatePresence>
          {paginated.map((pedido) => {
            const estadoCfg = ESTADOS.find((e) => e.value === pedido.estado)!;
            const isOpen = expanded === String(pedido.id);
            const fecha = new Date(pedido.created_at).toLocaleString("es-AR", {
              day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
            });

            return (
              <motion.div key={pedido.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : String(pedido.id))}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors text-left">
                  <div className="flex-shrink-0">
                    <p className="font-sans text-sm font-bold text-gray-700">{pedido.order_number}</p>
                    <p className="font-sans text-xs text-gray-400">{fecha}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-semibold text-gray-700 truncate">{pedido.cliente}</p>
                    <p className="font-sans text-xs text-gray-400 truncate">
                      {pedido.productos.map((p) => `${p.cantidad}x ${p.nombre}`).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-sans text-sm font-semibold text-gray-700 hidden sm:block">
                      {formatPrice(pedido.total)}
                    </span>
                    <span className={cn("hidden sm:inline-flex items-center gap-1.5 font-sans text-xs font-medium px-2.5 py-1 rounded-full border", estadoCfg.color)}>
                      <estadoCfg.icon className="w-3 h-3" />
                      {estadoCfg.label}
                    </span>
                    <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="font-sans text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Productos</p>
                          <div className="flex flex-col gap-2 mb-5">
                            {pedido.productos.map((p) => (
                              <div key={p.nombre} className="flex justify-between items-center text-sm">
                                <span className="font-sans text-gray-600">{p.cantidad}× {p.nombre}</span>
                                <span className="font-sans font-medium text-gray-700">{formatPrice(p.precio * p.cantidad)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100 mt-1">
                              <span className="font-sans font-semibold text-gray-700">Total</span>
                              <span className="font-serif text-xl font-semibold text-gray-800"
                                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                                {formatPrice(pedido.total)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs font-sans text-gray-500">
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                              {pedido.entrega === "envio" ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                              {pedido.entrega === "envio" ? "Envío" : "Retiro en local"}
                            </div>
                            {pedido.direccion && (
                              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                                📍 {pedido.direccion}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                              💳 {pedido.pago}
                            </div>
                          </div>
                          {pedido.notas && (
                            <p className="font-sans text-xs text-gray-400 italic mt-3 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                              💬 {pedido.notas}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="font-sans text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Cambiar estado</p>
                          <div className="flex flex-col gap-2 mb-4">
                            {ESTADOS.map(({ value, label, icon: Icon, color }) => {
                              const seleccionado = estadoLocal[pedido.id] ?? pedido.estado;
                              const esActual = pedido.estado === value && !estadoLocal[pedido.id];
                              const esSeleccionado = seleccionado === value;
                              return (
                                <button key={value}
                                  onClick={() => {
                                    if (value === pedido.estado) {
                                      setEstadoLocal((prev) => { const next = { ...prev }; delete next[pedido.id]; return next; });
                                    } else {
                                      setEstadoLocal((prev) => ({ ...prev, [pedido.id]: value }));
                                    }
                                  }}
                                  className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-sans text-sm font-medium transition-all text-left",
                                    esSeleccionado ? `${color} shadow-sm` : "border-gray-100 text-gray-500 hover:border-gray-200 bg-white"
                                  )}>
                                  <Icon className="w-4 h-4" />
                                  {label}
                                  {esActual && <span className="ml-auto text-xs opacity-60">Actual</span>}
                                </button>
                              );
                            })}
                          </div>

                          {/* Botón guardar — solo aparece si hay un cambio pendiente */}
                          {estadoLocal[pedido.id] && estadoLocal[pedido.id] !== pedido.estado && (
                            <button
                              onClick={() => guardarEstado(pedido.id)}
                              disabled={saving === pedido.id}
                              className="flex items-center justify-center gap-2 w-full bg-sage-500 hover:bg-sage-600 disabled:opacity-60 text-white font-sans text-sm font-semibold py-3 rounded-xl transition-colors shadow-sm mb-3"
                            >
                              {saving === pedido.id ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                              ) : (
                                <><Save className="w-4 h-4" />Guardar cambio</>
                              )}
                            </button>
                          )}

                          {savedOk === pedido.id && (
                            <p className="font-sans text-xs text-sage-600 text-center mb-3 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Estado actualizado correctamente
                            </p>
                          )}

                          <a href={`https://wa.me/${pedido.telefono}?text=${encodeURIComponent(`Hola ${pedido.cliente.split(" ")[0]}! Tu pedido ${pedido.order_number} está ${pedido.estado}. 🌿`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-sans text-sm font-medium py-3 rounded-xl transition-colors shadow-sm">
                            <MessageCircle className="w-4 h-4" />
                            Notificar al cliente
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="px-4 py-2 rounded-xl border border-gray-200 font-sans text-sm text-gray-600 disabled:opacity-40 hover:border-gray-300 transition-colors bg-white"
          >
            Anterior
          </button>
          <span className="font-sans text-sm text-gray-500">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-xl border border-gray-200 font-sans text-sm text-gray-600 disabled:opacity-40 hover:border-gray-300 transition-colors bg-white"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
