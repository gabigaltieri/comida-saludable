"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ImageIcon, Upload, Trash2, Save, Loader2,
  CheckCircle2, XCircle, Info, Eye, EyeOff,
} from "lucide-react";

type Banner = { id: string; image_url: string | null; active: boolean };

const SPECS = [
  { label: "Tamaño mínimo", value: "1200 × 400 px" },
  { label: "Tamaño recomendado", value: "1920 × 600 px" },
  { label: "Relación de aspecto", value: "3:1 (horizontal)" },
  { label: "Formatos aceptados", value: "JPG, PNG, WebP" },
  { label: "Peso máximo", value: "3 MB" },
];

export default function AdminBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/admin/banner")
      .then((r) => r.json())
      .then((d) => setBanner(d))
      .finally(() => setLoading(false));
  }, []);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Solo se aceptan imágenes (JPG, PNG, WebP)", "err");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast("La imagen supera el límite de 3 MB", "err");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBanner((b) => b ? { ...b, image_url: data.url } : b);
      showToast("Imagen cargada — guardá los cambios");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error al subir imagen", "err");
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const save = async () => {
    if (!banner) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banner", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: banner.image_url, active: banner.active }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBanner(data);
      showToast("Banner guardado correctamente");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error al guardar", "err");
    } finally {
      setSaving(false);
    }
  };

  const clearImage = () => {
    setBanner((b) => b ? { ...b, image_url: null } : b);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="font-serif text-3xl text-sage-800"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            Banner de la tienda
          </h1>
          <p className="font-sans text-sm text-sage-500 mt-0.5">
            Imagen principal que aparece en el hero de /tienda
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBanner((b) => b ? { ...b, active: !b.active } : b)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-sans text-sm font-medium border transition-colors ${
              banner?.active
                ? "bg-sage-50 text-sage-600 border-sage-200 hover:bg-sage-100"
                : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {banner?.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {banner?.active ? "Visible" : "Oculto"}
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

      {/* Specs */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-sans text-sm font-semibold text-blue-700 mb-2">
            Especificaciones recomendadas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            {SPECS.map(({ label, value }) => (
              <div key={label} className="flex gap-2 font-sans text-sm">
                <span className="text-blue-400 flex-shrink-0">{label}:</span>
                <span className="text-blue-700 font-medium">{value}</span>
              </div>
            ))}
          </div>
          <p className="font-sans text-xs text-blue-400 mt-2">
            La imagen se superpone con una capa oscura semi-transparente para mantener legible el texto del hero.
          </p>
        </div>
      </div>

      {/* Current image / upload zone */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="font-sans text-sm font-semibold text-gray-600">Imagen actual</p>
          {banner?.image_url && (
            <button
              onClick={clearImage}
              className="flex items-center gap-1.5 font-sans text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Quitar imagen
            </button>
          )}
        </div>

        {banner?.image_url ? (
          <div className="relative w-full" style={{ aspectRatio: "3/1" }}>
            <Image
              src={banner.image_url}
              alt="Banner actual"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 bg-white text-gray-700 font-sans text-sm font-medium px-4 py-2 rounded-full shadow"
              >
                <Upload className="w-4 h-4" />
                Cambiar imagen
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center py-16 px-6 cursor-pointer transition-colors ${
              dragOver ? "bg-sage-50" : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {uploading ? (
              <Loader2 className="w-10 h-10 text-sage-400 animate-spin mb-3" />
            ) : (
              <ImageIcon className={`w-10 h-10 mb-3 ${dragOver ? "text-sage-400" : "text-gray-300"}`} />
            )}
            <p className="font-sans text-sm font-medium text-gray-500 mb-1">
              {uploading ? "Subiendo imagen..." : "Arrastrá una imagen o hacé click"}
            </p>
            <p className="font-sans text-xs text-gray-400">JPG, PNG o WebP · Máx. 3 MB · Mín. 1200 × 400 px</p>
          </div>
        )}
      </div>

      {/* Upload button if image exists */}
      {banner?.image_url && (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 w-full justify-center py-3 rounded-xl border-2 border-dashed border-gray-200 font-sans text-sm text-gray-400 hover:border-sage-300 hover:text-sage-500 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Subiendo..." : "Subir nueva imagen"}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

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
            {toast.type === "ok"
              ? <CheckCircle2 className="w-4 h-4 text-sage-300" />
              : <XCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
