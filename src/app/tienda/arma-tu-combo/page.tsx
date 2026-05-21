"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, ShoppingBag, Tag, ArrowLeft, Sparkles, Loader2, Pencil } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/lib/db";
import { useCart } from "@/lib/cart";
import StoreNavbar from "@/components/StoreNavbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/data";

const DISCOUNT_THRESHOLD = 100000;
const DISCOUNT_RATE = 0.1;

function ArmatuComboContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Map<string, number>>(new Map());
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { addCombo, replaceCombo, openCart } = useCart();

  // Load products
  useEffect(() => {
    getProducts()
      .then((prods) => setProducts(prods))
      .finally(() => setLoading(false));
  }, []);

  // Restore selection when editId is present (runs after products load too, but
  // selecting from the map only needs the IDs which are always strings)
  useEffect(() => {
    if (!editId) {
      setSelected(new Map());
      return;
    }
    const saved = localStorage.getItem(`combo_selection_${editId}`);
    if (!saved) return;
    try {
      const obj = JSON.parse(saved) as Record<string, number>;
      setSelected(new Map(Object.entries(obj)));
    } catch {
      // ignore corrupt data
    }
  }, [editId]);

  const selectedItems = useMemo(
    () =>
      products
        .filter((p) => (selected.get(p.id) ?? 0) > 0)
        .map((p) => ({ product: p, qty: selected.get(p.id)! })),
    [products, selected]
  );

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, { product, qty }) => sum + product.price * qty, 0),
    [selectedItems]
  );

  const hasDiscount = subtotal >= DISCOUNT_THRESHOLD;
  const discount = hasDiscount ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const total = subtotal - discount;
  const progress = Math.min(100, (subtotal / DISCOUNT_THRESHOLD) * 100);
  const remaining = DISCOUNT_THRESHOLD - subtotal;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const updateQty = (id: string, delta: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const curr = next.get(id) ?? 0;
      const newQty = Math.max(0, curr + delta);
      if (newQty === 0) next.delete(id);
      else next.set(id, newQty);
      return next;
    });
  };

  const totalUnits = selectedItems.reduce((s, i) => s + i.qty, 0);

  const handleAddToCart = () => {
    if (selectedItems.length === 0) return;

    const comboId = editId ?? `custom-${Date.now()}`;
    const productList = selectedItems
      .map(({ product, qty }) => (qty > 1 ? `${product.name} ×${qty}` : product.name))
      .join(", ");

    const newCombo = {
      id: comboId,
      name: "Tu combo personalizado",
      description: productList,
      price: total,
      image: selectedItems[0]?.product.image ?? "",
      imageAlt: "Combo personalizado",
      product_ids: selectedItems.map(({ product }) => product.id),
      available: true,
    };

    localStorage.setItem(`combo_selection_${comboId}`, JSON.stringify(Object.fromEntries(selected)));

    if (editId) {
      replaceCombo(editId, newCombo);
    } else {
      addCombo(newCombo);
    }

    setSelected(new Map());
    openCart();
  };

  return (
    <div className="min-h-screen" style={{ background: "#EDEAE4" }}>
      <StoreNavbar />

      {/* Hero */}
      <div className="relative overflow-hidden py-16 md:py-20 px-5" style={{ background: "#1E1E1E" }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #C97B5A 0%, transparent 60%)" }}
        />
        <div className="relative max-w-6xl mx-auto">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
            style={{ color: "#9A8B6E" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a la tienda
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-light text-4xl md:text-6xl text-white mb-3"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            {editId ? "Editá tu" : "Armá tu"}{" "}
            <em className="italic font-normal" style={{ color: "#E8A87C" }}>
              combo
            </em>
          </motion.h1>
          {editId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-1.5 mt-1 mb-1 px-3 py-1 rounded-full text-xs font-sans font-medium"
              style={{ background: "rgba(232,168,124,0.2)", color: "#E8A87C", border: "1px solid rgba(232,168,124,0.3)" }}
            >
              <Pencil className="w-3 h-3" />
              Modificando combo existente — los cambios reemplazarán el combo en tu carrito
            </motion.div>
          )}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-sans text-white/50 text-sm max-w-md"
          >
            Elegí los productos que quieras. Si tu combo supera los{" "}
            <span className="text-white/80 font-medium">$100.000</span> te aplicamos un{" "}
            <span style={{ color: "#E8A87C" }} className="font-semibold">
              10% de descuento automático.
            </span>
          </motion.p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Product grid ── */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-5 px-4 py-2.5 rounded-full bg-white border border-sage-200 font-sans text-sm text-sage-700 placeholder:text-sage-400 focus:outline-none focus:border-sage-400 transition-colors shadow-sm"
            />

            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredProducts.map((product) => {
                  const qty = selected.get(product.id) ?? 0;
                  return (
                    <motion.div
                      key={product.id}
                      layout
                      className={cn(
                        "bg-white rounded-2xl border overflow-hidden transition-all duration-200",
                        qty > 0
                          ? "border-sage-400 shadow-md ring-1 ring-sage-300"
                          : "border-sage-100 shadow-sm hover:shadow-md hover:border-sage-200"
                      )}
                    >
                      {/* Image */}
                      <div
                        className="relative aspect-square bg-sage-50 cursor-pointer"
                        onClick={() => !qty && updateQty(product.id, 1)}
                      >
                        {product.image && (
                          <Image
                            src={product.image}
                            alt={product.imageAlt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        )}
                        <AnimatePresence>
                          {qty > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-sage-500 text-white text-xs font-bold flex items-center justify-center font-sans shadow"
                            >
                              {qty}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Info + controls */}
                      <div className="p-3">
                        <p className="font-sans text-xs font-semibold text-sage-700 leading-tight mb-1 line-clamp-2">
                          {product.name}
                        </p>
                        <p className="font-sans text-xs text-sage-400 mb-2.5">
                          ${product.price.toLocaleString("es-AR")}
                        </p>

                        {qty === 0 ? (
                          <button
                            onClick={() => updateQty(product.id, 1)}
                            className="w-full flex items-center justify-center gap-1 py-1.5 rounded-xl bg-sage-500 hover:bg-sage-600 text-white text-xs font-medium font-sans transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Agregar
                          </button>
                        ) : (
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => updateQty(product.id, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-sage-100 hover:bg-sage-200 text-sage-600 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-sans text-sm font-bold text-sage-700">{qty}</span>
                            <button
                              onClick={() => updateQty(product.id, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-sage-500 hover:bg-sage-600 text-white transition-colors"
                            >
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

          {/* ── Combo panel ── */}
          <div className="w-full lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden">

              {/* Panel header */}
              <div className="px-5 py-4 border-b border-sage-50">
                <h2
                  className="font-serif text-xl text-sage-800 font-semibold"
                  style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                >
                  Tu combo
                </h2>
                <p className="font-sans text-xs text-sage-400 mt-0.5">
                  {totalUnits === 0
                    ? "Todavía no agregaste productos"
                    : `${totalUnits} producto${totalUnits !== 1 ? "s" : ""} seleccionado${totalUnits !== 1 ? "s" : ""}`}
                </p>
              </div>

              {/* Selected items list */}
              <div className="px-5 py-3 flex flex-col gap-2.5 max-h-64 overflow-y-auto">
                <AnimatePresence initial={false}>
                  {selectedItems.length === 0 ? (
                    <div className="py-8 flex flex-col items-center gap-2 text-sage-300">
                      <ShoppingBag className="w-8 h-8" />
                      <p className="font-sans text-xs text-center leading-relaxed">
                        Agregá productos desde el catálogo de la izquierda
                      </p>
                    </div>
                  ) : (
                    selectedItems.map(({ product, qty }) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                        className="flex items-center gap-3"
                      >
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-sage-50">
                          {product.image && (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-xs font-medium text-sage-700 truncate">
                            {product.name}
                          </p>
                          <p className="font-sans text-xs text-sage-400">
                            {qty > 1 && <span>{qty} × </span>}
                            ${(product.price * qty).toLocaleString("es-AR")}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setSelected((prev) => {
                              const n = new Map(prev);
                              n.delete(product.id);
                              return n;
                            })
                          }
                          className="p-1 text-sage-300 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Totals + CTA */}
              {selectedItems.length > 0 && (
                <div className="px-5 pb-5 pt-3 border-t border-sage-50 flex flex-col gap-3">

                  {/* Progress bar hacia el descuento */}
                  <AnimatePresence>
                    {!hasDiscount && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="font-sans text-[11px] text-sage-500">
                            Te faltan{" "}
                            <span className="font-semibold text-sage-700">
                              ${remaining.toLocaleString("es-AR")}
                            </span>{" "}
                            para el 10% off
                          </p>
                          <Tag className="w-3.5 h-3.5 text-sage-400" />
                        </div>
                        <div className="h-1.5 bg-sage-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-sage-400 rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Descuento aplicado */}
                  <AnimatePresence>
                    {hasDiscount && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-2.5 px-3 py-3 rounded-xl"
                        style={{ background: "#FFF8EC", border: "1px solid #F5D49A" }}
                      >
                        <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: "#D4912C" }} />
                        <div>
                          <p className="font-sans text-xs font-semibold" style={{ color: "#A36A10" }}>
                            ¡Descuento del 10% aplicado!
                          </p>
                          <p className="font-sans text-[11px]" style={{ color: "#C18325" }}>
                            Ahorrás ${discount.toLocaleString("es-AR")}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Precios */}
                  <div className="flex flex-col gap-1">
                    {hasDiscount && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-sans text-xs text-sage-400">Subtotal</span>
                          <span className="font-sans text-xs text-sage-400 line-through">
                            ${subtotal.toLocaleString("es-AR")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-sans text-xs font-medium" style={{ color: "#D4912C" }}>
                            Descuento 10%
                          </span>
                          <span className="font-sans text-xs font-medium" style={{ color: "#D4912C" }}>
                            −${discount.toLocaleString("es-AR")}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="font-sans text-sm font-semibold text-sage-700">Total</span>
                      <span
                        className={cn("font-sans text-lg font-bold", hasDiscount ? "" : "text-sage-800")}
                        style={hasDiscount ? { color: "#D4912C" } : {}}
                      >
                        ${total.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium text-sm transition-colors"
                  >
                    {editId ? <Pencil className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    {editId ? "Guardar cambios" : "Agregar combo al carrito"}
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

export default function ArmatuComboPage() {
  return (
    <Suspense>
      <ArmatuComboContent />
    </Suspense>
  );
}
