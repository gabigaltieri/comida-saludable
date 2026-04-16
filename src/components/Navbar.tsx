"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, Instagram, Leaf } from "lucide-react";
import { useCart } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";
import { INSTAGRAM_HANDLE } from "@/lib/data";

const navLinks = [
  { label: "Menú", href: "#menu" },
  { label: "Catering", href: "#catering" },
  { label: "Nosotros", href: "#about" },
  { label: "Contacto", href: "#location" },
];

export default function Navbar({ onCartOpen }: { onCartOpen: () => void }) {
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
            : "bg-transparent"
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
                className="font-serif text-sage-800 font-semibold text-lg md:text-xl leading-none"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
              >
                262
              </span>
              <span className="font-sans text-sage-500 text-[9px] uppercase tracking-[0.18em] leading-none mt-0.5">
                Cosas Ricas
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-sans text-sm text-sage-700 hover:text-sage-500 transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-salmon-400 group-hover:w-full transition-all duration-300" />
                </a>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href={`https://instagram.com/262.cosasricas`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-sage-600 hover:text-salmon-400 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>

            <button
              onClick={onCartOpen}
              className="relative p-2.5 rounded-full bg-sage-100 hover:bg-sage-200 text-sage-700 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label={`Ver carrito (${itemCount} items)`}
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-salmon-400 text-white text-[10px] font-bold font-sans rounded-full flex items-center justify-center"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-sage-700"
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
            className="fixed inset-x-0 top-16 z-40 bg-cream-100/98 backdrop-blur-md border-b border-sage-100 shadow-lg md:hidden"
          >
            <ul className="flex flex-col p-6 gap-1">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 font-serif text-2xl text-sage-800 hover:text-sage-500 transition-colors"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.06 }}
                className="pt-4 border-t border-sage-100"
              >
                <a
                  href="https://instagram.com/262.cosasricas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-sage-500"
                >
                  <Instagram className="w-4 h-4" />
                  {INSTAGRAM_HANDLE}
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
