"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { Product } from "@/lib/data";
import { getProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export default function MenuSection({ initialCategory }: { initialCategory?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (initialCategory) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [initialCategory]);

  const filtered = products.filter((p) => {
    const matchesCat = !initialCategory || p.category === initialCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <section id="menu" ref={sectionRef} className="py-20 md:py-28 bg-cream-100">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="mb-10">
          <motion.p
            className="section-label mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Nuestro menú
          </motion.p>
          <motion.div
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2
              className="section-title text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              ¿Qué te preparamos hoy?
            </h2>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
              <input
                type="text"
                placeholder="Buscar en el menú..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 font-sans text-sm rounded-full border border-sage-200 bg-white focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 text-sage-700 placeholder-sage-400 transition-all"
              />
            </div>
          </motion.div>
        </div>

        {/* Products Grid */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 text-sage-400 animate-spin" />
          </div>
        )}
        <AnimatePresence mode="wait">
          {!loading && <motion.div
            key={searchQuery}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-serif text-3xl text-sage-300 mb-2" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                  Sin resultados
                </p>
                <p className="font-sans text-sm text-sage-400">
                  Probá con otra búsqueda o cambiá la categoría
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                  >
                    <ProductCard product={product} showCart={product.category.includes("congelad")} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>}
        </AnimatePresence>

        {/* Bottom note */}
        <motion.p
          className="font-sans text-xs text-sage-400 text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          * El menú puede variar según la disponibilidad de ingredientes frescos.
          Consultanos por WhatsApp para el menú del día.
        </motion.p>
      </div>
    </section>
  );
}
