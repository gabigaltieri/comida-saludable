"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  User,
  Building2,
  Mail,
  Phone,
  Users,
  CheckCircle2,
  Send,
} from "lucide-react";
import StoreNavbar from "@/components/StoreNavbar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Product, WHATSAPP_NUMBER } from "@/lib/data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  emoji?: string;
  subcategories: Subcategory[];
}

type CategoryType =
  | "with-cart"
  | "display-only"
  | "contact-empresas"
  | "contact-catering";

const SLUG_TO_TYPE: Record<string, CategoryType> = {
  "viandas-congeladas": "with-cart",
  "viandas-diarias": "display-only",
  "viandas-empresas": "contact-empresas",
  "catering-eventos": "contact-catering",
};

// ─── ContactFormEmpresas ───────────────────────────────────────────────────────

function ContactFormEmpresas() {
  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    mail: "",
    telefono: "",
    empleados: "",
    detalle: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setApiError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "empresas", ...form }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error ?? "No se pudo enviar. Intentá de nuevo.");
      } else {
        setSent(true);
      }
    } catch {
      setApiError("Error de conexión. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-sage-200 text-sm font-sans text-sage-700 placeholder:text-sage-400 focus:outline-none focus:border-sage-400 bg-white transition-colors";
  const labelClass =
    "font-sans text-sm font-medium text-sage-700 mb-1.5 flex items-center gap-2";

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-10 text-center"
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#e8f0e8" }}>
          <CheckCircle2 className="w-8 h-8" style={{ color: "#3a6b3a" }} />
        </div>
        <div>
          <p className="font-serif text-2xl font-light mb-1" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}>
            ¡Consulta enviada!
          </p>
          <p className="font-sans text-sm text-sage-600">
            Nos comunicaremos con vos a la brevedad.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            <User className="w-4 h-4 text-sage-400" /> Nombre y apellido
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={set("nombre")}
            placeholder="Tu nombre completo"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            <Building2 className="w-4 h-4 text-sage-400" /> Empresa
          </label>
          <input
            type="text"
            value={form.empresa}
            onChange={set("empresa")}
            placeholder="Nombre de tu empresa"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            <Mail className="w-4 h-4 text-sage-400" /> Email
          </label>
          <input
            type="email"
            value={form.mail}
            onChange={set("mail")}
            placeholder="tu@email.com"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            <Phone className="w-4 h-4 text-sage-400" /> Teléfono
          </label>
          <input
            type="tel"
            value={form.telefono}
            onChange={set("telefono")}
            placeholder="11 1234-5678"
            required
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>
            <Users className="w-4 h-4 text-sage-400" /> Cantidad de empleados
          </label>
          <input
            type="number"
            min="1"
            value={form.empleados}
            onChange={set("empleados")}
            placeholder="Ej: 25"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          <MessageCircle className="w-4 h-4 text-sage-400" /> Detalle
        </label>
        <textarea
          value={form.detalle}
          onChange={set("detalle")}
          placeholder="Contanos qué necesitás, horarios, tipo de viandas, frecuencia..."
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      {apiError && (
        <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {apiError}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full flex items-center justify-center gap-2.5 text-white font-sans font-medium rounded-xl px-6 py-3.5 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        style={{
          background: "#2a402b",
          boxShadow: "0 4px 24px rgba(42,64,43,0.25)",
        }}
      >
        {sending ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
        ) : (
          <><Send className="w-4 h-4" /> Enviar consulta</>
        )}
      </button>
    </form>
  );
}

// ─── ContactFormCatering ───────────────────────────────────────────────────────

