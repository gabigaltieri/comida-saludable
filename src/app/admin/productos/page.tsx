"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { CATEGORIES, Product, CategoryId } from "@/lib/data";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/db";
import { formatPrice } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, Pencil, Trash2, X, Search, CheckCircle2,
  XCircle, Package, Save, Loader2, GripVertical, ImageIcon, Upload,
  Download, FileUp,
} from "lucide-react";

type ProductDraft = Omit<Product, "id">;

const EMPTY_DRAFT: ProductDraft = {
  name: "",
  description: "",
  price: 0,
  category: "viandas-diarias",
  image: "",
  image2: "",
  image3: "",
  imageAlt: "",
  tags: [],
  featured: false,
  available: true,
};

// ── Fila sortable ────────────────────────────────────────────

function SortableRow({
  product,
  onEdit,
  onDelete,
  onToggle,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const cat = CATEGORIES.find((c) => c.id === product.category);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors bg-white"
    >
      {/* Drag handle */}
      <td className="pl-3 pr-1 py-3.5 w-8">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 transition-colors flex items-center justify-center"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-cover" sizes="44px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>
          <div>
            <p className="font-sans text-sm font-semibold text-gray-700 leading-snug">{product.name}</p>
            <p className="font-sans text-xs text-gray-400 line-clamp-1 max-w-[200px]">{product.description}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="font-sans text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
          {cat?.emoji} {cat?.shortName}
        </span>
      </td>
      <td className="px-4 py-3.5 font-sans text-sm font-semibold text-gray-700 whitespace-nowrap">
        {formatPrice(product.price)}
      </td>
      <td className="px-4 py-3.5">
        <button
          onClick={() => onToggle(product.id, product.available)}
          className={cn(
            "inline-flex items-center gap-1.5 font-sans text-xs font-medium px-2.5 py-1 rounded-full transition-colors",
            product.available
              ? "bg-sage-100 text-sage-700 hover:bg-sage-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          )}
        >
          {product.available
            ? <><CheckCircle2 className="w-3 h-3" />Activo</>
            : <><XCircle className="w-3 h-3" />Inactivo</>}
        </button>
      </td>
      <td className="px-4 py-3.5">
        <span className={cn("font-sans text-xs px-2 py-0.5 rounded-full", product.featured ? "bg-amber-100 text-amber-700" : "text-gray-300")}>
          {product.featured ? "⭐ Sí" : "—"}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(product)}
            className="p-2 rounded-lg text-gray-400 hover:text-sage-600 hover:bg-sage-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Zona de imagen con drag & drop ──────────────────────────

function ImageDropZone({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [draggingOver, setDraggingOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden",
          draggingOver
            ? "border-sage-400 bg-sage-50"
            : "border-gray-200 hover:border-sage-300 hover:bg-gray-50"
        )}
        style={{ height: 120 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
        />

        {value ? (
          <>
            <Image src={value} alt="Preview" fill className="object-cover" sizes="480px" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <p className="font-sans text-xs text-white font-medium flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Cambiar imagen
              </p>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-sage-400" />
            ) : (
              <>
                <ImageIcon className="w-7 h-7" />
                <p className="font-sans text-xs text-center px-4">
                  {draggingOver ? "Soltá la imagen aquí" : "Arrastrá una imagen o hacé click para subir"}
                </p>
              </>
            )}
          </div>
        )}

        {uploading && value && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* URL manual como fallback */}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-admin text-xs"
        placeholder="O pegá una URL de imagen directamente"
      />
    </div>
  );
}

// ── Página principal ────────────────────────────────────────

type TagItem = { id: number; name: string; color: string };

export default function AdminProductos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; product?: Product } | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    Promise.all([
      getProducts(),
      fetch("/api/admin/tags").then((r) => r.json()),
    ])
      .then(([prods, tags]) => {
        setProducts(prods);
        if (Array.isArray(tags)) setAvailableTags(tags);
      })
      .catch(() => showToast("Error al cargar datos", "err"))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const openAdd = () => { setDraft(EMPTY_DRAFT); setModal({ mode: "add" }); };
  const openEdit = (p: Product) => { setDraft({ ...p }); setModal({ mode: "edit", product: p }); };

  const saveProduct = async () => {
    if (!draft.name.trim() || !draft.price) return;
    setSaving(true);
    try {
      if (modal?.mode === "add") {
        await createProduct(draft);
        const fresh = await getProducts();
        setProducts(fresh);
        showToast("Producto creado correctamente");
      } else if (modal?.product) {
        const updated = await updateProduct(modal.product.id, draft);
        setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
        showToast("Producto actualizado");
      }
      setModal(null);
    } catch {
      showToast("Error al guardar el producto", "err");
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailable = async (id: string, current: boolean) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, available: !current } : p));
    try {
      await updateProduct(id, { available: !current });
    } catch {
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, available: current } : p));
      showToast("Error al actualizar estado", "err");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteProduct(id);
      showToast("Producto eliminado");
    } catch {
      showToast("Error al eliminar", "err");
      getProducts().then(setProducts);
    }
  };

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(products, oldIndex, newIndex);
    setProducts(reordered);

    setSavingOrder(true);
    try {
      await fetch("/api/admin/products/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: reordered.map((p) => p.id) }),
      });
    } finally {
      setSavingOrder(false);
    }
  }, [products]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/products/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `262-productos-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Error al exportar", "err");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/products/import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error);
      const msg = `Importado: ${data.created} creados, ${data.updated} actualizados${data.errors?.length ? ` (${data.errors.length} errores)` : ""}`;
      showToast(msg, data.errors?.length ? "err" : "ok");
      const fresh = await getProducts();
      setProducts(fresh);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error al importar", "err");
    } finally {
      setImporting(false);
    }
  };

  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.includes(search.toLowerCase())
      )
    : products;

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
          <h1 className="font-serif text-3xl md:text-4xl text-sage-800 font-semibold"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
            Productos
          </h1>
          <p className="font-sans text-sm text-gray-400 mt-1">
            {products.length} productos en total
            {savingOrder && <span className="ml-2 text-sage-400">· Guardando orden...</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Input oculto para importar */}
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 border border-sage-300 text-sage-700 hover:bg-sage-50 font-sans font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60 bg-white"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Exportar Excel
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 border border-sage-300 text-sage-700 hover:bg-sage-50 font-sans font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60 bg-white"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
            Importar Excel
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Nuevo producto
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o categoría..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-sans text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-sage-400 transition-colors" />
      </div>

      {!search && (
        <p className="font-sans text-xs text-gray-400 mb-3 flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5" />
          Arrastrá las filas para cambiar el orden en la tienda
        </p>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="w-8" />
                {["Producto", "Categoría", "Precio", "Estado", "Destacado", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-sans text-[11px] uppercase tracking-wider text-gray-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {search ? (
                // Sin drag cuando hay búsqueda activa
                <>
                  {filtered.map((p) => (
                    <SortableRow
                      key={p.id}
                      product={p}
                      onEdit={openEdit}
                      onDelete={setDeleteConfirm}
                      onToggle={toggleAvailable}
                    />
                  ))}
                </>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={products.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {products.map((p) => (
                      <SortableRow
                        key={p.id}
                        product={p}
                        onEdit={openEdit}
                        onDelete={setDeleteConfirm}
                        onToggle={toggleAvailable}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="font-sans text-sm text-gray-400">Sin resultados</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear/editar */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModal(null)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <h2 className="font-serif text-2xl text-sage-800 font-semibold"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                    {modal.mode === "add" ? "Nuevo producto" : "Editar producto"}
                  </h2>
                  <button onClick={() => setModal(null)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                  <ModalField label="Nombre *">
                    <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      className="input-admin" placeholder="Ej: Bowl de Pollo al Limón" />
                  </ModalField>
                  <ModalField label="Descripción">
                    <textarea value={draft.description} rows={2}
                      onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                      className="input-admin resize-none" placeholder="Descripción breve del producto" />
                  </ModalField>
                  <div className="grid grid-cols-2 gap-4">
                    <ModalField label="Precio (ARS) *">
                      <input type="number" value={draft.price || ""}
                        onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                        className="input-admin" placeholder="3200" />
                    </ModalField>
                    <ModalField label="Categoría">
                      <select value={draft.category}
                        onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as CategoryId }))}
                        className="input-admin">
                        {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </ModalField>
                  </div>
                  <ModalField label="Foto principal">
                    <ImageDropZone
                      value={draft.image}
                      onChange={(url) => setDraft((d) => ({ ...d, image: url }))}
                    />
                  </ModalField>
                  <div className="grid grid-cols-2 gap-4">
                    <ModalField label="Foto 2 (opcional)">
                      <ImageDropZone
                        value={draft.image2 ?? ""}
                        onChange={(url) => setDraft((d) => ({ ...d, image2: url }))}
                      />
                    </ModalField>
                    <ModalField label="Foto 3 (opcional)">
                      <ImageDropZone
                        value={draft.image3 ?? ""}
                        onChange={(url) => setDraft((d) => ({ ...d, image3: url }))}
                      />
                    </ModalField>
                  </div>
                  <ModalField label="Etiquetas">
                    {availableTags.length === 0 ? (
                      <p className="font-sans text-xs text-gray-400 italic">
                        No hay etiquetas creadas. Creá algunas en{" "}
                        <a href="/admin/tags" target="_blank" className="underline text-sage-500">Etiquetas</a>.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => {
                          const selected = draft.tags.includes(tag.name);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() =>
                                setDraft((d) => ({
                                  ...d,
                                  tags: selected
                                    ? d.tags.filter((t) => t !== tag.name)
                                    : [...d.tags, tag.name],
                                }))
                              }
                              className="font-sans text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all"
                              style={
                                selected
                                  ? { background: tag.color, color: "white", borderColor: tag.color }
                                  : { background: tag.color + "18", color: tag.color, borderColor: tag.color + "55" }
                              }
                            >
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </ModalField>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={draft.available}
                        onChange={(e) => setDraft((d) => ({ ...d, available: e.target.checked }))}
                        className="w-4 h-4 accent-sage-500 rounded" />
                      <span className="font-sans text-sm text-gray-600">Disponible</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!draft.featured}
                        onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
                        className="w-4 h-4 accent-sage-500 rounded" />
                      <span className="font-sans text-sm text-gray-600">Destacado</span>
                    </label>
                  </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button onClick={() => setModal(null)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 font-sans text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={saveProduct} disabled={saving}
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
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="font-sans font-semibold text-gray-700 text-lg mb-2">¿Eliminar producto?</h3>
                <p className="font-sans text-sm text-gray-400 mb-6">Esta acción no se puede deshacer.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 font-sans text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={() => handleDelete(deleteConfirm)}
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

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-sans text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}
