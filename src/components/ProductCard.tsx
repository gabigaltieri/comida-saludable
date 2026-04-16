"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Check, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/data";
import { useCart, formatPrice } from "@/lib/cart";
import { cn } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const tagColors: Record<string, string> = {
    "sin gluten": "bg-amber-50 text-amber-700 border-amber-200",
    vegano: "bg-sage-50 text-sage-700 border-sage-200",
    vegetariano: "bg-green-50 text-green-700 border-green-200",
    proteína: "bg-blue-50 text-blue-700 border-blue-200",
    "omega-3": "bg-cyan-50 text-cyan-700 border-cyan-200",
    premium: "bg-purple-50 text-purple-700 border-purple-200",
    artesanal: "bg-orange-50 text-orange-700 border-orange-200",
    gourmet: "bg-rose-50 text-rose-700 border-rose-200",
    "sin lactosa": "bg-sky-50 text-sky-700 border-sky-200",
  };

  return (
    <motion.article
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_8px_40px_rgba(84,125,84,0.14)] transition-all duration-500 hover:-translate-y-1 flex flex-col"
      layout
    >
      {/* Featured badge */}
      {product.featured && (
        <div className="absolute top-3 left-3 z-10 bg-salmon-400 text-white text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
          Destacado
        </div>
      )}

      {/* Quantity badge */}
      <AnimatePresence>
        {quantity > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-3 right-3 z-10 w-6 h-6 bg-sage-500 text-white text-[11px] font-bold font-sans rounded-full flex items-center justify-center shadow"
          >
            {quantity}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-cream-200 flex-shrink-0">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={cn(
                "font-sans text-[10px] px-2 py-0.5 rounded-full border font-medium",
                tagColors[tag] ?? "bg-sage-50 text-sage-600 border-sage-200"
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Name & Description */}
        <div className="flex-1">
          <h3
            className="font-serif text-sage-800 text-xl font-semibold leading-snug mb-1"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            {product.name}
          </h3>
          <p className="font-sans text-sm text-sage-500 leading-snug line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Price & Add button */}
        <div className="flex items-center justify-between gap-3 mt-auto pt-2 border-t border-sage-100">
          <div>
            <p className="font-sans text-xs text-sage-400 leading-none mb-0.5">Precio</p>
            <p
              className="font-serif text-sage-700 text-2xl font-semibold"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              {formatPrice(product.price)}
            </p>
          </div>

          <motion.button
            onClick={handleAdd}
            disabled={!product.available}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2.5 font-sans text-sm font-medium transition-all duration-300",
              justAdded
                ? "bg-sage-500 text-white scale-95"
                : "bg-sage-100 text-sage-700 hover:bg-sage-500 hover:text-white hover:scale-105",
              !product.available && "opacity-40 cursor-not-allowed"
            )}
            whileTap={{ scale: 0.92 }}
          >
            <AnimatePresence mode="wait">
              {justAdded ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="plus"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
            {justAdded ? "¡Listo!" : "Agregar"}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
