"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Loader2, Search, ChevronDown, CheckCircle2,
  Building2, CalendarDays, Mail, Phone, Users, MessageSquare,
} from "lucide-react";

type Lead = {
  id: number;
  tipo: "empresas" | "catering";
  nombre: string;
  empresa: string | null;
  mail: string;
  telefono: string;
  empleados: number | null;
  mensaje: string | null;
  estado: "nuevo" | "contactado" | "cerrado";
  created_at: string;
};

const ESTADOS: { value: Lead["estado"]; label: string; color: string }[] = [
  { value: "nuevo",      label: "Nuevo",      color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "contactado", label: "Contactado",  color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "cerrado",    label: "Cerrado",     color: "bg-sage-100 text-sage-700 border-sage-200" },
];

function estadoColor(e: Lead["estado"]) {
  return ESTADOS.find((s) => s.value === e)?.color ?? "";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<"todos" | "empresas" | "catering">("todos");
  const [filterEstado, setFilterEstado] = useState<Lead["estado"] | "todos">("todos");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [estadoLocal, setEstadoLocal] = useState<Record<number, Lead["estado"]>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [savedOk, setSavedOk] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setLeads(data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      l.nombre.toLowerCase().includes(q) ||
      l.mail.toLowerCase().includes(q) ||
      (l.empresa ?? "").toLowerCase().includes(q);
    const matchTipo = filterTipo === "todos" || l.tipo === filterTipo;
    const matchEstado = filterEstado === "todos" || l.estado === filterEstado;
    return matchSearch && matchTipo && matchEstado;
  });

  const guardar = async (id: number) => {
    const nuevoEstado = estadoLocal[id];
    if (!nuevoEstado) return;
    setSaving(id);
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, estado: nuevoEstado }),
    });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, estado: nuevoEstado } : l));
    setEstadoLocal((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setSaving(null);
    setSavedOk(id);
    setTimeout(() => setSavedOk(null), 2000);
  };

  const counts = {
    nuevo:      leads.filter((l) => l.estado === "nuevo").length,
    contactado: leads.filter((l) => l.estado === "contactado").length,
    cerrado:    leads.filter((l) => l.estado === "cerrado").length,
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-sage-800 mb-1"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
          Consultas
        </h1>
        <p className="font-sans text-sm text-sage-500">
          Formularios de contacto de empresas y catering.
        </p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {ESTADOS.map(({ value, label, color }) => (
          <div key={value} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="font-sans text-2xl font-bold text-sage-800">{counts[value]}</p>
            <span className={cn("inline-block font-sans text-xs font-semibold px-2 py-0.5 rounded-full border mt-1", color)}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, mail o empresa..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-sage-200 bg-white text-sm font-sans text-sage-700 placeholder:text-sage-400 focus:outline-none focus:border-sage-400"
          />
        </div>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value as typeof filterTipo)}
          className="px-3 py-2.5 rounded-xl border border-sage-200 bg-white text-sm font-sans text-sage-700 focus:outline-none focus:border-sage-400"
        >
          <option value="todos">Todos los tipos</option>
          <option value="empresas">Empresas</option>
          <option value="catering">Catering</option>
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value as typeof filterEstado)}
          className="px-3 py-2.5 rounded-xl border border-sage-200 bg-white text-sm font-sans text-sage-700 focus:outline-none focus:border-sage-400"
        >
          <option value="todos">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-sage-400 font-sans text-sm">
          No hay consultas que coincidan.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const isOpen = expanded === lead.id;
            const pendingEstado = estadoLocal[lead.id];
            return (
              <motion.div
                key={lead.id}
                layout
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Cabecera */}
                <button
                  onClick={() => setExpanded(isOpen ? null : lead.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-sage-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans font-semibold text-sage-800 text-sm">{lead.nombre}</span>
                      {lead.empresa && (
                        <span className="font-sans text-xs text-sage-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />{lead.empresa}
                        </span>
                      )}
                      <span className={cn(
                        "font-sans text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        lead.tipo === "empresas"
                          ? "bg-violet-50 text-violet-600 border-violet-200"
                          : "bg-amber-50 text-amber-600 border-amber-200"
                      )}>
                        {lead.tipo === "empresas" ? "Empresa" : "Catering"}
                      </span>
                      <span className={cn("font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full border", estadoColor(lead.estado))}>
                        {ESTADOS.find((e) => e.value === lead.estado)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sage-400 text-xs font-sans">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.mail}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.telefono}</span>
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatDate(lead.created_at)}</span>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-sage-400 flex-shrink-0 transition-transform", isOpen && "rotate-180")} />
                </button>

                {/* Detalle expandible */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-sage-50 pt-4 space-y-4">
                        {/* Info adicional */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm font-sans">
                          {lead.empleados && (
                            <div className="flex items-center gap-2 text-sage-600">
                              <Users className="w-4 h-4 text-sage-400" />
                              <span>{lead.empleados} empleados</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <a href={`mailto:${lead.mail}`}
                              className="text-sage-500 hover:text-sage-700 transition-colors underline underline-offset-2">
                              Responder por mail
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={`https://wa.me/549${lead.telefono.replace(/\D/g, "")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700 transition-colors underline underline-offset-2">
                              Escribir por WhatsApp
                            </a>
                          </div>
                        </div>

                        {/* Mensaje */}
                        {lead.mensaje && (
                          <div>
                            <p className="font-sans text-xs font-semibold text-sage-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" /> Consulta
                            </p>
                            <div className="bg-sage-50 rounded-xl px-4 py-3 font-sans text-sm text-sage-700 leading-relaxed whitespace-pre-wrap border border-sage-100">
                              {lead.mensaje}
                            </div>
                          </div>
                        )}

                        {/* Cambiar estado */}
                        <div className="flex items-center gap-3 pt-1">
                          <select
                            value={pendingEstado ?? lead.estado}
                            onChange={(e) =>
                              setEstadoLocal((prev) => ({ ...prev, [lead.id]: e.target.value as Lead["estado"] }))
                            }
                            className="px-3 py-2 rounded-xl border border-sage-200 bg-white text-sm font-sans text-sage-700 focus:outline-none focus:border-sage-400"
                          >
                            {ESTADOS.map((e) => (
                              <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => guardar(lead.id)}
                            disabled={!pendingEstado || saving === lead.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-sans text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
                            style={{ background: "#2a402b" }}
                          >
                            {saving === lead.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : savedOk === lead.id ? (
                              <><CheckCircle2 className="w-4 h-4" /> Guardado</>
                            ) : (
                              "Guardar cambio"
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
