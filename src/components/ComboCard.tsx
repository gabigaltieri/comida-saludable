"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Gift, Tag } from "lucide-react";
import { Combo, Product } from "@/lib/data";
import { useCart, formatPrice } from "@/lib/cart";
import { cn } from "@/lib/utils";

export default function ComboCard({
  combo,
  products,
}: {
  combo: Combo;
  products: Product[];
}) {
  const { addCombo, comboItems, openCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const comboItem = comboItems.find((i) => i.combo.id === combo.id);
  const quantity = comboItem?.quantity ?? 0;

  const includedProducts = products.filter((p) => combo.product_ids.includes(p.id));
  const originalPrice = includedProducts.reduce((sum, p) => sum + p.price, 0);
  const savings = originalPrice > combo.price ? originalPrice - combo.price : 0;

  const handleAdd = () => {
    addCombo(combo);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
    openCart();
  };

  return (
    <motion.article
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_8px_40px_rgba(84,125,84,0.14)] transition-all duration-500 hover:-translate-y-1 flex flex-col border border-sage-100"
      layout
    >
      {/* Badge combo */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
        <Gift className="w-3 h-3" />
        Combo
      </div>

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
        {combo.image ? (
          <Image
            src={combo.image}
            alt={combo.imageAlt || combo.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-amber-50">
            <Gift className="w-16 h-16 text-amber-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Included products */}
        {includedProducts.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {includedProducts.map((p) => (
              <span
                key={p.id}
                className="font-sans text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium"
              >
                {p.name}
              </span>
            ))}
          </div>
        )}

        {/* Name & Description */}
        <div className="flex-1">
          <h3
            className="font-serif text-sage-800 text-xl font-semibold leading-snug mb-1"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            {combo.name}
          </h3>
          <p className="font-sans text-sm text-sage-500 leading-snug line-clamp-2">
            {combo.description}
          </p>
        </div>

        {/* Savings badge */}
        {savings > 0 && (
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
            <Tag className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span className="font-sans text-xs text-green-700 font-medium">
              Ahorrás {formatPrice(savings)} vs. precio individual
            </span>
          </div>
        )}

        {/* Price & Add button */}
        <div className="flex items-center justify-between gap-3 mt-auto pt-2 border-t border-sage-100">
          <div>
            <p className="font-sans text-xs text-sage-400 leading-none mb-0.5">Precio combo</p>
            <div className="flex items-baseline gap-1.5">
              <p
                className="font-serif text-sage-700 text-2xl font-semibold"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
              >
                {formatPrice(combo.price)}
              </p>
              {originalPrice > combo.price && (
                <p className="font-sans text-xs text-sage-400 line-through">
                  {formatPrice(originalPrice)}
                </p>
              )}
            </div>
          </div>

          <motion.button
            onClick={handleAdd}
            disabled={!combo.available}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2.5 font-sans text-sm font-medium transition-all duration-300",
              justAdded
                ? "bg-sage-500 text-white scale-95"
                : "bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white hover:scale-105",
              !combo.available && "opacity-40 cursor-not-allowed"
            )}
            whileTap={{ scale: 0.92 }}
          >
            <AnimatePresence mode="wait">
              {justAdded ? (
                <motion.span key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                  <Check className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
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
