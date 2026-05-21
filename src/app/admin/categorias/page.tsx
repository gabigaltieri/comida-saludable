"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus, Pencil, Trash2, X, CheckCircle2, XCircle,
  Layers, Save, Loader2, ChevronRight, Tag,
} from "lucide-react";

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  emoji: string;
  sort_order: number;
  active: boolean;
  subcategories: Subcategory[];
};

type CatDraft = { name: string; slug: string; description: string; image: string; emoji: string; sort_order: number; active: boolean };
type SubDraft = { name: string; slug: string; description: string; sort_order: number };

const EMPTY_CAT: CatDraft = { name: "", slug: "", description: "", image: "", emoji: "", sort_order: 0, active: true };
const EMPTY_SUB: SubDraft = { name: "", slug: "", description: "", sort_order: 0 };

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-sans text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function AdminCategorias() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Category modal
  const [catModal, setCatModal] = useState<{ mode: "add" | "edit"; cat?: Category } | null>(null);
  const [catDraft, setCatDraft] = useState<CatDraft>(EMPTY_CAT);
  const [savingCat, setSavingCat] = useState(false);
  const [deleteCatConfirm, setDeleteCatConfirm] = useState<string | null>(null);

  // Subcategory modal
  const [subModal, setSubModal] = useState<{ mode: "add" | "edit"; sub?: Subcategory } | null>(null);
  const [subDraft, setSubDraft] = useState<SubDraft>(EMPTY_SUB);
  const [savingSub, setSavingSub] = useState(false);
  const [deleteSubConfirm, setDeleteSubConfirm] = useState<string | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
        if (!selected && data.length > 0) setSelected(data[0].id);
      }
    } catch {
      showToast("Error al cargar categorías", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const selectedCat = categories.find((c) => c.id === selected) ?? null;

  // ── Category CRUD ────────────────────────────────────────────

  const openAddCat = () => {
    setCatDraft(EMPTY_CAT);
    setCatModal({ mode: "add" });
  };

  const openEditCat = (cat: Category) => {
    setCatDraft({ name: cat.name, slug: cat.slug, description: cat.description, image: cat.image, emoji: cat.emoji ?? "", sort_order: cat.sort_order, active: cat.active ?? true });
    setCatModal({ mode: "edit", cat });
  };

  const saveCat = async () => {
    if (!catDraft.name.trim()) return;
    setSavingCat(true);
    const slug = catDraft.slug || slugify(catDraft.name);
    try {
      if (catModal?.mode === "add") {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...catDraft, slug }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        showToast("Categoría creada");
        await loadCategories();
        setSelected(data.id);
      } else if (catModal?.cat) {
        const res = await fetch(`/api/admin/categories/${catModal.cat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...catDraft, slug }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        showToast("Categoría actualizada");
        await loadCategories();
      }
      setCatModal(null);
    } catch {
      showToast("Error al guardar categoría", "err");
    } finally {
      setSavingCat(false);
    }
  };

  const deleteCat = async (id: string) => {
    setDeleteCatConfirm(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showToast("Categoría eliminada");
      setSelected(null);
      await loadCategories();
    } catch {
      showToast("Error al eliminar categoría", "err");
    }
  };

  // ── Subcategory CRUD ─────────────────────────────────────────

  const openAddSub = () => {
    setSubDraft(EMPTY_SUB);
    setSubModal({ mode: "add" });
  };

  const openEditSub = (sub: Subcategory) => {
    setSubDraft({ name: sub.name, slug: sub.slug, description: sub.description, sort_order: sub.sort_order });
    setSubModal({ mode: "edit", sub });
  };

  const saveSub = async () => {
    if (!subDraft.name.trim() || !selected) return;
    setSavingSub(true);
    const slug = subDraft.slug || slugify(subDraft.name);
    try {
      if (subModal?.mode === "add") {
        const res = await fetch("/api/admin/subcategories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...subDraft, slug, category_id: selected }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        showToast("Subcategoría creada");
      } else if (subModal?.sub) {
        const res = await fetch(`/api/admin/subcategories/${subModal.sub.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...subDraft, slug }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        showToast("Subcategoría actualizada");
      }
      setSubModal(null);
      await loadCategories();
    } catch {
      showToast("Error al guardar subcategoría", "err");
    } finally {
      setSavingSub(false);
    }
  };

  const deleteSub = async (id: string) => {
    setDeleteSubConfirm(null);
    try {
      const res = await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showToast("Subcategoría eliminada");
      await loadCategories();
    } catch {
      showToast("Error al eliminar subcategoría", "err");
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="font-serif text-3xl md:text-4xl text-sage-800 font-semibold"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            Categorías
          </h1>
          <p className="font-sans text-sm text-gray-400 mt-1">
            Organizá las viandas en grupos y subcategorías
          </p>
        </div>
        <button
          onClick={openAddCat}
          className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nueva categoría
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-5 min-h-[500px]">

        {/* Left: Category list */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2">
          <p className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-medium px-1 mb-1">
            Categorías ({categories.length})
          </p>

          {categories.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Layers className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="font-sans text-sm text-gray-400">No hay categorías</p>
            </div>
          ) : (
            categories.map((cat) => (
              <motion.button
                key={cat.id}
                layout
                onClick={() => setSelected(cat.id)}
                className={cn(
                  "group w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2",
                  selected === cat.id
                    ? "bg-sage-500 border-sage-500 text-white shadow-md shadow-sage-200"
                    : "bg-white border-gray-100 text-gray-700 hover:border-sage-200 hover:shadow-sm"
                )}
              >
                <div className="min-w-0">
                  <p className={cn("font-sans text-sm font-semibold leading-snug truncate", selected === cat.id ? "text-white" : "text-gray-700")}>
                    {cat.emoji && <span className="mr-1.5">{cat.emoji}</span>}{cat.name}
                  </p>
                  <p className={cn("font-sans text-xs mt-0.5", selected === cat.id ? "text-white/70" : "text-gray-400")}>
                    {cat.subcategories.length} subcategoría{cat.subcategories.length !== 1 ? "s" : ""}
                    {!cat.active && <span className="ml-2 text-amber-400">· inactiva</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditCat(cat); }}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                      selected === cat.id
                        ? "text-white/70 hover:text-white hover:bg-white/20"
                        : "text-gray-400 hover:text-sage-600 hover:bg-sage-50"
                    )}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteCatConfirm(cat.id); }}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                      selected === cat.id
                        ? "text-white/70 hover:text-white hover:bg-white/20"
                        : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className={cn("w-4 h-4 ml-0.5 transition-colors", selected === cat.id ? "text-white" : "text-gray-300")} />
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Right: Subcategories panel */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {!selectedCat ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Layers className="w-10 h-10 text-gray-200 mb-3" />
              <p className="font-sans text-sm text-gray-400">Seleccioná una categoría para ver sus subcategorías</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="font-sans text-sm font-semibold text-gray-700">{selectedCat.name}</h2>
                  <p className="font-sans text-xs text-gray-400 mt-0.5">
                    {selectedCat.slug && <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400 mr-2">/{selectedCat.slug}</span>}
                    {selectedCat.description || "Sin descripción"}
                  </p>
                </div>
                <button
                  onClick={openAddSub}
                  className="flex items-center gap-1.5 bg-sage-50 hover:bg-sage-100 text-sage-700 font-sans text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva subcategoría
                </button>
              </div>

              {/* Subcategory list */}
              <div className="flex-1 overflow-y-auto">
                {selectedCat.subcategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Tag className="w-8 h-8 text-gray-200 mb-2" />
                    <p className="font-sans text-sm text-gray-400">Sin subcategorías</p>
                    <button onClick={openAddSub} className="mt-3 font-sans text-xs text-sage-500 hover:text-sage-700 transition-colors">
                      + Agregar la primera
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50 bg-gray-50/60">
                        {["Nombre", "Slug", "Descripción", "Orden", "Acciones"].map((h) => (
                          <th key={h} className="px-5 py-3 text-left font-sans text-[10px] uppercase tracking-wider text-gray-400 font-medium whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCat.subcategories.map((sub) => (
                        <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-sans text-sm font-semibold text-gray-700">{sub.name}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{sub.slug}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-sans text-xs text-gray-400 line-clamp-1 max-w-[180px]">{sub.description || "—"}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-sans text-xs text-gray-400">{sub.sort_order}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditSub(sub)}
                                className="p-2 rounded-lg text-gray-400 hover:text-sage-600 hover:bg-sage-50 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteSubConfirm(sub.id)}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Category Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {catModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCatModal(null)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <h2
                    className="font-serif text-2xl text-sage-800 font-semibold"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                  >
                    {catModal.mode === "add" ? "Nueva categoría" : "Editar categoría"}
                  </h2>
                  <button onClick={() => setCatModal(null)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                  <ModalField label="Nombre *">
                    <input
                      value={catDraft.name}
                      onChange={(e) => setCatDraft((d) => ({ ...d, name: e.target.value, slug: d.slug || slugify(e.target.value) }))}
                      className="input-admin"
                      placeholder="Ej: Viandas Congeladas"
                    />
                  </ModalField>
                  <ModalField label="Slug (URL)">
                    <input
                      value={catDraft.slug}
                      onChange={(e) => setCatDraft((d) => ({ ...d, slug: slugify(e.target.value) }))}
                      className="input-admin font-mono text-sm"
                      placeholder="viandas-congeladas"
                    />
                  </ModalField>
                  <ModalField label="Descripción">
                    <textarea
                      value={catDraft.description}
                      rows={2}
                      onChange={(e) => setCatDraft((d) => ({ ...d, description: e.target.value }))}
                      className="input-admin resize-none"
                      placeholder="Descripción breve"
                    />
                  </ModalField>
                  <div className="grid grid-cols-2 gap-4">
                    <ModalField label="Emoji">
                      <input
                        value={catDraft.emoji}
                        onChange={(e) => setCatDraft((d) => ({ ...d, emoji: e.target.value }))}
                        className="input-admin"
                        placeholder="❄️"
                      />
                    </ModalField>
                    <ModalField label="Orden">
                      <input
                        type="number"
                        value={catDraft.sort_order}
                        onChange={(e) => setCatDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))}
                        className="input-admin"
                        placeholder="0"
                      />
                    </ModalField>
                  </div>
                  <ModalField label="Imagen (URL)">
                    <input
                      value={catDraft.image}
                      onChange={(e) => setCatDraft((d) => ({ ...d, image: e.target.value }))}
                      className="input-admin"
                      placeholder="https://..."
                    />
                  </ModalField>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catDraft.active}
                      onChange={(e) => setCatDraft((d) => ({ ...d, active: e.target.checked }))}
                      className="w-4 h-4 accent-sage-500 rounded"
                    />
                    <span className="font-sans text-sm text-gray-600">Categoría activa</span>
                  </label>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button onClick={() => setCatModal(null)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 font-sans text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={saveCat} disabled={savingCat}
                    className="flex-1 py-3 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-sans text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-60">
                    {savingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {savingCat ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Subcategory Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {subModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSubModal(null)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <h2
                    className="font-serif text-2xl text-sage-800 font-semibold"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                  >
                    {subModal.mode === "add" ? "Nueva subcategoría" : "Editar subcategoría"}
                  </h2>
                  <button onClick={() => setSubModal(null)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                  {selectedCat && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-sage-50 rounded-lg">
                      <Layers className="w-3.5 h-3.5 text-sage-500" />
                      <span className="font-sans text-xs text-sage-700 font-medium">{selectedCat.name}</span>
                    </div>
                  )}
                  <ModalField label="Nombre *">
                    <input
                      value={subDraft.name}
                      onChange={(e) => setSubDraft((d) => ({ ...d, name: e.target.value, slug: d.slug || slugify(e.target.value) }))}
                      className="input-admin"
                      placeholder="Ej: Pollo"
                    />
                  </ModalField>
                  <ModalField label="Slug (URL)">
                    <input
                      value={subDraft.slug}
                      onChange={(e) => setSubDraft((d) => ({ ...d, slug: slugify(e.target.value) }))}
                      className="input-admin font-mono text-sm"
                      placeholder="pollo"
                    />
                  </ModalField>
                  <ModalField label="Descripción">
                    <textarea
                      value={subDraft.description}
                      rows={2}
                      onChange={(e) => setSubDraft((d) => ({ ...d, description: e.target.value }))}
                      className="input-admin resize-none"
                      placeholder="Descripción breve"
                    />
                  </ModalField>
                  <ModalField label="Orden">
                    <input
                      type="number"
                      value={subDraft.sort_order}
                      onChange={(e) => setSubDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))}
                      className="input-admin"
                      placeholder="0"
                    />
                  </ModalField>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button onClick={() => setSubModal(null)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 font-sans text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={saveSub} disabled={savingSub}
                    className="flex-1 py-3 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-sans text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-60">
                    {savingSub ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {savingSub ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete Category Confirm ───────────────────────────── */}
      <AnimatePresence>
        {deleteCatConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteCatConfirm(null)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="font-sans font-semibold text-gray-700 text-lg mb-2">¿Eliminar categoría?</h3>
                <p className="font-sans text-sm text-gray-400 mb-6">Se eliminarán también todas sus subcategorías. Esta acción no se puede deshacer.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteCatConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 font-sans text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={() => deleteCat(deleteCatConfirm)}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-sans text-sm font-semibold transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete Subcategory Confirm ────────────────────────── */}
      <AnimatePresence>
        {deleteSubConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteSubConfirm(null)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="font-sans font-semibold text-gray-700 text-lg mb-2">¿Eliminar subcategoría?</h3>
                <p className="font-sans text-sm text-gray-400 mb-6">Esta acción no se puede deshacer.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteSubConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 font-sans text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={() => deleteSub(deleteSubConfirm)}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-sans text-sm font-semibold transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Toast ─────────────────────────────────────────────── */}
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
