"use client";

import { useState, useEffect } from "react";
import { Product, WHATSAPP_NUMBER } from "@/lib/data";
import { getProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Loader2, MessageCircle, ShoppingBag, Snowflake, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/cart";

// ── Tipos de Supabase ────────────────────────────────────────────────────────

type SubcategoryDB = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sort_order: number;
};

type CategoryDB = {
  id: string;
  name: string;
  slug: string;
  description: string;
  emoji: string;
  sort_order: number;
  active: boolean;
  has_cart: boolean;
  subcategories: SubcategoryDB[];
};

// ── Matching productos → subcategoría ────────────────────────────────────────

function matchesSubcat(p: Product, subcat: SubcategoryDB): boolean {
  if (p.subcategory_id) return p.subcategory_id === subcat.id;
  const hay = (p.name + " " + p.tags.join(" ")).toLowerCase();
  const keywords = [subcat.slug, subcat.name.toLowerCase()].filter(Boolean);
  return keywords.some((kw) => hay.includes(kw));
}

// ── Tarjeta solo vista (sin carrito) ─────────────────────────────────────────

function ViewOnlyCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      <div className="relative h-48 overflow-hidden bg-cream-200 flex-shrink-0">
        {!imgError ? (
          <Image
            src={product.image}
            alt={product.imageAlt || product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cream-300">
            <ShoppingBag className="w-10 h-10 text-sage-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3
          className="font-serif text-sage-800 text-xl font-semibold leading-snug"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
        >
          {product.name}
        </h3>
        <p className="font-sans text-sm text-sage-500 leading-snug line-clamp-2 flex-1">
          {product.description}
        </p>
        <div className="pt-2 border-t border-sage-100 mt-auto">
          <p className="font-sans text-xs text-sage-400 leading-none mb-0.5">Precio</p>
          <p
            className="font-serif text-sage-700 text-2xl font-semibold"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </article>
  );
}

// ── Banner viandas diarias ───────────────────────────────────────────────────

function DiariasBanner() {
  return (
    <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 -mt-7">
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl px-6 py-4 shadow-lg"
        style={{ background: "white" }}
      >
        <p
          className="font-serif font-light text-lg md:text-xl leading-snug text-center sm:text-left"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#5a6b3a" }}
        >
          Vení a buscar tus opciones saludables de mediodía
        </p>
        <div className="flex items-center gap-2 flex-wrap justify-center flex-shrink-0">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("¡Hola! Me gustaría saber más sobre sus viandas")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full font-sans text-sm font-medium text-white transition-all hover:scale-105"
            style={{ background: "#25D366" }}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full font-sans text-sm font-medium border cursor-default"
            style={{ background: "#f5f5f5", borderColor: "#ddd", color: "#aaa" }}
          >
            <span>🛵</span>
            PedidosYa
            <span className="text-[10px] bg-gray-100 text-gray-400 font-semibold px-1.5 py-0.5 rounded-full">pronto</span>
          </div>
          <a
            href="https://www.rappi.com.ar/restaurantes/200971-262-cosas-ricas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full font-sans text-sm font-medium border transition-all hover:scale-105"
            style={{ background: "#fff3f0", borderColor: "#ffd0c5", color: "#e05d44" }}
          >
            <span>🛵</span>
            Rappi
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Sección de subcategoría ──────────────────────────────────────────────────

function SubcatSection({
  subcat,
  products,
  showCart,
  index,
}: {
  subcat: SubcategoryDB;
  products: Product[];
  showCart: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="mb-14"
    >
      <h3
        className="font-serif font-light text-3xl md:text-4xl mb-6"
        style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#1e2e1f" }}
      >
        {subcat.name}
      </h3>

      {products.length === 0 ? (
        <p className="font-sans text-sm text-sage-400 italic">Próximamente...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              {showCart ? <ProductCard product={product} /> : <ViewOnlyCard product={product} />}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Sección de categoría ─────────────────────────────────────────────────────

function CategorySection({
  category,
  products,
  isFirst,
  activeSubcatId,
}: {
  category: CategoryDB;
  products: Product[];
  isFirst: boolean;
  activeSubcatId: string | null;
}) {
  const showCart = category.has_cart === true;
  const accentColor = showCart ? "#D4B882" : "#e05d44";
  const labelColor = showCart ? "#547d54" : "#e05d44";
  const displayName = category.name.replace(/[,\s]+y?\s*[Tt]artas/gi, "").trim();

  const subcatsToShow = activeSubcatId
    ? category.subcategories.filter((s) => s.id === activeSubcatId)
    : category.subcategories;

  return (
    <div>
      {/* Subcategorías */}
      {subcatsToShow.length > 0 ? (
        subcatsToShow.map((sub, i) => (
          <SubcatSection
            key={sub.id}
            subcat={sub}
            products={products.filter((p) => matchesSubcat(p, sub))}
            showCart={showCart}
            index={i}
          />
        ))
      ) : (
        products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                {showCart ? <ProductCard product={product} /> : <ViewOnlyCard product={product} />}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="font-sans text-sm text-sage-400 italic">Próximamente...</p>
        )
      )}
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function TiendaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryDB[]>([]);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerHeading, setBannerHeading] = useState<string | null>(null);
  const [bannerSubheading, setBannerSubheading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubcatId, setActiveSubcatId] = useState<string | null>(null);

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  useEffect(() => {
    Promise.all([
      getProducts(),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/banner?id=tienda-hero").then((r) => r.json()),
    ]).then(([prods, cats, banner]) => {
      setProducts(prods);
      if (Array.isArray(cats)) setCategories(cats);
      if (banner?.active && banner?.image_url) setBannerUrl(banner.image_url);
      if (banner?.heading_text) setBannerHeading(banner.heading_text);
      if (banner?.subheading_text) setBannerSubheading(banner.subheading_text);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#EDEAE4" }}>

      {/* Hero */}
      <div className="relative overflow-hidden py-20 md:py-28 px-5" style={{ background: "#1E1E1E" }}>
        {bannerUrl && (
          <Image
            src={bannerUrl}
            alt="Banner tienda"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #9A8B6E 0%, transparent 60%)" }}
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="font-sans text-xs uppercase tracking-[0.35em] mb-4" style={{ color: "#9A8B6E" }}
          >
            Pedí online
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-light text-5xl md:text-7xl text-white mb-4"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            {bannerHeading ?? (
              <>Nuestra{" "}<em className="italic font-normal" style={{ color: "#D4B882" }}>tienda</em></>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="font-sans text-white/40 text-sm max-w-md mx-auto"
          >
            {bannerSubheading ?? "Elegí tus viandas, armá tu pedido y lo coordinamos por WhatsApp."}
          </motion.p>
        </div>
      </div>

      <DiariasBanner />

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Combos ── */}
            <div className="mb-14">
              <p className="font-sans text-xs uppercase tracking-[0.35em] mb-3" style={{ color: "#547d54" }}>Con carrito</p>
              <h2
                className="font-serif font-light text-4xl md:text-5xl leading-tight mb-3"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#1e2e1f" }}
              >
                Nuestros{" "}
                <em className="italic font-normal" style={{ color: "#D4B882" }}>combos</em>
              </h2>
              <div className="h-px mb-8" style={{ background: "linear-gradient(to right, #547d54, transparent)" }} />
              <div className="flex gap-4">
                {[
                  { size: 10, badge: "Ideal para la semana", price: "$85.000", href: "/tienda/combo-viandas?size=10" },
                  { size: 20, badge: "Mejor precio",          price: "$164.000", href: "/tienda/combo-viandas?size=20" },
                ].map((combo) => (
                  <Link key={combo.size} href={combo.href} className="group block w-44 md:w-52">
                    <div className="rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-200 group-hover:-translate-y-1">
                      <div className="px-5 py-6 relative" style={{ background: "#1a3325" }}>
                        <Snowflake className="absolute top-3 right-3 w-3.5 h-3.5 text-white/20" />
                        <span className="inline-block font-sans text-[9px] uppercase tracking-widest text-white/50 bg-white/10 px-2 py-0.5 rounded-full mb-3">
                          {combo.badge}
                        </span>
                        <p className="font-serif text-white font-light leading-none" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: "2.4rem" }}>
                          ×{combo.size}
                        </p>
                        <p className="font-sans text-white/50 text-[10px] mt-1">viandas congeladas</p>
                      </div>
                      <div className="px-4 py-3 bg-white flex items-center justify-between">
                        <span className="font-sans text-sm font-semibold text-stone-700">{combo.price}</span>
                        <span className="font-sans text-[10px] text-stone-400 group-hover:text-stone-700 transition-colors flex items-center gap-0.5">
                          Armar <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Divisor ── */}
            <div className="my-10 flex items-center gap-4">
              <div className="flex-1 h-px" style={{ background: "#c5bfb5" }} />
              <span className="font-sans text-xs uppercase tracking-[0.3em] text-sage-400">Viandas Congeladas</span>
              <div className="flex-1 h-px" style={{ background: "#c5bfb5" }} />
            </div>

            {/* ── Filtros de subcategoría ── */}
            {(() => {
              const congeladas = categories.find((c) => c.slug === "viandas-congeladas");
              if (!congeladas || congeladas.subcategories.length === 0) return null;
              return (
                <div className="flex items-center gap-2 flex-wrap mb-8">
                  <button
                    onClick={() => setActiveSubcatId(null)}
                    className={`px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-all ${activeSubcatId === null ? "bg-sage-800 text-white shadow-sm" : "bg-white text-sage-700 hover:bg-sage-50 border border-sage-200"}`}
                  >
                    Todas
                  </button>
                  {congeladas.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubcatId(sub.id)}
                      className={`px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-all ${activeSubcatId === sub.id ? "bg-sage-800 text-white shadow-sm" : "bg-white text-sage-700 hover:bg-sage-50 border border-sage-200"}`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* ── Productos ── */}
            {categories
              .filter((c) => c.slug === "viandas-congeladas")
              .map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  products={products.filter((p) => p.category === category.slug)}
                  isFirst={true}
                  activeSubcatId={activeSubcatId}
                />
              ))
            }
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