function ContactFormCatering() {
  const [form, setForm] = useState({
    nombre: "",
    mail: "",
    telefono: "",
    detalle: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setApiError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "catering", ...form }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error ?? "No se pudo enviar. Intentá de nuevo.");
      } else {
        setSent(true);
      }
    } catch {
      setApiError("Error de conexión. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-sage-200 text-sm font-sans text-sage-700 placeholder:text-sage-400 focus:outline-none focus:border-sage-400 bg-white transition-colors";
  const labelClass =
    "font-sans text-sm font-medium text-sage-700 mb-1.5 flex items-center gap-2";

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-10 text-center"
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#e8f0e8" }}>
          <CheckCircle2 className="w-8 h-8" style={{ color: "#3a6b3a" }} />
        </div>
        <div>
          <p className="font-serif text-2xl font-light mb-1" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}>
            ¡Consulta enviada!
          </p>
          <p className="font-sans text-sm text-sage-600">
            Nos comunicaremos con vos a la brevedad.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            <User className="w-4 h-4 text-sage-400" /> Nombre y apellido
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={set("nombre")}
            placeholder="Tu nombre completo"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            <Mail className="w-4 h-4 text-sage-400" /> Email
          </label>
          <input
            type="email"
            value={form.mail}
            onChange={set("mail")}
            placeholder="tu@email.com"
            required
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>
            <Phone className="w-4 h-4 text-sage-400" /> Teléfono
          </label>
          <input
            type="tel"
            value={form.telefono}
            onChange={set("telefono")}
            placeholder="11 1234-5678"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          <MessageCircle className="w-4 h-4 text-sage-400" /> Mensaje
        </label>
        <textarea
          value={form.detalle}
          onChange={set("detalle")}
          placeholder="Contanos sobre tu evento: fecha, cantidad de personas, tipo de servicio..."
          rows={5}
          required
          className={`${inputClass} resize-none`}
        />
      </div>

      {apiError && (
        <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {apiError}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full flex items-center justify-center gap-2.5 text-white font-sans font-medium rounded-xl px-6 py-3.5 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        style={{
          background: "#2a402b",
          boxShadow: "0 4px 24px rgba(42,64,43,0.25)",
        }}
      >
        {sending ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
        ) : (
          <><Send className="w-4 h-4" /> Enviar consulta</>
        )}
      </button>
    </form>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ViandaSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const categoryType: CategoryType = SLUG_TO_TYPE[slug] ?? "with-cart";
  const isProductPage =
    categoryType === "with-cart" || categoryType === "display-only";

  useEffect(() => {
    async function load() {
      try {
        const catRes = await fetch(`/api/categories/${slug}`);
        if (!catRes.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const catData: CategoryData = await catRes.json();
        setCategory(catData);

        if (isProductPage) {
            const prodRes = await fetch("/api/products");
          const allProducts: Product[] = await prodRes.json();
          setProducts(allProducts.filter((p) => p.category === slug));
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Filtro por subcategoría
  // TODO: cuando se agregue subcategory_id a la tabla products, filtrar por ese campo.
  // Por ahora se muestran todos los productos de la categoría independientemente del tab.
  const displayProducts = useMemo(() => products, [products]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "#EDEAE4" }}>
        <StoreNavbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────────
  if (notFound || !category) {
    return (
      <div className="min-h-screen" style={{ background: "#EDEAE4" }}>
        <StoreNavbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
          <p className="text-5xl mb-4">🥘</p>
          <h1
            className="font-serif text-3xl text-sage-700 mb-2"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            Categoría no encontrada
          </h1>
          <p className="text-sage-400 text-sm mb-6">
            Esta sección no existe o no está disponible.
          </p>
          <Link
            href="/tienda"
            className="font-sans text-sm text-sage-600 hover:text-sage-800 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a la tienda
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Hero ─────────────────────────────────────────────────────────────────────
  const heroContent = (
    <div className="relative overflow-hidden" style={{ minHeight: "300px" }}>
      {category.image ? (
        <div className="absolute inset-0">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: "#1E1E1E" }} />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 70% 50%, #9A8B6E 0%, transparent 60%)",
            }}
          />
        </>
      )}

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-14 flex flex-col justify-end">
        <nav className="flex items-center gap-2 text-white/50 text-xs font-sans mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/tienda/viandas" className="hover:text-white transition-colors">
            Viandas
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/80">{category.name}</span>
        </nav>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-sans text-xs uppercase tracking-[0.35em] mb-3"
          style={{ color: "#9A8B6E" }}
        >
          {category.emoji}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-light text-4xl md:text-6xl text-white mb-3"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
        >
          {category.name}
        </motion.h1>

        {category.description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-sans text-white/60 text-sm max-w-lg"
          >
            {category.description}
          </motion.p>
        )}
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#EDEAE4" }}>
      <StoreNavbar />

      {heroContent}

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-10">

        {/* ── PÁGINAS DE PRODUCTOS (with-cart / display-only) ── */}
        {isProductPage && (
          <>
            {/* Viandas Diarias: leyenda + links de delivery */}
            {categoryType === "display-only" && (
              <div className="mb-8 p-5 md:p-6 rounded-2xl bg-white border border-sage-100 shadow-sm flex flex-col md:flex-row md:items-center gap-5">
                <p
                  className="font-serif text-xl text-sage-700 flex-1"
                  style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                >
                  Vení a buscar tus opciones saludables de mediodía
                </p>
                <div className="flex flex-wrap gap-3 flex-shrink-0">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-sans font-medium transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                    style={{ background: "#25D366" }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                  {/* PedidosYa — próximamente */}
                  <button
                    disabled
                    title="Próximamente"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-sage-100 text-sage-400 text-sm font-sans font-medium cursor-not-allowed border border-sage-200"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    PedidosYa
                    <span className="text-[10px] font-semibold bg-sage-200 text-sage-500 px-1.5 py-0.5 rounded-full">
                      pronto
                    </span>
                  </button>
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-sans font-medium opacity-50 cursor-not-allowed"
                    style={{ background: "#FF441B" }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Rappi
                    <span className="text-[10px] font-semibold bg-red-300 text-red-700 px-1.5 py-0.5 rounded-full">pronto</span>
                  </button>
                </div>
              </div>
            )}

            {/* Grid de productos */}
            {displayProducts.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">🥘</p>
                <p
                  className="font-serif text-2xl text-sage-600 mb-2"
                  style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                >
                  Próximamente
                </p>
                <p className="text-sm font-sans text-sage-400">
                  Estamos preparando el menú. ¡Volvé pronto!
                </p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {displayProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Combos fijos: ×10 y ×20 (solo viandas-congeladas) */}
            {categoryType === "with-cart" && (
              <div className="mt-16">
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <p className="font-sans text-xs uppercase tracking-[0.25em] text-sage-400 mb-0.5">
                      Ahorrá más
                    </p>
                    <h2
                      className="font-serif text-3xl text-sage-800"
                      style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                    >
                      Combos de viandas
                    </h2>
                  </div>
                  <div className="flex-1 h-px bg-sage-100" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    {
                      size: 10,
                      discount: "5% off",
                      badge: "Ideal para la semana",
                      description:
                        "Elegí 10 viandas congeladas a tu gusto y conseguí un 5% de descuento.",
                    },
                    {
                      size: 20,
                      discount: "10% off",
                      badge: "Mejor precio",
                      description:
                        "Stockeate con 20 viandas elegidas por vos y llevate el mejor descuento.",
                    },
                  ].map((combo, i) => (
                    <motion.div
                      key={combo.size}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.35 }}
                    >
                      <Link
                        href={`/tienda/combo-viandas?size=${combo.size}`}
                        className="group block bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                      >
                        <div
                          className="px-6 py-5 flex items-start justify-between"
                          style={{ background: "linear-gradient(135deg, #f4f7f4 0%, #e8efe8 100%)" }}
                        >
                          <div>
                            <span className="inline-block font-sans text-[10px] uppercase tracking-wider font-semibold text-sage-600 bg-white/80 border border-sage-200 px-2 py-0.5 rounded-full mb-2">
                              {combo.badge}
                            </span>
                            <p
                              className="font-serif text-4xl font-semibold text-sage-800"
                              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                            >
                              ×{combo.size}
                            </p>
                            <p className="font-sans text-sm text-sage-600 mt-0.5">
                              viandas a tu elección
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className="font-sans text-sm font-bold px-3 py-1.5 rounded-full"
                              style={{ background: "#547d54", color: "white" }}
                            >
                              {combo.discount}
                            </span>
                          </div>
                        </div>
                        <div className="px-6 py-4 flex items-center justify-between gap-4">
                          <p className="font-sans text-sm text-sage-500 leading-snug">
                            {combo.description}
                          </p>
                          <span className="flex-shrink-0 flex items-center gap-1.5 font-sans text-sm font-medium text-sage-700 group-hover:text-sage-900 transition-colors">
                            Armar
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── PÁGINAS DE CONTACTO (empresas / catering) ── */}
        {!isProductPage && (
          <div className="max-w-2xl mx-auto">
            {/* Texto introductorio */}
            <div className="text-center mb-10">
              {categoryType === "contact-empresas" && (
                <>
                  <p
                    className="font-serif text-2xl md:text-3xl text-sage-700 leading-snug mb-3"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                  >
                    Tenemos las mejores opciones ajustables a las necesidades de tu empresa
                  </p>
                  <p className="font-sans text-sage-500 text-sm leading-relaxed">
                    Resolvemos de manera inteligente el almuerzo de tus colaboradores
                    para que todos coman a su gusto.
                  </p>
                </>
              )}
              {categoryType === "contact-catering" && (
                <>
                  <p
                    className="font-serif text-2xl md:text-3xl text-sage-700 leading-snug mb-3"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                  >
                    Armamos servicios de catering a medida para tu evento
                  </p>
                  <p className="font-sans text-sage-500 text-sm leading-relaxed">
                    Producciones de fotos, eventos corporativos y todo lo que necesités.
                    Consultanos y te armamos la propuesta especialmente pensada para vos.
                  </p>
                </>
              )}
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 md:p-8">
              {categoryType === "contact-empresas" ? (
                <ContactFormEmpresas />
              ) : (
                <ContactFormCatering />
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
