"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/data";

export default function Hero() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "¡Hola! Me gustaría saber más sobre sus viandas 🌿"
  )}`;

  return (
    <section className="relative h-screen flex flex-col overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1600&q=90"
          alt="Viandas saludables caseras 262 Cosas Ricas"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5">

        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-sans text-white/50 text-[11px] uppercase tracking-[0.35em] block mb-7"
        >
          Palermo &amp; Villa Crespo · Buenos Aires
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-white font-light leading-[1.08] mb-10 max-w-4xl"
          style={{
            fontFamily: "var(--font-cormorant, Georgia, serif)",
            fontSize: "clamp(3.2rem, 7.5vw, 6.5rem)",
          }}
        >
          Viandas saludables,
          <br />
          para todas tus{" "}
          <em className="italic font-normal" style={{ color: "#D4B882" }}>
            metas.
          </em>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center gap-5"
        >
          <Link
            href="/tienda"
            className="font-sans text-[11px] uppercase tracking-[0.25em] text-white bg-sage-600 hover:bg-sage-500 border border-sage-400 px-9 py-4 transition-all duration-300 shadow-lg hover:shadow-sage-900/30 hover:-translate-y-0.5"
          >
            Descubrí nuestras opciones
          </Link>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[11px] uppercase tracking-[0.2em] text-white bg-white/15 border border-white/70 hover:bg-white/25 hover:border-white flex items-center gap-2 px-7 py-4 transition-all duration-300 backdrop-blur-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Pedir por WhatsApp
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="relative z-10 flex flex-col items-center gap-1.5 pb-10 text-white/30"
      >
        <span className="font-sans text-[9px] uppercase tracking-[0.3em]">Explorá</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* Marquee strip */}
      <div className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-sm py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center">
              {[
                "Ensaladas Frescas",
                "Viandas Congeladas",
                "Menú del Día",
                "Sin Conservantes",
                "Hecho en Casa",
                "Delivery CABA",
              ].map((item) => (
                <span key={item} className="font-sans text-[11px] text-white/50 uppercase tracking-[0.2em] mx-8">
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
