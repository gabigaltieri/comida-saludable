"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Minus, Trash2, ShoppingBag,
  ArrowLeft, Loader2, Pencil, CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/cart";
import Footer from "@/components/Footer";
import { Product } from "@/lib/data";
import { cn } from "@/lib/utils";

const FIXED_PRICE_FALLBACK: Record<number, number> = { 5: 42500, 10: 85000 };

function ComboTartasContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Map<string, number>>(new Map());
  const [search, setSearch] = useState("");
  const [comboPrices, setComboPrices] = useState<Record<number, number>>(FIXED_PRICE_FALLBACK);
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const rawSize = parseInt(searchParams.get("size") ?? "5", 10);
  const targetSize = rawSize > 0 ? rawSize : 5;
  const comboPrice = comboPrices[targetSize] ?? FIXED_PRICE_FALLBACK[targetSize] ?? 42500;
  const { addCombo, replaceCombo, openCart } = useCart();

  // Cargar precios de tartas desde la API
  useEffect(() => {
    fetch("/api/viandas-combos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const map: Record<number, number> = {};
          data
            .filter((c: { category?: string }) => (c.category || "viandas") === "tartas")
            .forEach((c: { size: number; price: number }) => { map[c.size] = c.price; });
          if (Object.keys(map).length > 0) setComboPrices(map);
        }
      })
      .catch(() => {});
  }, []);

  // Productos de tartas (subcategoría "tartas" dentro de viandas-congeladas)
  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([prods, cats]) => {
        const congeladas = (cats as { slug?: string; subcategories?: { id: string; name: string }[] }[])
          .find((c) => c.slug === "viandas-congeladas");
        const tartaSub = congeladas?.subcategories?.find(
          (s) => s.name.toLowerCase().includes("tarta")
        );

        const tartaProducts = (prods as Product[]).filter((p) => {
          if (!p.available || p.category !== "viandas-congeladas") return false;
          if (tartaSub) {
            if (p.subcategory_id) return p.subcategory_id === tartaSub.id;
            return (p.name + " " + p.tags.join(" ")).toLowerCase().includes("tarta");
          }
          return (p.name + " " + p.tags.join(" ")).toLowerCase().includes("tarta");
        });

        setProducts(tartaProducts);
      })
      .finally(() => setLoading(false));
  }, []);

  // Restaurar selección al editar
  useEffect(() => {
    if (!editId) { setSelected(new Map()); return; }
    const saved = localStorage.getItem(`combo_selection_${editId}`);
    if (!saved) return;
    try {
      setSelected(new Map(Object.entries(JSON.parse(saved) as Record<string, number>)));
    } catch { /* ignore */ }
  }, [editId]);

  const selectedItems = useMemo(
    () => products.filter((p) => (selected.get(p.id) ?? 0) > 0)
      .map((p) => ({ product: p, qty: selected.get(p.id)! })),
    [products, selected]
  );

  const totalUnits = useMemo(() => selectedItems.reduce((s, i) => s + i.qty, 0), [selectedItems]);
  const isComplete = totalUnits === targetSize;
  const isOver = totalUnits > targetSize;
  const remaining = targetSize - totalUnits;
  const progress = Math.min(100, (totalUnits / targetSize) * 100);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const updateQty = (id: string, delta: number) => {
    const curr = selected.get(id) ?? 0;
    const newQty = curr + delta;
    if (delta > 0 && totalUnits >= targetSize) return;
    if (newQty < 0) return;
    setSelected((prev) => {
      const next = new Map(prev);
      if (newQty === 0) next.delete(id);
      else next.set(id, newQty);
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!isComplete) return;
    const comboId = editId ?? `ct${targetSize}-${Date.now()}`;
    const product_ids: string[] = [];
    selectedItems.forEach(({ product, qty }) => {
      for (let i = 0; i < qty; i++) product_ids.push(product.id);
    });
    const productList = selectedItems
      .map(({ product, qty }) => (qty > 1 ? `${product.name} ×${qty}` : product.name))
      .join(", ");

    const newCombo = {
      id: comboId,
      name: `Combo ×${targetSize} Tartas`,
      description: productList,
      price: comboPrice,
      image: selectedItems[0]?.product.image ?? "",
      imageAlt: `Combo de ${targetSize} tartas`,
      product_ids,
      available: true,
    };

    localStorage.setItem(`combo_selection_${comboId}`, JSON.stringify(Object.fromEntries(selected)));

    if (editId) replaceCombo(editId, newCombo);
    else addCombo(newCombo);

    setSelected(new Map());
    openCart();
  };

  return (
    <div className="min-h-screen" style={{ background: "#EDEAE4" }}>

      {/* Hero */}
      <div className="relative overflow-hidden py-14 md:py-20 px-5" style={{ background: "#2a1a0e" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #c4924a 0%, transparent 60%)" }} />
        <div className="relative max-w-6xl mx-auto">
          <Link href="/tienda"
            className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
            style={{ color: "#c4924a" }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a la tienda
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 text-2xl"
              style={{ background: "#3d2408" }}>
              🥧
            </div>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif font-light text-4xl md:text-5xl text-white mb-2"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                {editId ? "Editá tu" : "Armá tu"}{" "}
                <em className="italic font-normal" style={{ color: "#c4924a" }}>
                  Combo ×{targetSize} Tartas
                </em>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-sans text-white/50 text-sm">
                Elegí exactamente{" "}
                <span className="text-white/80 font-medium">{targetSize} tartas</span>{" "}
                al precio fijo de{" "}
                <span style={{ color: "#c4924a" }} className="font-semibold">
                  {formatPrice(comboPrice)}
                </span>.
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso sticky */}
      <div className="sticky top-16 z-40 bg-white border-b border-amber-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg">🥧</span>
            <span className="font-sans text-sm font-medium text-amber-700 hidden sm:block">Combo ×{targetSize}</span>
          </div>
          <div className="flex-1 relative h-3 bg-amber-100 rounded-full overflow-hidden">
            <motion.div
              className={cn("absolute inset-y-0 left-0 rounded-full", isComplete ? "bg-amber-500" : "bg-amber-400")}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div key="complete" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  <span className="font-sans text-sm font-semibold text-amber-600">¡Listo!</span>
                </motion.div>
              ) : (
                <motion.span key="counter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="font-sans text-sm font-medium tabular-nums"
                  style={{ color: totalUnits > 0 ? "#b45309" : "#d97706" }}>
                  <span className="font-bold">{totalUnits}</span>
                  <span className="text-amber-300">/{targetSize}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Grid de productos */}
          <div className="flex-1 min-w-0">
            <input type="text" placeholder="Buscar tarta..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-5 px-4 py-2.5 rounded-full bg-white border border-amber-200 font-sans text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 transition-colors shadow-sm"
            />

            {loading ? (
              <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">🥧</p>
                <p className="font-sans text-stone-400 text-sm">No hay tartas disponibles todavía.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredProducts.map((product) => {
                  const qty = selected.get(product.id) ?? 0;
                  const canAdd = totalUnits < targetSize;
                  return (
                    <motion.div key={product.id} layout
                      className={cn(
                        "bg-white rounded-2xl border overflow-hidden transition-all duration-200",
                        qty > 0 ? "border-amber-400 shadow-md ring-1 ring-amber-300" : "border-stone-100 shadow-sm",
                        !canAdd && qty === 0 && "opacity-50"
                      )}>
                      <div className={cn("relative aspect-square bg-amber-50", canAdd && qty === 0 && "cursor-pointer")}
                        onClick={() => canAdd && qty === 0 && updateQty(product.id, 1)}>
                        {product.image && (
                          <Image src={product.image} alt={product.imageAlt} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                        )}
                        <AnimatePresence>
                          {qty > 0 && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow">
                              {qty}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="p-3">
                        <p className="font-sans text-xs font-semibold text-stone-700 leading-tight mb-1 line-clamp-2">{product.name}</p>
                        <p className="font-sans text-xs text-stone-400 mb-2.5">{formatPrice(product.price)}</p>
                        {qty === 0 ? (
                          <button onClick={() => updateQty(product.id, 1)} disabled={!canAdd}
                            className={cn("w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-medium font-sans transition-colors",
                              canAdd ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-amber-100 text-amber-400 cursor-not-allowed")}>
                            <Plus className="w-3.5 h-3.5" />
                            {canAdd ? "Agregar" : "Límite alcanzado"}
                          </button>
                        ) : (
                          <div className="flex items-center justify-between">
                            <button onClick={() => updateQty(product.id, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-sans text-sm font-bold text-stone-700">{qty}</span>
                            <button onClick={() => updateQty(product.id, 1)} disabled={!canAdd}
                              className={cn("w-8 h-8 flex items-center justify-center rounded-xl transition-colors",
                                canAdd ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-amber-100 text-amber-300 cursor-not-allowed")}>
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel del combo */}
          <div className="w-full lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-amber-50">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-serif text-xl text-stone-800 font-semibold"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                    Tu combo ×{targetSize} 🥧
                  </h2>
                  <span className={cn("font-sans text-xs font-bold px-2.5 py-1 rounded-full",
                    isComplete ? "bg-amber-100 text-amber-600" : isOver ? "bg-red-100 text-red-600" : "bg-amber-50 text-amber-500")}>
                    {totalUnits}/{targetSize}
                  </span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden mt-2">
                  <motion.div className={cn("h-full rounded-full", isComplete ? "bg-amber-500" : "bg-amber-400")}
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
                </div>
                <p className="font-sans text-xs text-stone-400 mt-1.5">
                  {isComplete ? (
                    <span className="text-amber-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 inline" />
                      ¡Combo completo! Podés agregarlo al carrito.
                    </span>
                  ) : (
                    <>Te {remaining === 1 ? "falta" : "faltan"}{" "}
                      <span className="font-semibold text-amber-600">{remaining}</span>{" "}
                      tarta{remaining !== 1 ? "s" : ""} más</>
                  )}
                </p>
              </div>

              <div className="px-5 py-3 flex flex-col gap-2.5 max-h-64 overflow-y-auto">
                <AnimatePresence initial={false}>
                  {selectedItems.length === 0 ? (
                    <div className="py-8 flex flex-col items-center gap-2 text-stone-300">
                      <ShoppingBag className="w-8 h-8" />
                      <p className="font-sans text-xs text-center leading-relaxed">Elegí {targetSize} tartas del catálogo</p>
                    </div>
                  ) : (
                    selectedItems.map(({ product, qty }) => (
                      <motion.div key={product.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                        className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50">
                          {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-xs font-medium text-stone-700 truncate">{product.name}</p>
                          <p className="font-sans text-xs text-stone-400">
                            {qty > 1 && <span>{qty} × </span>}{formatPrice(product.price * qty)}
                          </p>
                        </div>
                        <button onClick={() => setSelected((prev) => { const n = new Map(prev); n.delete(product.id); return n; })}
                          className="p-1 text-stone-300 hover:text-red-400 transition-colors flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {selectedItems.length > 0 && (
                <div className="px-5 pb-5 pt-3 border-t border-amber-50 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{ background: "#fdf8f0", border: "1px solid #f0d9b0" }}>
                    <span className="text-base">🥧</span>
                    <p className="font-sans text-xs font-semibold text-amber-800">Precio fijo del combo ×{targetSize}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm font-semibold text-stone-700">Total</span>
                    <span className="font-sans text-lg font-bold text-stone-800">{formatPrice(comboPrice)}</span>
                  </div>
                  <button onClick={handleAddToCart} disabled={!isComplete}
                    className={cn("w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-sans font-medium text-sm transition-all duration-200",
                      isComplete ? "bg-amber-500 hover:bg-amber-600 text-white hover:-translate-y-0.5 shadow-sm" : "bg-amber-100 text-amber-400 cursor-not-allowed")}>
                    {editId ? <Pencil className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    {isComplete ? editId ? "Guardar cambios" : "Agregar combo al carrito"
                      : `Elegí ${remaining} tarta${remaining !== 1 ? "s" : ""} más`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ComboTartasPage() {
  return (
    <Suspense>
      <ComboTartasContent />
    </Suspense>
  );
}
