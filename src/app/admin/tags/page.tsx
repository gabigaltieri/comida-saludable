"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, X, Save, Loader2, CheckCircle2, XCircle, Tag } from "lucide-react";

type TagItem = { id: number; name: string; color: string };

const PRESET_COLORS = [
  "#9A8B6E", "#547d54", "#2a402b", "#D4B882",
  "#e07b54", "#5b8fa8", "#a85b8f", "#c0392b",
  "#7f8c8d", "#1a1a1a",
];

export default function AdminTags() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Modal
  const [modal, setModal] = useState<{ mode: "add" | "edit"; tag?: TagItem } | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState("#9A8B6E");
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const load = async () => {
    const res = await fetch("/api/admin/tags");
    const data = await res.json();
    if (Array.isArray(data)) setTags(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setDraftName("");
    setDraftColor("#9A8B6E");
    setModal({ mode: "add" });
  };

  const openEdit = (tag: TagItem) => {
    setDraftName(tag.name);
    setDraftColor(tag.color ?? "#9A8B6E");
    setModal({ mode: "edit", tag });
  };

  const save = async () => {
    if (!draftName.trim()) return;
    setSaving(true);
    try {
      if (modal?.mode === "add") {
        const res = await fetch("/api/admin/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: draftName, color: draftColor }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        showToast("Etiqueta creada");
      } else if (modal?.tag) {
        const res = await fetch(`/api/admin/tags/${modal.tag.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: draftName, color: draftColor }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setTags((prev) =>
          prev.map((t) => (t.id === modal.tag!.id ? data : t)).sort((a, b) => a.name.localeCompare(b.name))
        );
        showToast("Etiqueta actualizada");
      }
      setModal(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error al guardar", "err");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteId(null);
    setTags((prev) => prev.filter((t) => t.id !== id));
    const res = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) {
      showToast("Error al eliminar", "err");
      load();
    } else {
      showToast("Etiqueta eliminada");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-sage-800"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
            Etiquetas
          </h1>
          <p className="font-sans text-sm text-sage-500 mt-0.5">
            {tags.length} etiqueta{tags.length !== 1 ? "s" : ""} — se usan para filtrar y organizar productos.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nueva etiqueta
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-sans text-sm text-gray-400">Todavía no hay etiquetas. Creá la primera.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {tags.map((tag, i) => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors"
            >
              {/* Color dot */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10"
                style={{ background: tag.color ?? "#9A8B6E" }}
              />
              {/* Badge preview */}
              <span
                className="font-sans text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: (tag.color ?? "#9A8B6E") + "22", color: tag.color ?? "#9A8B6E", border: `1px solid ${tag.color ?? "#9A8B6E"}44` }}
              >
                {tag.name}
              </span>
              <span className="flex-1" />
              <button
                onClick={() => openEdit(tag)}
                className="p-2 rounded-lg text-gray-400 hover:text-sage-600 hover:bg-sage-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteId(tag.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal crear / editar */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModal(null)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <h2 className="font-serif text-2xl text-sage-800"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                    {modal.mode === "add" ? "Nueva etiqueta" : "Editar etiqueta"}
                  </h2>
                  <button onClick={() => setModal(null)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-6 py-5 flex flex-col gap-5">
                  <div>
                    <label className="block font-sans text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Nombre
                    </label>
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Ej: sin gluten, vegano, premium..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-sans text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-sage-400 transition-colors"
                      onKeyDown={(e) => e.key === "Enter" && save()}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setDraftColor(c)}
                          className={cn(
                            "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
                            draftColor === c ? "border-sage-500 scale-110" : "border-transparent"
                          )}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={draftColor}
                        onChange={(e) => setDraftColor(e.target.value)}
                        className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                      />
                      <span className="font-sans text-xs text-gray-400">Color personalizado</span>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="font-sans text-xs text-gray-400">Vista previa:</span>
                    <span
                      className="font-sans text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: draftColor + "22", color: draftColor, border: `1px solid ${draftColor}44` }}
                    >
                      {draftName || "etiqueta"}
                    </span>
                  </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                  <button onClick={() => setModal(null)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 font-sans text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={save} disabled={saving || !draftName.trim()}
                    className="flex-1 py-3 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-sans text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-60">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="font-sans font-semibold text-gray-700 text-lg mb-2">¿Eliminar etiqueta?</h3>
                <p className="font-sans text-sm text-gray-400 mb-6">No afecta los productos que ya la tienen asignada.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 font-sans text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={() => handleDelete(deleteId!)}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-sans text-sm font-semibold transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
            className={cn(
              "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 font-sans text-sm font-medium px-5 py-3 rounded-full shadow-lg flex items-center gap-2",
              toast.type === "ok" ? "bg-sage-700 text-white" : "bg-red-500 text-white"
            )}>
            {toast.type === "ok" ? <CheckCircle2 className="w-4 h-4 text-sage-300" /> : <XCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
