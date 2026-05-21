"use client";

import { useState, useMemo, useEffect } from "react";
import { CATEGORIES, CategoryId, Product } from "@/lib/data";
import { getProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import StoreNavbar from "@/components/StoreNavbar";
import Footer from "@/components/Footer";
import { Search, X, SlidersHorizontal, Loader2, Gift, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type SortOption = "default" | "price-asc" | "price-desc" | "featured";
type ActiveFilter = CategoryId | "todos" | "combos";

export default function TiendaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("default");

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "combos") return [];
    let result = [...products];
    if (activeFilter !== "todos") result = result.filter((p) => p.category === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sort === "featured") result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return result;
  }, [products, activeFilter, search, sort]);

  const showCombos = activeFilter === "combos";
  const showProducts = filteredProducts.length > 0 && activeFilter !== "combos";
  const totalCount = activeFilter === "combos" ? 2 : filteredProducts.length;
  const activeCategoryName = CATEGORIES.find((c) => c.id === activeFilter)?.name;

  return (
    <div className="min-h-screen" style={{ background: "#EDEAE4" }}>
      <StoreNavbar />

      <div className="relative overflow-hidden py-20 md:py-28 px-5" style={{ background: "#1E1E1E" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #9A8B6E 0%, transparent 60%)" }} />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="font-sans text-xs uppercase tracking-[0.35em] mb-4" style={{ color: "#9A8B6E" }}>
            Pedí online
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-light text-5xl md:text-7xl text-white mb-4"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
            Nuestra{" "}<em className="italic font-normal" style={{ color: "#D4B882" }}>tienda</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="font-sans text-white/40 text-sm max-w-md mx-auto">
            Elegí tus viandas, armá tu pedido y lo coordinamos por WhatsApp.
          </motion.p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-8">

        {/* Barra de búsqueda + orden */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
            <input type="text" placeholder="Buscar producto o ingrediente..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-full bg-white border border-sage-200 text-sm font-sans text-sage-700 placeholder:text-sage-400 focus:outline-none focus:border-sage-400 transition-colors shadow-sm" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-sage-400 flex-shrink-0" />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}
              className="py-2.5 px-3 rounded-full bg-white border border-sage-200 text-sm font-sans text-sage-700 focus:outline-none focus:border-sage-400 transition-colors shadow-sm cursor-pointer">
              <option value="default">Ordenar por defecto</option>
              <option value="featured">Destacados primero</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
          </div>
        </div>

        {/* Filtros de categoría */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button onClick={() => setActiveFilter("todos")}
            className={`px-4 py-2 rounded-full text-sm font-sans font-medium transition-all duration-200 ${activeFilter === "todos" ? "bg-sage-500 text-white shadow-sm scale-105" : "bg-white text-sage-600 border border-sage-200 hover:border-sage-400 hover:bg-sage-50"}`}>
            Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setActiveFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-sans font-medium transition-all duration-200 ${activeFilter === cat.id ? "bg-sage-500 text-white shadow-sm scale-105" : "bg-white text-sage-600 border border-sage-200 hover:border-sage-400 hover:bg-sage-50"}`}>
              {cat.emoji} {cat.shortName}
            </button>
          ))}
          <button onClick={() => setActiveFilter("combos")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-sans font-medium transition-all duration-200 ${activeFilter === "combos" ? "bg-amber-500 text-white shadow-sm scale-105" : "bg-white text-amber-600 border border-amber-200 hover:border-amber-400 hover:bg-amber-50"}`}>
            <Gift className="w-3.5 h-3.5" />
            Combos
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Contador + limpiar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-sans text-sage-400">
                <span className="font-medium text-sage-600">{totalCount}</span>{" "}
                {totalCount === 1 ? "resultado" : "resultados"}
                {activeFilter !== "todos" && activeFilter !== "combos" && activeCategoryName && (
                  <span> en <span className="text-sage-600">{activeCategoryName}</span></span>
                )}
                {activeFilter === "combos" && <span> en <span className="text-amber-600">Combos</span></span>}
              </p>
              {(search || activeFilter !== "todos") && (
                <button onClick={() => { setSearch(""); setActiveFilter("todos"); setSort("default"); }}
                  className="text-xs font-sans text-salmon-400 hover:text-salmon-500 flex items-center gap-1 transition-colors">
                  <X className="w-3 h-3" /> Limpiar filtros
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {totalCount === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="font-serif text-2xl text-sage-600 mb-2" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                    Sin resultados
                  </p>
                  <p className="text-sm font-sans text-sage-400">Probá con otra búsqueda o categoría</p>
                </motion.div>
              ) : (
                <motion.div
                  key={`${activeFilter}-${search}-${sort}`}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Combos x10 y x20 */}
                  {showCombos && (
                    <div className="max-w-2xl mx-auto">
                      <p className="font-sans text-sm text-sage-500 text-center mb-8">
                        Elegí la cantidad de viandas, seleccioná los sabores que querés y conseguí un descuento especial.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {[
                          { size: 10, discount: "5% off", badge: "Ideal para la semana", description: "Elegí 10 viandas congeladas a tu gusto y conseguí un 5% de descuento." },
                          { size: 20, discount: "10% off", badge: "Mejor precio", description: "Stockeate con 20 viandas elegidas por vos y llevate el mejor descuento." },
                        ].map((combo, i) => (
                          <motion.div key={combo.size} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.35 }}>
                            <Link
                              href={`/tienda/combo-viandas?size=${combo.size}`}
                              className="group block bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                            >
                              <div className="px-6 py-5 flex items-start justify-between"
                                style={{ background: "linear-gradient(135deg, #f4f7f4 0%, #e8efe8 100%)" }}>
                                <div>
                                  <span className="inline-block font-sans text-[10px] uppercase tracking-wider font-semibold text-sage-600 bg-white/80 border border-sage-200 px-2 py-0.5 rounded-full mb-2">
                                    {combo.badge}
                                  </span>
                                  <p className="font-serif text-5xl font-semibold text-sage-800"
                                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                                    ×{combo.size}
                                  </p>
                                  <p className="font-sans text-sm text-sage-600 mt-0.5">viandas a tu elección</p>
                                </div>
                                <span className="font-sans text-sm font-bold px-3 py-1.5 rounded-full"
                                  style={{ background: "#547d54", color: "white" }}>
                                  {combo.discount}
                                </span>
                              </div>
                              <div className="px-6 py-4 flex items-center justify-between gap-4">
                                <p className="font-sans text-sm text-sage-500 leading-snug">{combo.description}</p>
                                <span className="flex-shrink-0 flex items-center gap-1.5 font-sans text-sm font-medium text-sage-700 group-hover:text-sage-900 transition-colors">
                                  Armar <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </span>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Productos */}
                  {showProducts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.map((product, i) => (
                        <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.3 }}>
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
