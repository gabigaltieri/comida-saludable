"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, Instagram, Leaf, Store, UserCircle2, LogOut } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { INSTAGRAM_HANDLE } from "@/lib/data";

const navLinks = [
  { label: "Menú", href: "#menu" },
  { label: "Viandas", href: "/tienda/viandas" },
  { label: "Nosotros", href: "#about" },
  { label: "Contacto", href: "#location" },
];

export default function Navbar({ onCartOpen }: { onCartOpen: () => void }) {
  const { itemCount } = useCart();
  const { user, profile, openAuthModal, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const displayName =
    profile?.nombre?.split(" ")[0] ??
    (user?.user_metadata?.nombre as string | undefined)?.split(" ")[0] ??
    "Mi cuenta";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-cream-100/95 backdrop-blur-md shadow-[0_1px_30px_rgba(84,125,84,0.10)]"
            : "bg-black/40 backdrop-blur-sm"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav className="max-w-6xl mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center group-hover:bg-sage-600 transition-colors">
              <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className={`font-serif font-semibold text-lg md:text-xl leading-none transition-colors duration-500 ${scrolled ? "text-sage-800" : "text-white"}`}
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
              >
                262
              </span>
              <span className={`font-sans text-[9px] uppercase tracking-[0.18em] leading-none mt-0.5 transition-colors duration-500 ${scrolled ? "text-sage-500" : "text-white/70"}`}>
                Cosas Ricas
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                {link.href.startsWith("/") ? (
                  <Link
                    href={link.href}
                    className={`font-sans text-sm transition-colors duration-300 relative group ${scrolled ? "text-sage-700 hover:text-sage-500" : "text-white hover:text-white/70"}`}
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-salmon-400 group-hover:w-full transition-all duration-300" />
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={`font-sans text-sm transition-colors duration-300 relative group ${scrolled ? "text-sage-700 hover:text-sage-500" : "text-white hover:text-white/70"}`}
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-salmon-400 group-hover:w-full transition-all duration-300" />
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/tienda"
              className={`hidden md:flex items-center gap-1.5 text-sm font-sans font-medium px-3.5 py-2 rounded-full transition-colors duration-300 ${scrolled ? "text-sage-700 hover:text-sage-500 bg-sage-100 hover:bg-sage-200" : "text-white bg-white/20 hover:bg-white/30"}`}
            >
              <Store className="w-3.5 h-3.5" />
              Tienda
            </Link>
            <a
              href={`https://instagram.com/262.cosasricas`}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden md:flex items-center gap-1.5 transition-colors duration-300 hover:text-salmon-400 ${scrolled ? "text-sage-600" : "text-white/80"}`}
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* User auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className={`flex items-center p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${scrolled ? "bg-sage-100 hover:bg-sage-200 text-sage-700" : "bg-white/20 hover:bg-white/30 text-white"}`}
                >
                  <UserCircle2 className="w-5 h-5" />
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
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-sage-100 z-20 overflow-hidden py-1"
                      >
                        <div className="px-4 py-3 border-b border-sage-50">
                          <p className="font-sans text-xs text-sage-400">Sesión iniciada como</p>
                          <p className="font-sans text-sm text-sage-700 font-medium truncate">{user.email}</p>
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
                className={`flex items-center p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${scrolled ? "bg-sage-100 hover:bg-sage-200 text-sage-700" : "bg-white/20 hover:bg-white/30 text-white"}`}
                aria-label="Iniciar sesión"
              >
                <UserCircle2 className="w-5 h-5" />
              </button>
            )}

            <div className="relative">
              <button
                onClick={onCartOpen}
                className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${scrolled ? "bg-sage-100 hover:bg-sage-200 text-sage-700" : "bg-white/20 hover:bg-white/30 text-white"}`}
                aria-label={`Ver carrito (${itemCount} items)`}
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-salmon-400 text-white text-[10px] font-bold font-sans rounded-full flex items-center justify-center pointer-events-none"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <button
              className={`md:hidden p-2.5 rounded-full transition-all duration-300 ${scrolled ? "bg-sage-100 text-sage-700" : "bg-white/20 text-white"}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden shadow-xl"
            style={{ background: "#fdf9f3" }}
          >
            {/* franja decorativa superior */}
            <div className="h-1 w-full bg-gradient-to-r from-sage-300 via-sage-500 to-sage-300" />

            <div className="px-6 pt-5 pb-2">
              <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-sage-400">
                262 Cosas Ricas
              </p>
            </div>

            <ul className="flex flex-col px-6 pb-4 gap-0">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="border-b border-sage-100 last:border-0"
                >
                  {link.href.startsWith("/") ? (
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 py-3.5 font-serif text-2xl text-sage-800 hover:text-sage-500 transition-colors group"
                      style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                    >
                      <span className="w-1 h-5 rounded-full bg-sage-300 group-hover:bg-sage-500 transition-colors flex-shrink-0" />
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 py-3.5 font-serif text-2xl text-sage-800 hover:text-sage-500 transition-colors group"
                      style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                    >
                      <span className="w-1 h-5 rounded-full bg-sage-300 group-hover:bg-sage-500 transition-colors flex-shrink-0" />
                      {link.label}
                    </a>
                  )}
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.06 }}
                className="border-b border-sage-100"
              >
                <Link
                  href="/tienda"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-3.5 font-serif text-2xl text-sage-800 hover:text-sage-500 transition-colors group"
                  style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                >
                  <span className="w-1 h-5 rounded-full bg-sage-300 group-hover:bg-sage-500 transition-colors flex-shrink-0" />
                  Tienda
                </Link>
              </motion.li>
            </ul>

            {/* footer del menu */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-sage-100">
              <a
                href="https://instagram.com/262.cosasricas"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-sage-500 hover:text-sage-700 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                {INSTAGRAM_HANDLE}
              </a>
              <div className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-sage-400" />
                <span className="font-sans text-[10px] text-sage-400 tracking-wide">Comida saludable</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
