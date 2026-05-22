"use client";

import { useState, useEffect } from "react";
import { Product, WHATSAPP_NUMBER } from "@/lib/data";
import { getProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import StoreNavbar from "@/components/StoreNavbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Loader2, MessageCircle, ShoppingBag } from "lucide-react";
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
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-5 px-6 py-5"
      style={{ background: "white", borderBottom: "1px solid #e5e0d8" }}
    >
      <p
        className="font-serif font-light text-xl md:text-2xl leading-snug max-w-sm"
        style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#5a6b3a" }}
      >
        Vení a buscar tus opciones saludables de mediodía
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full font-sans text-sm font-medium text-white transition-all hover:scale-105"
          style={{ background: "#25D366" }}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-full font-sans text-sm font-medium border cursor-default"
          style={{ background: "#f5f5f5", borderColor: "#ddd", color: "#888" }}
        >
          <span>🛵</span>
          PedidosYa
          <span className="text-[10px] bg-sage-100 text-sage-600 font-semibold px-1.5 py-0.5 rounded-full">pronto</span>
        </div>
        <a
          href="https://www.rappi.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full font-sans text-sm font-medium border transition-all hover:scale-105"
          style={{ background: "#fff3f0", borderColor: "#ffd0c5", color: "#e05d44" }}
        >
          <span>🛵</span>
          Rappi
        </a>
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
}: {
  category: CategoryDB;
  products: Product[];
  isFirst: boolean;
}) {
  const showCart = category.has_cart === true;
  const accentColor = showCart ? "#D4B882" : "#e05d44";
  const labelColor = showCart ? "#547d54" : "#e05d44";

  return (
    <div>
      {/* Divisor entre categorías */}
      {!isFirst && (
        <div className="my-16 flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "#c5bfb5" }} />
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-sage-400">262 Cosas Ricas</span>
          <div className="flex-1 h-px" style={{ background: "#c5bfb5" }} />
        </div>
      )}

      {/* Header de categoría */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-8"
      >
        <p className="font-sans text-xs uppercase tracking-[0.35em] mb-3" style={{ color: labelColor }}>
          {showCart ? "Con carrito" : "Solo para ver"}
        </p>
        <h2
          className="font-serif font-light text-4xl md:text-5xl leading-tight mb-3"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#1e2e1f" }}
        >
          {category.name.split(" ")[0]}{" "}
          <em className="italic font-normal" style={{ color: accentColor }}>
            {category.name.split(" ").slice(1).join(" ")}
          </em>
        </h2>
        <div className="h-px mb-8" style={{ background: `linear-gradient(to right, ${labelColor}, transparent)` }} />
      </motion.div>

      {/* Subcategorías */}
      {category.subcategories.length > 0 ? (
        category.subcategories.map((sub, i) => (
          <SubcatSection
            key={sub.id}
            subcat={sub}
            products={products.filter((p) => matchesSubcat(p, sub))}
            showCart={showCart}
            index={i}
          />
        ))
      ) : (
        // Si no hay subcategorías, mostrar todos los productos directo
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts(),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/banner").then((r) => r.json()),
    ]).then(([prods, cats, banner]) => {
      setProducts(prods);
      if (Array.isArray(cats)) setCategories(cats);
      if (banner?.active && banner?.image_url) setBannerUrl(banner.image_url);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#EDEAE4" }}>
      <StoreNavbar />
      <DiariasBanner />

      {/* Hero */}
      <div className="relative overflow-hidden py-20 md:py-28 px-5" style={{ background: "#1E1E1E" }}>
        {bannerUrl && (
          <Image
            src={bannerUrl}
            alt="Banner tienda"
            fill
            className="object-cover opacity-40"
            sizes="100vw"
            priority
          />
        )}
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
            Nuestra{" "}<em className="italic font-normal" style={{ color: "#D4B882" }}>tienda</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="font-sans text-white/40 text-sm max-w-md mx-auto"
          >
            Elegí tus viandas, armá tu pedido y lo coordinamos por WhatsApp.
          </motion.p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
          </div>
        ) : (
          categories.map((category, i) => (
            <CategorySection
              key={category.id}
              category={category}
              products={products.filter((p) => p.category === category.slug)}
              isFirst={i === 0}
            />
          ))
        )}
      </main>

      <Footer />
    </div>
  );
}
