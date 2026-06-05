"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, CheckCircle2, Snowflake, Plus, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/cart";

type ViandasCombo = {
  id: string;
  size: number;
  price: number;
  badge: string;
  category: string;
  updated_at: string;
};

function ComboEditor({
  combo,
  onSave,
  onDelete,
}: {
  combo: ViandasCombo;
  onSave: (id: string, price: number, size: number, badge: string, category: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [price, setPrice] = useState(String(combo.price));
  const [size, setSize] = useState(String(combo.size));
  const [badge, setBadge] = useState(combo.badge);
  const [category, setCategory] = useState(combo.category || "viandas");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty =
    String(price) !== String(combo.price) ||
    String(size) !== String(combo.size) ||
    badge !== combo.badge ||
    category !== (combo.category || "viandas");

  async function handleSave() {
    setSaving(true);
    await onSave(combo.id, Number(price), Number(size), badge, category);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleDelete() {
    setDeleting(true);
    await onDelete(combo.id);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-6 relative" style={{ background: "#1a3325" }}>
        <Snowflake className="absolute top-4 right-4 w-5 h-5 text-white/15" />
        <p className="font-sans text-white/50 text-xs uppercase tracking-widest mb-1">{badge}</p>
        <p className="font-serif text-white font-light leading-none"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: "3rem" }}>
          ×{size}
        </p>
        <p className="font-sans text-white/40 text-xs mt-1">viandas congeladas</p>
        <p className="font-sans text-white font-semibold text-xl mt-2">{formatPrice(Number(price))}</p>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block font-sans text-xs uppercase tracking-wider text-sage-500 mb-1.5">Unidades del combo</label>
          <input type="number" value={size} onChange={(e) => setSize(e.target.value)} min={1}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-sans text-sm text-gray-700 focus:outline-none focus:border-sage-400 transition-colors" />
        </div>
        <div>
          <label className="block font-sans text-xs uppercase tracking-wider text-sage-500 mb-1.5">Precio (ARS, sin puntos)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={0}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-sans text-sm text-gray-700 focus:outline-none focus:border-sage-400 transition-colors" />
          <p className="font-sans text-xs text-sage-400 mt-1">Precio visible: {formatPrice(Number(price) || 0)}</p>
        </div>
        <div>
          <label className="block font-sans text-xs uppercase tracking-wider text-sage-500 mb-1.5">Etiqueta del combo</label>
          <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-sans text-sm text-gray-700 focus:outline-none focus:border-sage-400 transition-colors"
            placeholder="Ej: Ideal para la semana" />
        </div>

        <div>
          <label className="block font-sans text-xs uppercase tracking-wider text-sage-500 mb-1.5">Tipo de combo</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-sans text-sm text-gray-700 focus:outline-none focus:border-sage-400 transition-colors bg-white">
            <option value="viandas">Viandas Congeladas</option>
            <option value="tartas">Tartas</option>
          </select>
        </div>

        <button onClick={handleSave} disabled={saving || !dirty}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: saved ? "#547d54" : "#1a3325", color: "white" }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> :
           saved ? <><CheckCircle2 className="w-4 h-4" /> Guardado</> :
           <><Save className="w-4 h-4" /> Guardar cambios</>}
        </button>

        {/* Eliminar */}
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-sans text-sm text-red-400 hover:bg-red-50 border border-red-100 transition-colors">
            <Trash2 className="w-4 h-4" /> Eliminar combo
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-sans text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Confirmar
            </button>
            <button onClick={() => setConfirmDelete(false)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-sans text-sm text-sage-600 border border-sage-200 hover:bg-sage-50 transition-colors">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NuevoComboForm({ onCreated }: { onCreated: (combo: ViandasCombo) => void }) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [badge, setBadge] = useState("");
  const [category, setCategory] = useState("viandas");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!size || !price || !badge) { setError("Completá todos los campos"); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/viandas-combos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size: Number(size), price: Number(price), badge, category }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { onCreated(data); setOpen(false); setSize(""); setPrice(""); setBadge(""); setCategory("viandas"); }
    else setError(data.error ?? "Error al crear");
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-5 py-3 rounded-2xl font-sans text-sm font-medium text-white transition-all hover:-translate-y-0.5"
      style={{ background: "#1a3325" }}>
      <Plus className="w-4 h-4" /> Agregar combo
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-serif text-xl text-sage-800 font-semibold"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
          Nuevo combo
        </h3>
        <button onClick={() => setOpen(false)} className="text-sage-400 hover:text-sage-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className="block font-sans text-xs uppercase tracking-wider text-sage-500 mb-1.5">Unidades</label>
        <input type="number" value={size} onChange={(e) => setSize(e.target.value)} min={1} placeholder="Ej: 15"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-sans text-sm focus:outline-none focus:border-sage-400 transition-colors" />
      </div>
      <div>
        <label className="block font-sans text-xs uppercase tracking-wider text-sage-500 mb-1.5">Precio (ARS)</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={0} placeholder="Ej: 120000"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-sans text-sm focus:outline-none focus:border-sage-400 transition-colors" />
        {price && <p className="font-sans text-xs text-sage-400 mt-1">{formatPrice(Number(price))}</p>}
      </div>
      <div>
        <label className="block font-sans text-xs uppercase tracking-wider text-sage-500 mb-1.5">Etiqueta</label>
        <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="Ej: Ahorro máximo"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-sans text-sm focus:outline-none focus:border-sage-400 transition-colors" />
      </div>
      <div>
        <label className="block font-sans text-xs uppercase tracking-wider text-sage-500 mb-1.5">Tipo de combo</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-sans text-sm text-gray-700 focus:outline-none focus:border-sage-400 transition-colors bg-white">
          <option value="viandas">Viandas Congeladas</option>
          <option value="tartas">Tartas</option>
        </select>
      </div>

      {error && <p className="font-sans text-xs text-red-500">{error}</p>}

      <button onClick={handleCreate} disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-sm font-medium text-white transition-all disabled:opacity-50"
        style={{ background: "#1a3325" }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Crear combo</>}
      </button>
    </div>
  );
}

export default function ViandasCombosAdminPage() {
  const [combos, setCombos] = useState<ViandasCombo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/viandas-combos")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCombos(data); else setError("No se pudieron cargar"); })
      .catch(() => setError("Error de conexión"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(id: string, price: number, size: number, badge: string, category: string) {
    const res = await fetch("/api/admin/viandas-combos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, price, size, badge, category }),
    });
    const data = await res.json();
    if (res.ok) setCombos((prev) => prev.map((c) => (c.id === id ? data : c)));
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/admin/viandas-combos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setCombos((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl text-sage-800 font-semibold mb-1"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
            Combos de Viandas
          </h1>
          <p className="font-sans text-sm text-sage-500">
            Cambios en precio, unidades o etiqueta se reflejan en toda la web al instante.
          </p>
        </div>
        <NuevoComboForm onCreated={(combo) => setCombos((prev) => [...prev, combo].sort((a, b) => a.size - b.size))} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-sage-400 animate-spin" /></div>
      ) : error ? (
        <p className="font-sans text-sm text-red-500 bg-red-50 rounded-xl p-4">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((combo) => (
            <ComboEditor key={combo.id} combo={combo} onSave={handleSave} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
