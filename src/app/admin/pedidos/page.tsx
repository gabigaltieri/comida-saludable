"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/cart";
import { getOrders, updateOrderStatus, verifyOrderPayment, overrideOrderPayment, Order, VerifyPaymentResult } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Clock, Loader2, CheckCircle2, XCircle, MessageCircle,
  Search, ChevronDown, Package, PackageCheck, Truck, Store, Save, Trash2,
  AlertTriangle, ShieldCheck, LockOpen,
} from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/data";

// Pedido pagado por MercadoPago sin ningún pago real confirmado (por MP o por el admin).
function pagoSinConfirmar(p: Order): boolean {
  return p.pago === "MercadoPago" && !p.mp_payment_id && !p.payment_override_note;
}

type Estado = Order["estado"];

const ESTADOS: { value: Estado; label: string; color: string; icon: React.ElementType }[] = [
  { value: "pendiente_pago", label: "Pago pendiente", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Clock },
  { value: "pendiente", label: "Pendiente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  { value: "en preparación", label: "En preparación", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Loader2 },
  { value: "pagado", label: "Pagado", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  { value: "pendiente_envio", label: "Pendiente de envío", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: PackageCheck },
  { value: "entregado", label: "Entregado", color: "bg-sage-100 text-sage-700 border-sage-200", icon: CheckCircle2 },
  { value: "cancelado", label: "Cancelado", color: "bg-red-100 text-red-500 border-red-200", icon: XCircle },
];

const ESTADO_FALLBACK = { label: "Desconocido", color: "bg-gray-100 text-gray-500 border-gray-200", icon: Clock };

// "pendiente_pago" ya no se elige a mano: lo maneja el webhook de MP o la
// verificación/desbloqueo manual. Mientras un pedido esté ahí sin confirmar,
// el panel de "Cambiar estado" ni se muestra (aparece el aviso de pago).
const ESTADOS_SELECCIONABLES = ESTADOS.filter((e) => e.value !== "pendiente_pago");

const MENSAJES_WA: Record<string, string> = {
  pendiente_pago: "Tu pedido esta pendiente de pago. Completalo para que podamos procesarlo.",
  pendiente: "Recibimos tu pedido y esta pendiente de confirmacion. En breve te avisamos.",
  "en preparación": "Tu pedido esta en preparacion. Pronto estara listo!",
  pagado: "Confirmamos el pago de tu pedido. Ya lo estamos preparando!",
  pendiente_envio: "Tu pedido ya esta listo y esperando a ser retirado/enviado. Te avisamos apenas salga!",
  entregado: "Tu pedido fue entregado. Gracias por elegirnos!",
  cancelado: "Tu pedido fue cancelado. Si tenes alguna consulta escribinos.",
};

const OPCIONES_PAGO_MANUAL: { label: string; nota: string }[] = [
  { label: "Tarjeta", nota: "Pagó con tarjeta" },
  { label: "Efectivo", nota: "Pagó en efectivo" },
  { label: "Transferencia", nota: "Pagó por transferencia" },
  { label: "Otro", nota: "Pagó por otro medio" },
];

const PAGE_SIZE = 20;
const RESUMEN_MAX_CHARS = 70;

function truncateResumen(texto: string): string {
  return texto.length > RESUMEN_MAX_CHARS ? `${texto.slice(0, RESUMEN_MAX_CHARS).trimEnd()}…` : texto;
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<Estado | "todos" | "sin_confirmar">("todos");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [verificando, setVerificando] = useState<number | null>(null);
  const [resultadoVerificacion, setResultadoVerificacion] = useState<Record<number, VerifyPaymentResult>>({});
  const [desbloqueando, setDesbloqueando] = useState<number | null>(null);
  const [mostrarDesbloqueo, setMostrarDesbloqueo] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  // estadoLocal guarda la selección pendiente de guardar por pedido
  const [estadoLocal, setEstadoLocal] = useState<Record<number, Estado>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [savedOk, setSavedOk] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    getOrders()
      .then(setPedidos)
      .finally(() => setLoading(false));
  }, []);

  const filtered = pedidos.filter((p) => {
    const matchSearch =
      p.cliente.toLowerCase().includes(search.toLowerCase()) ||
      p.order_number.toLowerCase().includes(search.toLowerCase());
    const matchEstado =
      filterEstado === "todos" ? true :
      filterEstado === "sin_confirmar" ? pagoSinConfirmar(p) :
      p.estado === filterEstado;
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

  const eliminarPedido = async (id: number) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPedidos((prev) => prev.filter((p) => p.id !== id));
        if (expanded === String(id)) setExpanded(null);
      }
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const countByEstado = (e: Estado) => pedidos.filter((p) => p.estado === e).length;
  const countSinConfirmar = pedidos.filter(pagoSinConfirmar).length;

  const verificarPago = async (id: number) => {
    setVerificando(id);
    try {
      const resultado = await verifyOrderPayment(id);
      setResultadoVerificacion((prev) => ({ ...prev, [id]: resultado }));
      if (resultado.pagado) {
        const pagoAprobado = resultado.pagos_encontrados.find((p) => p.status === "approved");
        setPedidos((prev) => prev.map((p) =>
          p.id === id
            ? { ...p, mp_payment_id: pagoAprobado?.id ?? p.mp_payment_id, mp_payment_status: "approved", estado: resultado.estado }
            : p
        ));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al verificar el pago");
    } finally {
      setVerificando(null);
    }
  };

  const desbloquearManualmente = async (id: number, nota: string) => {
    setDesbloqueando(id);
    try {
      const actualizado = await overrideOrderPayment(id, nota);
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, ...actualizado } : p)));
      setMostrarDesbloqueo(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al desbloquear el pedido");
    } finally {
      setDesbloqueando(null);
    }
  };

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
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

      {/* Filtro: pedidos de MercadoPago sin pago confirmado */}
      {countSinConfirmar > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setFilterEstado(filterEstado === "sin_confirmar" ? "todos" : "sin_confirmar")}
            className={cn(
              "flex items-center justify-between w-full p-4 rounded-2xl border-2 transition-all text-left",
              filterEstado === "sin_confirmar"
                ? "bg-red-50 text-red-700 border-red-300 shadow-sm"
                : "bg-red-50/50 border-red-100 hover:border-red-200 text-red-600"
            )}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-sans text-sm font-semibold">
                  {countSinConfirmar} pedido{countSinConfirmar > 1 ? "s" : ""} de MercadoPago sin pago confirmado
                </p>
                <p className="font-sans text-xs opacity-80 mt-0.5">
                  Se creó el pedido pero MercadoPago nunca confirmó un pago aprobado para él
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

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
            const estadoCfg = ESTADOS.find((e) => e.value === pedido.estado) ?? ESTADO_FALLBACK;
            const isOpen = expanded === String(pedido.id);
            const fecha = new Date(pedido.created_at).toLocaleString("es-AR", {
              day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
            });

            return (
              <motion.div key={pedido.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center">
                  <button onClick={() => setExpanded(isOpen ? null : String(pedido.id))}
                    className="flex-1 flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors text-left">
                    <div className="flex-shrink-0">
                      <p className="font-sans text-sm font-bold text-gray-700">{pedido.order_number}</p>
                      <p className="font-sans text-xs text-gray-400">{fecha}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-semibold text-gray-700 truncate">{pedido.cliente}</p>
                      <p className="font-sans text-xs text-gray-400 truncate max-w-[220px] sm:max-w-xs md:max-w-sm">
                        {truncateResumen(pedido.productos.map((p) => `${p.cantidad}x ${p.nombre}`).join(", "))}
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

                  {/* Botón eliminar */}
                  <div className="pr-4 flex-shrink-0">
                    {confirmDelete === pedido.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => eliminarPedido(pedido.id)}
                          disabled={deleting === pedido.id}
                          className="font-sans text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                        >
                          {deleting === pedido.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirmar"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="font-sans text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(pedido.id); }}
                        className="p-2 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
                        title="Eliminar pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="font-sans text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Productos</p>
                          <div className="flex flex-col gap-2 mb-5">
                            {pedido.productos.map((p) => (
                              <div key={p.nombre} className="text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-sans text-gray-600">{p.cantidad}× {p.nombre}</span>
                                  <span className="font-sans font-medium text-gray-700">{formatPrice(p.precio * p.cantidad)}</span>
                                </div>
                                {p.descripcion && (
                                  <p className="font-sans text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 mt-1">
                                    🧾 {p.descripcion}
                                  </p>
                                )}
                              </div>
                            ))}
                            {pedido.entrega === "envio" && (
                              <>
                                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100 mt-1">
                                  <span className="font-sans text-gray-500">Subtotal productos</span>
                                  <span className="font-sans text-gray-600">
                                    {formatPrice(pedido.total - (pedido.costo_envio ?? 0))}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="font-sans text-gray-500 flex items-center gap-1.5">
                                    <Truck className="w-3.5 h-3.5" /> Envío
                                  </span>
                                  <span className="font-sans text-gray-600">
                                    {formatPrice(pedido.costo_envio ?? 0)}
                                  </span>
                                </div>
                              </>
                            )}
                            <div className={cn(
                              "flex justify-between items-center text-sm mt-1",
                              pedido.entrega === "envio" ? "pt-2" : "pt-2 border-t border-gray-100"
                            )}>
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

                          {pedido.pago === "MercadoPago" && pedido.mp_payment_id && (
                            <p className="flex items-center gap-1.5 font-sans text-xs font-medium text-sage-600 bg-sage-50 border border-sage-100 rounded-lg px-3 py-2 mt-3">
                              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                              Pago confirmado — MP Payment ID: {pedido.mp_payment_id}
                            </p>
                          )}

                          {pedido.pago === "MercadoPago" && !pedido.mp_payment_id && pedido.payment_override_note && (
                            <p className="flex items-start gap-1.5 font-sans text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3">
                              <LockOpen className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span>
                                Desbloqueado manualmente por el admin: &ldquo;{pedido.payment_override_note}&rdquo;
                                {pedido.payment_override_at && (
                                  <> — {new Date(pedido.payment_override_at).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</>
                                )}
                              </span>
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="font-sans text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Cambiar estado</p>

                          {pagoSinConfirmar(pedido) ? (
                            <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4">
                              <p className="flex items-center gap-2 font-sans text-sm font-bold text-red-700 mb-1">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                Falta de pago
                              </p>
                              <p className="font-sans text-xs text-red-600 mb-3">
                                MercadoPago no confirmó ningún pago aprobado para este pedido.
                                No se puede cambiar el estado hasta verificar que se cobró.
                              </p>

                              {resultadoVerificacion[pedido.id] && !resultadoVerificacion[pedido.id].pagado && (
                                <p className="font-sans text-xs text-red-500 mb-3">
                                  {resultadoVerificacion[pedido.id].pagos_encontrados.length === 0
                                    ? "Última verificación: no se encontró ningún pago."
                                    : `Última verificación: intentos sin aprobar (${resultadoVerificacion[pedido.id].pagos_encontrados.map((p) => p.status).join(", ")}).`}
                                </p>
                              )}

                              <button
                                onClick={() => verificarPago(pedido.id)}
                                disabled={verificando === pedido.id}
                                className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-sans text-sm font-semibold py-3 rounded-xl transition-colors shadow-sm"
                              >
                                {verificando === pedido.id ? (
                                  <><Loader2 className="w-4 h-4 animate-spin" /> Consultando MercadoPago...</>
                                ) : (
                                  <><ShieldCheck className="w-4 h-4" /> Verificar pago en MercadoPago</>
                                )}
                              </button>

                              {mostrarDesbloqueo === pedido.id ? (
                                <div className="mt-3 pt-3 border-t border-red-200">
                                  <p className="font-sans text-xs font-medium text-red-700 mb-2">¿Cómo pagó?</p>
                                  <div className="grid grid-cols-2 gap-2 mb-2">
                                    {OPCIONES_PAGO_MANUAL.map((opcion) => (
                                      <button
                                        key={opcion.label}
                                        onClick={() => desbloquearManualmente(pedido.id, opcion.nota)}
                                        disabled={desbloqueando === pedido.id}
                                        className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-sans text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
                                      >
                                        {desbloqueando === pedido.id ? <Loader2 className="w-4 h-4 animate-spin" /> : opcion.label}
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    onClick={() => setMostrarDesbloqueo(null)}
                                    className="w-full font-sans text-sm text-gray-500 hover:text-gray-700 py-1 rounded-xl transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setMostrarDesbloqueo(pedido.id)}
                                  className="flex items-center justify-center gap-1.5 w-full text-amber-700 hover:text-amber-800 font-sans text-xs font-medium mt-3 pt-3 border-t border-red-200 transition-colors"
                                >
                                  <LockOpen className="w-3.5 h-3.5" />
                                  Desbloquear pago
                                </button>
                              )}
                            </div>
                          ) : (
                            <>
                              <div className="flex flex-col gap-2 mb-4">
                                {ESTADOS_SELECCIONABLES.map(({ value, label, icon: Icon, color }) => {
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

                              {(() => {
                                const estadoActivo = estadoLocal[pedido.id] ?? pedido.estado;
                                const mensaje = `Hola ${pedido.cliente.split(" ")[0]}! ${MENSAJES_WA[estadoActivo] ?? `Tu pedido ${pedido.order_number} fue actualizado.`} Numero de orden: ${pedido.order_number}.`;
                                return (
                                  <a href={`https://wa.me/${pedido.telefono}?text=${encodeURIComponent(mensaje)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-sans text-sm font-medium py-3 rounded-xl transition-colors shadow-sm">
                                    <MessageCircle className="w-4 h-4" />
                                    Notificar al cliente
                                  </a>
                                );
                              })()}
                            </>
                          )}
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
