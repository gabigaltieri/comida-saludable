"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, CheckCircle2, XCircle, Eye, EyeOff, Megaphone } from "lucide-react";

type Announcement = { text: string; color: string; link: string | null; active: boolean };

const COLORS: { key: string; label: string; bg: string; text: string; preview: string }[] = [
  { key: "green",  label: "Verde",   bg: "#2d6a4f", text: "#fff",     preview: "bg-[#2d6a4f]" },
  { key: "sage",   label: "Salvia",  bg: "#547d54", text: "#fff",     preview: "bg-[#547d54]" },
  { key: "gold",   label: "Dorado",  bg: "#b8860b", text: "#fff",     preview: "bg-[#b8860b]" },
  { key: "red",    label: "Rojo",    bg: "#c0392b", text: "#fff",     preview: "bg-[#c0392b]" },
  { key: "orange", label: "Naranja", bg: "#e05d00", text: "#fff",     preview: "bg-[#e05d00]" },
  { key: "blue",   label: "Azul",    bg: "#1d4ed8", text: "#fff",     preview: "bg-[#1d4ed8]" },
  { key: "black",  label: "Negro",   bg: "#1a1a1a", text: "#fff",     preview: "bg-[#1a1a1a]" },
  { key: "cream",  label: "Crema",   bg: "#f5f0e8", text: "#3a3a2a",  preview: "bg-[#f5f0e8]" },
];

const COLOR_MAP = Object.fromEntries(COLORS.map((c) => [c.key, c]));

export default function AdminAnuncio() {
  const [data, setData] = useState<Announcement>({ text: "", color: "green", link: null, active: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/admin/announcement")
      .then((r) => r.json())
      .then((d) => setData({ text: d.text ?? "", color: d.color ?? "green", link: d.link ?? "", active: d.active ?? false }))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/announcement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, link: data.link || null }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      showToast("Anuncio guardado correctamente");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error al guardar", "err");
    } finally {
      setSaving(false);
    }
  };

  const selectedColor = COLOR_MAP[data.color] ?? COLOR_MAP["green"];

  if (loading) return (
    <div className="flex justify-center py-32">
      <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-sage-800" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
            Barra de anuncio
          </h1>
          <p className="font-sans text-sm text-sage-500 mt-0.5">
            Franja visible en la parte superior del sitio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setData((d) => ({ ...d, active: !d.active }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-sans text-sm font-medium border transition-colors ${
              data.active
                ? "bg-sage-50 text-sage-600 border-sage-200 hover:bg-sage-100"
                : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {data.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {data.active ? "Visible" : "Oculto"}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <p className="font-sans text-xs uppercase tracking-widest text-sage-400 mb-2">Vista previa</p>
        <div
          className="w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-sans font-medium transition-all"
          style={{ background: selectedColor.bg, color: selectedColor.text }}
        >
          <Megaphone className="w-4 h-4 flex-shrink-0" />
          <span>{data.text || "Tu anuncio aparece acá..."}</span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">

        {/* Texto */}
        <div>
          <label className="block font-sans text-sm font-semibold text-gray-600 mb-2">Texto del anuncio</label>
          <input
            type="text"
            value={data.text}
            onChange={(e) => setData((d) => ({ ...d, text: e.target.value }))}
            placeholder="🔥 10% OFF en combos de viandas esta semana"
            maxLength={120}
            className="w-full font-sans text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 text-gray-700 placeholder-gray-300"
          />
          <p className="font-sans text-xs text-gray-400 mt-1 text-right">{data.text.length}/120</p>
        </div>

        {/* Color */}
        <div>
          <label className="block font-sans text-sm font-semibold text-gray-600 mb-3">Color de fondo</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.key}
                onClick={() => setData((d) => ({ ...d, color: c.key }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-sans text-xs font-medium border-2 transition-all ${
                  data.color === c.key ? "border-sage-500 scale-105 shadow-sm" : "border-transparent hover:border-gray-200"
                }`}
                style={{ background: c.bg, color: c.text }}
              >
                {c.label}
                {data.color === c.key && <span className="text-[10px]">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Link */}
        <div>
          <label className="block font-sans text-sm font-semibold text-gray-600 mb-2">
            Link <span className="font-normal text-gray-400">(opcional)</span>
          </label>
          <input
            type="text"
            value={data.link ?? ""}
            onChange={(e) => setData((d) => ({ ...d, link: e.target.value }))}
            placeholder="/tienda  o  https://..."
            className="w-full font-sans text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 text-gray-700 placeholder-gray-300"
          />
          <p className="font-sans text-xs text-gray-400 mt-1">Si completás este campo, toda la barra es clickeable.</p>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 font-sans text-sm font-medium px-5 py-3 rounded-full shadow-lg flex items-center gap-2 ${
              toast.type === "ok" ? "bg-sage-700 text-white" : "bg-red-500 text-white"
            }`}
          >
            {toast.type === "ok" ? <CheckCircle2 className="w-4 h-4 text-sage-300" /> : <XCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
