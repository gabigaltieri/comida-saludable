"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Leaf, ArrowLeft, UserCircle2, LogOut, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import CartDrawer from "./CartDrawer";

export default function StoreNavbar() {
  const { itemCount, isOpen, openCart, closeCart } = useCart();
  const { user, profile, isEmailConfirmed, openAuthModal, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const displayName =
    profile?.nombre?.split(" ")[0] ??
    (user?.user_metadata?.nombre as string | undefined)?.split(" ")[0] ??
    "Mi cuenta";

  return (
    <>
      <header className="sticky top-0 z-50 bg-cream-100/95 backdrop-blur-md border-b border-sage-100 shadow-sm">
        <nav className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center group-hover:bg-sage-600 transition-colors">
              <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-sage-800 font-semibold text-lg leading-none"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                262
              </span>
              <span className="font-sans text-sage-500 text-[9px] uppercase tracking-[0.18em] leading-none mt-0.5">
                Cosas Ricas
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/"
              className="hidden md:flex items-center gap-1.5 text-sm font-sans text-sage-600 hover:text-sage-800 transition-colors mr-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              Inicio
            </Link>

            {/* User area */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-sage-100 hover:bg-sage-200 text-sage-700 transition-all text-sm font-sans font-medium"
                >
                  <UserCircle2 className="w-4 h-4" />
                  <span className="hidden sm:block max-w-[100px] truncate">{displayName}</span>
                  {!isEmailConfirmed && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Email sin confirmar" />
                  )}
                  <ChevronDown className="w-3 h-3" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-sage-100 z-20 overflow-hidden py-1"
                      >
                        <div className="px-4 py-3 border-b border-sage-50">
                          <p className="font-sans text-xs text-sage-400">Sesión iniciada como</p>
                          <p className="font-sans text-sm text-sage-700 font-medium truncate">{user.email}</p>
                          {!isEmailConfirmed && (
                            <p className="font-sans text-[11px] text-amber-500 mt-0.5 flex items-center gap-1">
                              ⚠️ Email sin confirmar
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 font-sans text-sm text-sage-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesión
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-sage-100 hover:bg-sage-200 text-sage-700 transition-all text-sm font-sans font-medium"
              >
                <UserCircle2 className="w-4 h-4" />
                <span className="hidden sm:block">Iniciar sesión</span>
              </button>
            )}

            {/* Cart */}
            <div className="relative">
              <button
                onClick={openCart}
                className="p-2.5 rounded-full bg-sage-100 hover:bg-sage-200 text-sage-700 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label={`Ver carrito (${itemCount} items)`}
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span key="badge" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-salmon-400 text-white text-[10px] font-bold font-sans rounded-full flex items-center justify-center pointer-events-none">
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>
      </header>

      <CartDrawer open={isOpen} onClose={closeCart} />
    </>
  );
}
