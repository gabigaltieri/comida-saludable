"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Combo, Product } from "@/lib/data";
import { getAllCombos, createCombo, updateCombo, deleteCombo, getProducts } from "@/lib/db";
import { formatPrice } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus, Pencil, Trash2, X, CheckCircle2, XCircle,
  Save, Loader2, Gift, ImageIcon, Upload, Tag,
} from "lucide-react";

type ComboDraft = Omit<Combo, "id">;

const EMPTY_DRAFT: ComboDraft = {
  name: "",
  description: "",
  price: 0,
  image: "",
  imageAlt: "",
  product_ids: [],
  available: true,
};

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Combo | null>(null);
  const [draft, setDraft] = useState<ComboDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([getAllCombos(), getProducts()])
      .then(([combosData, productsData]) => {
        setCombos(combosData);
        setProducts(productsData);
      })
      .catch((err) => console.error("Error cargando datos:", err))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setModalOpen(true);
  };

  const openEdit = (combo: Combo) => {
    setEditing(combo);
    setDraft({
      name: combo.name,
      description: combo.description,
      price: combo.price,
      image: combo.image,
      imageAlt: combo.imageAlt,
      product_ids: combo.product_ids,
      available: combo.available,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setDraft(EMPTY_DRAFT);
  };

  const toggleProduct = (id: string) => {
    setDraft((d) => ({
      ...d,
      product_ids: d.product_ids.includes(id)
        ? d.product_ids.filter((p) => p !== id)
        : [...d.product_ids, id],
    }));
  };

  const handleUploadImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "product-images");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Error al subir imagen");
      const { url } = await res.json();
      setDraft((d) => ({ ...d, image: url, imageAlt: d.imageAlt || d.name }));
    } catch {
      setFeedback({ type: "err", msg: "Error al subir la imagen" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!draft.name.trim() || !draft.price) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateCombo(editing.id, draft);
        setCombos((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
        setFeedback({ type: "ok", msg: "Combo actualizado" });
      } else {
        const created = await createCombo(draft);
        setCombos((prev) => [...prev, created]);
        setFeedback({ type: "ok", msg: "Combo creado" });
      }
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar el combo";
      console.error("Error guardando combo:", err);
      setFeedback({ type: "err", msg });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este combo?")) return;
    setDeleting(id);
    try {
      await deleteCombo(id);
      setCombos((prev) => prev.filter((c) => c.id !== id));
      setFeedback({ type: "ok", msg: "Combo eliminado" });
    } catch {
      setFeedback({ type: "err", msg: "Error al eliminar" });
    } finally {
      setDeleting(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      const updated = await updateCombo(id, { available: !current });
      setCombos((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      setFeedback({ type: "err", msg: "Error al actualizar estado" });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const includedProducts = (combo: Combo) => products.filter((p) => combo.product_ids.includes(p.id));

  const originalPrice = (combo: Combo) =>
    includedProducts(combo).reduce((sum, p) => sum + p.price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-sage-800 font-semibold"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
            Combos
          </h1>
          <p className="font-sans text-sm text-sage-400 mt-0.5">
            {combos.length} {combos.length === 1 ? "combo" : "combos"}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo combo
        </button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-xl mb-6 font-sans text-sm font-medium",
              feedback.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            )}
          >
            {feedback.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {feedback.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {combos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-amber-300" />
          </div>
          <p className="font-serif text-2xl text-sage-600 mb-1" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
            Sin combos todavía
          </p>
          <p className="font-sans text-sm text-sage-400 mb-6">Creá el primer combo para mostrarlo en la tienda</p>
          <button onClick={openCreate} className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-sans text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
            Crear combo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combos.map((combo) => {
            const orig = originalPrice(combo);
            const savings = orig > combo.price ? orig - combo.price : 0;
            const included = includedProducts(combo);
            return (
              <div key={combo.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0">
                    {combo.image ? (
                      <Image src={combo.image} alt={combo.imageAlt || combo.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gift className="w-8 h-8 text-amber-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-serif text-sage-800 font-semibold text-lg leading-snug"
                        style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                        {combo.name}
                      </p>
                      <button
                        onClick={() => handleToggle(combo.id, combo.available)}
                        className={cn(
                          "flex-shrink-0 w-8 h-5 rounded-full transition-colors",
                          combo.available ? "bg-sage-500" : "bg-gray-200"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full shadow-sm transition-transform mx-0.5",
                          combo.available ? "translate-x-3" : "translate-x-0"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-sans text-sage-700 font-semibold text-base">{formatPrice(combo.price)}</span>
                      {savings > 0 && (
                        <span className="font-sans text-xs text-green-600 flex items-center gap-0.5">
                          <Tag className="w-3 h-3" />
                          Ahorro {formatPrice(savings)}
                        </span>
                      )}
                    </div>

                    {included.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {included.map((p) => (
                          <span key={p.id} className="font-sans text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-gray-50">
                  <button
                    onClick={() => openEdit(combo)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-sans text-xs text-sage-500 hover:text-sage-700 hover:bg-sage-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <div className="w-px bg-gray-50" />
                  <button
                    onClick={() => handleDelete(combo.id)}
                    disabled={deleting === combo.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-sans text-xs text-sage-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deleting === combo.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <h2 className="font-serif text-2xl text-sage-800 font-semibold"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                    {editing ? "Editar combo" : "Nuevo combo"}
                  </h2>
                  <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-6 py-5 flex flex-col gap-5">
                  {/* Name */}
                  <div>
                    <label className="block font-sans text-xs font-medium text-sage-500 uppercase tracking-wider mb-1.5">Nombre *</label>
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Ej: Combo Semana Saludable"
                      className="w-full rounded-xl border border-sage-200 px-4 py-3 font-sans text-sm text-sage-700 placeholder:text-sage-300 focus:outline-none focus:border-sage-400 transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-sans text-xs font-medium text-sage-500 uppercase tracking-wider mb-1.5">Descripción</label>
                    <textarea
                      value={draft.description}
                      onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                      placeholder="Descripción del combo..."
                      rows={2}
                      className="w-full rounded-xl border border-sage-200 px-4 py-3 font-sans text-sm text-sage-700 placeholder:text-sage-300 focus:outline-none focus:border-sage-400 transition-colors resize-none"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block font-sans text-xs font-medium text-sage-500 uppercase tracking-wider mb-1.5">Precio combo *</label>
                    <input
                      type="number"
                      value={draft.price || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                      placeholder="Ej: 8500"
                      className="w-full rounded-xl border border-sage-200 px-4 py-3 font-sans text-sm text-sage-700 placeholder:text-sage-300 focus:outline-none focus:border-sage-400 transition-colors"
                    />
                  </div>

                  {/* Image upload */}
                  <div>
                    <label className="block font-sans text-xs font-medium text-sage-500 uppercase tracking-wider mb-1.5">Imagen</label>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0])}
                    />
                    {draft.image ? (
                      <div className="relative w-full h-36 rounded-xl overflow-hidden border border-sage-200 group">
                        <Image src={draft.image} alt="preview" fill className="object-cover" sizes="100vw" />
                        <button
                          type="button"
                          onClick={() => setDraft((d) => ({ ...d, image: "" }))}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="w-full h-24 rounded-xl border-2 border-dashed border-sage-200 hover:border-sage-400 flex flex-col items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {uploadingImage ? (
                          <Loader2 className="w-5 h-5 text-sage-400 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-sage-300" />
                            <span className="font-sans text-xs text-sage-400">Subir imagen</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Products selector */}
                  <div>
                    <label className="block font-sans text-xs font-medium text-sage-500 uppercase tracking-wider mb-1.5">
                      Productos incluidos
                      {draft.product_ids.length > 0 && (
                        <span className="ml-2 normal-case text-sage-400">
                          ({draft.product_ids.length} seleccionados — precio individual: {formatPrice(
                            products.filter((p) => draft.product_ids.includes(p.id)).reduce((s, p) => s + p.price, 0)
                          )})
                        </span>
                      )}
                    </label>
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto border border-sage-100 rounded-xl p-2">
                      {products.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleProduct(p.id)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                            draft.product_ids.includes(p.id)
                              ? "bg-amber-50 border border-amber-200"
                              : "hover:bg-gray-50 border border-transparent"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                            draft.product_ids.includes(p.id) ? "bg-amber-500 border-amber-500" : "border-gray-300"
                          )}>
                            {draft.product_ids.includes(p.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                          </div>
                          <span className="font-sans text-sm text-sage-700 flex-1 truncate">{p.name}</span>
                          <span className="font-sans text-xs text-sage-400 flex-shrink-0">{formatPrice(p.price)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Savings preview */}
                  {draft.product_ids.length > 0 && draft.price > 0 && (() => {
                    const orig = products.filter((p) => draft.product_ids.includes(p.id)).reduce((s, p) => s + p.price, 0);
                    const sav = orig - draft.price;
                    return sav > 0 ? (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                        <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <p className="font-sans text-sm text-green-700">
                          El cliente ahorra <strong>{formatPrice(sav)}</strong> vs. comprar por separado
                        </p>
                      </div>
                    ) : sav < 0 ? (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <p className="font-sans text-sm text-amber-700">
                          ⚠️ El precio del combo es mayor al precio individual ({formatPrice(orig)})
                        </p>
                      </div>
                    ) : null;
                  })()}

                  {/* Available toggle */}
                  <div className="flex items-center justify-between">
                    <label className="font-sans text-sm text-sage-700 font-medium">Disponible en tienda</label>
                    <button
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, available: !d.available }))}
                      className={cn("w-10 h-6 rounded-full transition-colors", draft.available ? "bg-sage-500" : "bg-gray-200")}
                    >
                      <div className={cn("w-5 h-5 bg-white rounded-full shadow-sm transition-transform mx-0.5", draft.available ? "translate-x-4" : "translate-x-0")} />
                    </button>
                  </div>
                </div>

                {/* Error dentro del modal */}
                <AnimatePresence>
                  {feedback?.type === "err" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mx-6 mb-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 border border-red-200 font-sans text-sm"
                    >
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      {feedback.msg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Modal footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 rounded-xl border border-sage-200 font-sans text-sm text-sage-600 hover:bg-sage-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !draft.name.trim() || !draft.price}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-sans text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editing ? "Guardar cambios" : "Crear combo"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
