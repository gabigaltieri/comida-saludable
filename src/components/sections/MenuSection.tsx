"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { Product } from "@/lib/data";
import { getProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

type SubcategoryItem = { id: string; name: string; slug: string };

export default function MenuSection({ initialCategory }: { initialCategory?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSub, setSelectedSub] = useState<string>("all");
  const [filterSubs, setFilterSubs] = useState<SubcategoryItem[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar productos
    getProducts().then((prods) => {
      setProducts(prods);
      setLoading(false);
    });

    // Cargar subcategorías — solo de la categoría activa si se pasó initialCategory
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats: { slug?: string; subcategories?: SubcategoryItem[] }[]) => {
        if (!Array.isArray(cats)) return;
        const relevantCats = initialCategory
          ? cats.filter((c) => c.slug === initialCategory)
          : cats;
        const subs = relevantCats.flatMap((c) => c.subcategories ?? []);
        setFilterSubs(subs);
      })
      .catch(() => {});
  }, []);


  const categoryProducts = initialCategory
    ? products.filter((p) => p.category === initialCategory)
    : products;

  // Subcategorías que tienen al menos 1 producto (por id directo o keyword)
  const visibleSubs = filterSubs.filter((sub) =>
    categoryProducts.some((p) => {
      if (p.subcategory_id) return p.subcategory_id === sub.id;
      const hay = (p.name + " " + p.tags.join(" ")).toLowerCase();
      const kw = sub.name.toLowerCase();
      return kw && hay.includes(kw);
    })
  );

  const activeSub = selectedSub === "all" ? null : (filterSubs.find((s) => s.id === selectedSub) ?? null);

  const filtered = categoryProducts.filter((p) => {
    if (activeSub !== null) {
      const matches = p.subcategory_id
        ? p.subcategory_id === activeSub.id
        : (p.name + " " + p.tags.join(" ")).toLowerCase().includes(activeSub.name.toLowerCase());
      if (!matches) return false;
    }
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <section id="menu" ref={sectionRef} className="py-20 md:py-28 bg-cream-100">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="mb-8">
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

          {/* Filter buttons por subcategoría */}
          {!loading && visibleSubs.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-2 mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <button
                onClick={() => setSelectedSub("all")}
                className={`px-4 py-1.5 rounded-full font-sans text-sm transition-all duration-200 border ${
                  selectedSub === "all"
                    ? "bg-sage-600 text-white border-sage-600"
                    : "bg-white text-sage-600 border-sage-200 hover:border-sage-400 hover:bg-sage-50"
                }`}
              >
                Todos
              </button>
              {visibleSubs.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSub(sub.id)}
                  className={`px-4 py-1.5 rounded-full font-sans text-sm transition-all duration-200 border ${
                    selectedSub === sub.id
                      ? "bg-sage-600 text-white border-sage-600"
                      : "bg-white text-sage-600 border-sage-200 hover:border-sage-400 hover:bg-sage-50"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Products Grid */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 text-sage-400 animate-spin" />
          </div>
        )}
        <AnimatePresence mode="wait">
          {!loading && (
            <motion.div
              key={searchQuery + selectedSub}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p
                    className="font-serif text-3xl text-sage-300 mb-2"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                  >
                    Sin resultados
                  </p>
                  <p className="font-sans text-sm text-sage-400">
                    Probá con otra búsqueda o cambiá el filtro
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
            </motion.div>
          )}
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
