"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  emoji: string;
  sort_order: number;
  active: boolean;
};

const FALLBACK_IMAGES: Record<string, string> = {
  "viandas-congeladas": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
  "viandas-diarias":    "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
};

const DB_SLUGS = ["viandas-congeladas", "viandas-diarias"];

const COMBOS_CARD = {
  id: "combos",
  name: "Combos de Viandas",
  slug: "combos",
  description: "Armá tu combo de 10 o 20 viandas a tu gusto y conseguí un descuento especial.",
  image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
  emoji: "🎁",
  href: "/tienda/viandas/combos",
};

export default function Categories() {
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: DbCategory[]) => {
        if (!Array.isArray(data)) return;
        const filtered: DbCategory[] = [];
        for (const slug of DB_SLUGS) {
          const match = data.find((c) => c.slug === slug || c.id === slug);
          if (match) filtered.push(match);
        }
        setDbCategories(filtered);
      })
      .catch(() => {});
  }, []);

  const allCards = [
    ...dbCategories.map((c) => ({
      ...c,
      href: `/tienda/viandas/${c.slug || c.id}`,
    })),
    COMBOS_CARD,
  ];

  if (dbCategories.length === 0) return null;

  return (
    <section id="categories" className="py-24 md:py-32" style={{ background: "#EDEAE4" }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-sans text-xs uppercase tracking-[0.35em] mb-4"
            style={{ color: "#9A8B6E" }}
          >
            Lo que ofrecemos
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-light text-4xl md:text-6xl"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}
          >
            Nuestras{" "}
            <em className="italic font-normal" style={{ color: "#9A8B6E" }}>
              opciones
            </em>
          </motion.h2>
        </div>

        {/* Grid de 3 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allCards.map((cat, i) => {
            const imgSrc =
              cat.image ||
              FALLBACK_IMAGES[cat.slug] ||
              FALLBACK_IMAGES["viandas-congeladas"];

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={cat.href}
                  className="group relative overflow-hidden text-left cursor-pointer focus:outline-none block rounded-xl"
                  style={{ minHeight: i === 1 ? "320px" : "360px" }}
                >
                  <div className="absolute inset-0">
                    <Image
                      src={imgSrc}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/85" />

                  {cat.id === "combos" && (
                    <div className="absolute top-4 right-4">
                      <span className="font-sans text-[10px] uppercase tracking-wider font-semibold text-white bg-sage-600/80 px-2.5 py-1 rounded-full border border-sage-400/30">
                        Ahorrá más
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="font-sans text-[10px] text-white/50 uppercase tracking-widest block mb-1.5">
                      {cat.emoji}
                    </span>
                    <h3
                      className="font-serif text-white text-2xl font-light leading-tight mb-1"
                      style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                    >
                      {cat.name}
                    </h3>
                    <p className="font-sans text-white/60 text-xs leading-snug line-clamp-2 max-w-[220px]">
                      {cat.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-white/50 group-hover:text-white transition-colors duration-300">
                      <span className="font-sans text-[10px] uppercase tracking-widest">
                        {cat.id === "combos" ? "Armar combo" : "Ver todo"}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
