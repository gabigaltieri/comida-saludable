"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, ChevronRight, Gift } from "lucide-react";
import StoreNavbar from "@/components/StoreNavbar";
import Footer from "@/components/Footer";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  emoji?: string;
}

// Solo estas dos vienen de la DB; la tercera (Combos) es fija
const DB_SLUGS = ["viandas-congeladas", "viandas-diarias"];

const FALLBACK_IMAGES: Record<string, string> = {
  "viandas-congeladas": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
  "viandas-diarias":    "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
};

const COMBOS_CARD = {
  id: "combos",
  name: "Combos de Viandas",
  slug: "combos",
  description: "Armá tu combo de 10 o 20 viandas a tu gusto y conseguí un descuento especial.",
  emoji: "🎁",
  href: "/tienda/viandas/combos",
  image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
};

export default function ViandasyPage() {
  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: CategoryItem[]) => {
        if (!Array.isArray(data)) return;
        // Filtrar solo las 2 categorías de DB que necesitamos, en orden correcto
        const filtered: CategoryItem[] = [];
        for (const slug of DB_SLUGS) {
          const match = data.find((c) => c.slug === slug || c.id === slug);
          if (match) filtered.push(match);
        }
        setDbCategories(filtered);
      })
      .finally(() => setLoading(false));
  }, []);

  const allCards = [
    ...dbCategories.map((c) => ({ ...c, href: `/tienda/viandas/${c.slug || c.id}` })),
    { ...COMBOS_CARD },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#EDEAE4" }}>
      <StoreNavbar />

      {/* Hero */}
      <div className="relative overflow-hidden py-20 md:py-28 px-5" style={{ background: "#1E1E1E" }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #9A8B6E 0%, transparent 60%)" }}
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-sans text-xs uppercase tracking-[0.35em] mb-4"
            style={{ color: "#9A8B6E" }}
          >
            Nuestros servicios
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-light text-5xl md:text-7xl text-white mb-4"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            Nuestras{" "}
            <em className="italic font-normal" style={{ color: "#D4B882" }}>
              viandas
            </em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-sans text-white/40 text-sm max-w-md mx-auto"
          >
            Elegí la opción que más se adapta a tu estilo de vida.
          </motion.p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-14">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCards.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={cat.href}
                  className="group block relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                  style={{ minHeight: "240px", background: "#111" }}
                >
                  <Image
                    src={
                      cat.image ||
                      FALLBACK_IMAGES[cat.slug] ||
                      FALLBACK_IMAGES["viandas-congeladas"]
                    }
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Combos: badge especial */}
                  {cat.id === "combos" && (
                    <div className="absolute top-4 right-4">
                      <span className="font-sans text-[10px] uppercase tracking-wider font-semibold text-sage-200 bg-sage-700/80 border border-sage-500/40 px-2.5 py-1 rounded-full">
                        Mejor precio
                      </span>
                    </div>
                  )}

                  <div className="relative h-full flex flex-col justify-end p-6" style={{ minHeight: "240px" }}>
                    <p className="text-2xl mb-2">{cat.emoji}</p>
                    <h2
                      className="font-serif text-white text-3xl font-semibold mb-1 leading-tight"
                      style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                    >
                      {cat.name}
                    </h2>
                    {cat.description && (
                      <p className="font-sans text-white/60 text-sm leading-snug line-clamp-2 mb-4">
                        {cat.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-sm font-sans font-medium text-white/70 group-hover:text-white transition-colors">
                      {cat.id === "combos" ? "Armar un combo" : "Ver opciones"}
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
