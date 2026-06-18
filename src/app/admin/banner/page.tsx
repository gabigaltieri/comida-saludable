"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ImageIcon, Upload, Trash2, Save, Loader2,
  CheckCircle2, XCircle, Info, Eye, EyeOff,
} from "lucide-react";

type Banner = { id: string; image_url: string | null; mobile_image_url: string | null; active: boolean; heading_text: string | null; subheading_text: string | null; heading_color: string | null; subheading_color: string | null };

const TEXT_COLORS = [
  { label: "Blanco", value: "#FFFFFF" },
  { label: "Crema", value: "#F5EFE0" },
  { label: "Dorado", value: "#D4B882" },
  { label: "Sage", value: "#9EB89A" },
  { label: "Gris", value: "#AAAAAA" },
  { label: "Negro", value: "#222222" },
];

function ColorPicker({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      {TEXT_COLORS.map((c) => {
        const selected = value === c.value;
        return (
          <button
            key={c.value}
            type="button"
            title={c.label}
            onClick={() => onChange(c.value)}
            className={`w-7 h-7 rounded-full border-2 transition-all ${selected ? "scale-110 border-sage-500 shadow-md" : "border-transparent hover:border-gray-300"}`}
            style={{ backgroundColor: c.value, outline: selected ? "2px solid white" : "none", outlineOffset: "1px" }}
          />
        );
      })}
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="ml-1 font-sans text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}

const SPECS = [
  { label: "Tamaño mínimo", value: "1200 × 400 px" },
  { label: "Tamaño recomendado", value: "1920 × 600 px" },
  { label: "Relación de aspecto", value: "3:1 (horizontal)" },
  { label: "Formatos aceptados", value: "JPG, PNG, WebP" },
  { label: "Peso máximo", value: "15 MB" },
];

const MOBILE_SPECS = [
  { label: "Tamaño recomendado", value: "750 × 1200 px" },
  { label: "Relación de aspecto", value: "9:16 (vertical)" },
  { label: "Formatos aceptados", value: "JPG, PNG, WebP" },
  { label: "Peso máximo", value: "10 MB" },
];

const BANNERS_CONFIG = [
  { id: "home-hero", label: "Banner Home", description: "Imagen de fondo del hero principal (página de inicio)" },
  { id: "tienda-hero", label: "Banner Tienda", description: "Imagen de fondo del hero de /tienda" },
];

function BannerPanel({ config }: { config: typeof BANNERS_CONFIG[0] }) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [mobileDragOver, setMobileDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch(`/api/admin/banner?id=${config.id}`)
      .then((r) => r.json())
      .then((d) => setBanner(d))
      .finally(() => setLoading(false));
  }, [config.id]);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Solo se aceptan imágenes (JPG, PNG, WebP)", "err");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast("La imagen supera el límite de 15 MB", "err");
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

  const uploadMobileFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Solo se aceptan imágenes (JPG, PNG, WebP)", "err");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("La imagen supera el límite de 10 MB", "err");
      return;
    }
    setUploadingMobile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBanner((b) => b ? { ...b, mobile_image_url: data.url } : b);
      showToast("Imagen mobile cargada — guardá los cambios");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error al subir imagen", "err");
    } finally {
      setUploadingMobile(false);
    }
  };

  const handleMobileFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMobileFile(file);
    e.target.value = "";
  };

  const handleMobileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setMobileDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadMobileFile(file);
  };

  const clearMobileImage = () => setBanner((b) => b ? { ...b, mobile_image_url: null } : b);

  const save = async () => {
    if (!banner) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banner", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: config.id,
          image_url: banner.image_url,
          mobile_image_url: banner.mobile_image_url,
          active: banner.active,
          heading_text: banner.heading_text,
          subheading_text: banner.subheading_text,
          heading_color: banner.heading_color,
          subheading_color: banner.subheading_color,
        }),
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

  const clearImage = () => setBanner((b) => b ? { ...b, image_url: null } : b);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 text-sage-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      {/* Header del panel */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-sans text-base font-semibold text-gray-700">{config.label}</h2>
          <p className="font-sans text-sm text-gray-400 mt-0.5">{config.description}</p>
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
            className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium px-5 py-2 rounded-xl transition-colors shadow-sm disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Imagen */}
      <div className="p-5">
        {banner?.image_url ? (
          <div>
            <div className="relative w-full rounded-xl overflow-hidden mb-3" style={{ aspectRatio: "3/1" }}>
              <Image src={banner.image_url} alt={config.label} fill className="object-cover" sizes="100vw" />
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
            <div className="flex items-center justify-between">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-gray-200 font-sans text-sm text-gray-400 hover:border-sage-300 hover:text-sage-500 transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Subiendo..." : "Subir nueva imagen"}
              </button>
              <button
                onClick={clearImage}
                className="flex items-center gap-1.5 font-sans text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Quitar imagen
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center py-12 px-6 rounded-xl cursor-pointer transition-colors ${
              dragOver ? "bg-sage-50" : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {uploading ? (
              <Loader2 className="w-9 h-9 text-sage-400 animate-spin mb-3" />
            ) : (
              <ImageIcon className={`w-9 h-9 mb-3 ${dragOver ? "text-sage-400" : "text-gray-300"}`} />
            )}
            <p className="font-sans text-sm font-medium text-gray-500 mb-1">
              {uploading ? "Subiendo imagen..." : "Arrastrá una imagen o hacé click"}
            </p>
            <p className="font-sans text-xs text-gray-400">JPG, PNG o WebP · Máx. 15 MB · Mín. 1200 × 400 px</p>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      <input ref={mobileFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleMobileFile} />

      {/* Banner versión celular */}
      <div className="px-5 pb-5 border-t border-gray-100 pt-5">
        <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Banner versión celular
        </p>

        {/* Specs mobile */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 flex gap-2">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-sans text-xs font-semibold text-amber-700 mb-1.5">Especificaciones para celular</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
              {MOBILE_SPECS.map(({ label, value }) => (
                <div key={label} className="flex gap-1.5 font-sans text-xs">
                  <span className="text-amber-500 flex-shrink-0">{label}:</span>
                  <span className="text-amber-700 font-medium">{value}</span>
                </div>
              ))}
            </div>
            <p className="font-sans text-[11px] text-amber-400 mt-1.5">
              Si no subís imagen mobile, se usa la imagen de escritorio en celulares también.
            </p>
          </div>
        </div>

        {/* Upload area mobile — portrait */}
        <div className="flex gap-6 items-start">
          <div className="flex-shrink-0" style={{ width: 140 }}>
            {banner?.mobile_image_url ? (
              <div>
                <div className="relative rounded-xl overflow-hidden mb-2 shadow-sm" style={{ aspectRatio: "9/16", width: 140 }}>
                  <Image src={banner.mobile_image_url} alt="Banner mobile" fill className="object-cover" sizes="140px" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                    <button
                      onClick={() => mobileFileRef.current?.click()}
                      className="flex items-center gap-1.5 bg-white text-gray-700 font-sans text-xs font-medium px-3 py-1.5 rounded-full shadow"
                    >
                      <Upload className="w-3 h-3" />
                      Cambiar
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => mobileFileRef.current?.click()}
                    disabled={uploadingMobile}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border-2 border-dashed border-gray-200 font-sans text-xs text-gray-400 hover:border-amber-300 hover:text-amber-500 transition-colors disabled:opacity-50 w-full"
                  >
                    {uploadingMobile ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    {uploadingMobile ? "Subiendo..." : "Cambiar imagen"}
                  </button>
                  <button
                    onClick={clearMobileImage}
                    className="flex items-center justify-center gap-1 font-sans text-xs text-red-400 hover:text-red-600 transition-colors py-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Quitar imagen
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDrop={handleMobileDrop}
                onDragOver={(e) => { e.preventDefault(); setMobileDragOver(true); }}
                onDragLeave={() => setMobileDragOver(false)}
                onClick={() => mobileFileRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl cursor-pointer transition-colors border-2 border-dashed ${
                  mobileDragOver ? "bg-amber-50 border-amber-300" : "bg-gray-50 border-gray-200 hover:bg-amber-50 hover:border-amber-200"
                }`}
                style={{ aspectRatio: "9/16", width: 140 }}
              >
                {uploadingMobile ? (
                  <Loader2 className="w-6 h-6 text-amber-400 animate-spin mb-2" />
                ) : (
                  <ImageIcon className={`w-6 h-6 mb-2 ${mobileDragOver ? "text-amber-400" : "text-gray-300"}`} />
                )}
                <p className="font-sans text-[11px] text-center text-gray-400 px-2 leading-snug">
                  {uploadingMobile ? "Subiendo..." : "Arrastrá o hacé click"}
                </p>
                <p className="font-sans text-[10px] text-gray-300 text-center px-2 mt-1 leading-snug">9:16 · Máx 10 MB</p>
              </div>
            )}
          </div>

          <div className="flex-1 font-sans text-xs text-gray-400 leading-relaxed pt-1 space-y-1.5">
            <p className="font-medium text-gray-500">¿Cuándo se usa esta imagen?</p>
            <p>En pantallas de celular (menos de 768px de ancho), se muestra esta imagen en lugar del banner horizontal.</p>
            <p>Así podés cargar una foto vertical que se vea mejor en móvil sin recortarse.</p>
          </div>
        </div>
      </div>

      {/* Texto overlay */}
      <div className="px-5 pb-5 border-t border-gray-100 pt-5 space-y-5">
        <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider">Texto del hero</p>
        <div>
          <label className="block font-sans text-sm font-medium text-gray-600 mb-1.5">Título</label>
          <input
            type="text"
            value={banner?.heading_text ?? ""}
            onChange={(e) => setBanner((b) => b ? { ...b, heading_text: e.target.value || null } : b)}
            placeholder="Ej: Viandas saludables, para todas tus metas."
            className="w-full font-sans text-sm text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent placeholder:text-gray-300"
          />
          <p className="font-sans text-xs text-gray-400 mt-1">Dejá vacío para usar el texto por defecto del sitio.</p>
          <div className="mt-2">
            <p className="font-sans text-xs text-gray-400 mb-1">Color del título</p>
            <ColorPicker
              value={banner?.heading_color ?? null}
              onChange={(v) => setBanner((b) => b ? { ...b, heading_color: v || null } : b)}
            />
          </div>
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-gray-600 mb-1.5">Subtítulo</label>
          <input
            type="text"
            value={banner?.subheading_text ?? ""}
            onChange={(e) => setBanner((b) => b ? { ...b, subheading_text: e.target.value || null } : b)}
            placeholder="Ej: Palermo & Villa Crespo · Buenos Aires"
            className="w-full font-sans text-sm text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent placeholder:text-gray-300"
          />
          <div className="mt-2">
            <p className="font-sans text-xs text-gray-400 mb-1">Color del subtítulo</p>
            <ColorPicker
              value={banner?.subheading_color ?? null}
              onChange={(v) => setBanner((b) => b ? { ...b, subheading_color: v || null } : b)}
            />
          </div>
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

export default function AdminBanner() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1
          className="font-serif text-3xl text-sage-800"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
        >
          Banners
        </h1>
        <p className="font-sans text-sm text-sage-500 mt-0.5">
          Imágenes de fondo para los heroes del sitio
        </p>
      </div>

      {/* Specs */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 flex gap-3">
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
            La imagen se superpone con una capa oscura semi-transparente para mantener legible el texto.
          </p>
        </div>
      </div>

      {BANNERS_CONFIG.map((config) => (
        <BannerPanel key={config.id} config={config} />
      ))}
    </div>
  );
}
