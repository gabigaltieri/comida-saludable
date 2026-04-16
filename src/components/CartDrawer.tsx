"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, Package } from "lucide-react";
import { useCart, formatPrice } from "@/lib/cart";
import Image from "next/image";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, total, itemCount, clearCart, sendToWhatsApp } = useCart();

  const handleCheckout = () => {
    sendToWhatsApp();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-cream-100 shadow-[−20px_0_60px_rgba(0,0,0,0.15)] flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-sage-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sage-100 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-sage-600" />
                </div>
                <div>
                  <h2
                    className="font-serif text-sage-800 text-xl font-semibold"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                  >
                    Tu pedido
                  </h2>
                  <p className="font-sans text-xs text-sage-400">
                    {itemCount} {itemCount === 1 ? "producto" : "productos"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-sage-100 text-sage-500 transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                  <div className="w-16 h-16 rounded-2xl bg-sage-100 flex items-center justify-center">
                    <Package className="w-8 h-8 text-sage-300" />
                  </div>
                  <div>
                    <p
                      className="font-serif text-sage-600 text-2xl mb-1"
                      style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                    >
                      Tu carrito está vacío
                    </p>
                    <p className="font-sans text-sm text-sage-400">
                      Explorá nuestro menú y sumá productos
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="btn-primary text-sm py-2.5 px-5 text-sm"
                  >
                    Ver menú
                  </button>
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        className="bg-white rounded-2xl p-3.5 flex gap-3 shadow-sm"
                      >
                        {/* Image */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-200 flex-shrink-0">
                          <Image
                            src={item.product.image}
                            alt={item.product.imageAlt}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-serif text-sage-800 font-semibold text-base leading-snug truncate"
                            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                          >
                            {item.product.name}
                          </p>
                          <p className="font-sans text-sage-500 text-xs mt-0.5">
                            {formatPrice(item.product.price)} c/u
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-7 h-7 rounded-full bg-sage-100 hover:bg-sage-200 text-sage-600 flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-sans text-sage-800 font-semibold text-sm w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-7 h-7 rounded-full bg-sage-100 hover:bg-sage-200 text-sage-600 flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <p
                                className="font-serif text-sage-700 font-semibold text-lg"
                                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                              >
                                {formatPrice(item.product.price * item.quantity)}
                              </p>
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="p-1.5 rounded-full text-sage-300 hover:text-salmon-400 hover:bg-salmon-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Clear cart */}
                  <button
                    onClick={clearCart}
                    className="font-sans text-xs text-sage-400 hover:text-salmon-400 transition-colors text-center py-2"
                  >
                    Vaciar carrito
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 bg-white border-t border-sage-200">
                {/* Total */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="font-sans text-sage-500 text-sm">Subtotal</span>
                  <span
                    className="font-serif text-sage-800 text-2xl font-semibold"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>

                <p className="font-sans text-[11px] text-sage-400 text-center mb-4">
                  El precio de delivery se coordina por WhatsApp según tu zona.
                </p>

                {/* WhatsApp checkout button */}
                <button onClick={handleCheckout} className="btn-whatsapp w-full justify-center text-base py-4">
                  <MessageCircle className="w-5 h-5" />
                  Confirmar pedido por WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
