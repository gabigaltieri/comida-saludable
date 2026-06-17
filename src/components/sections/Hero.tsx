"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/data";

export default function Hero() {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [imgVisible, setImgVisible] = useState(false);
  const [heading, setHeading] = useState<string | null>(null);
  const [subheading, setSubheading] = useState<string | null>(null);
  const [headingColor, setHeadingColor] = useState<string | null>(null);
  const [subheadingColor, setSubheadingColor] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/banner?id=home-hero")
      .then((r) => r.json())
      .then((d) => {
        if (d.active && d.image_url) setBgImage(d.image_url);
        if (d.heading_text) setHeading(d.heading_text);
        if (d.subheading_text) setSubheading(d.subheading_text);
        if (d.heading_color) setHeadingColor(d.heading_color);
        if (d.subheading_color) setSubheadingColor(d.subheading_color);
      });
  }, []);

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "¡Hola! Me gustaría saber más sobre sus viandas"
  )}`;

  return (
    <section className="relative h-[55vh] min-h-[400px] flex flex-col overflow-hidden bg-white">

      {/* Background image — fade in solo cuando termina de cargar */}
      {bgImage && (
        <div className="absolute inset-0">
          <Image
            src={bgImage}
            alt="Viandas saludables caseras 262 Cosas Ricas"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onLoad={() => setImgVisible(true)}
            style={{ opacity: imgVisible ? 1 : 0, transition: "opacity 0.6s ease" }}
          />
        </div>
      )}


      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center text-center px-5">

        {/* Texto centrado en el área superior */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {subheading && (
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-sans text-[11px] uppercase tracking-[0.35em] block mb-4"
              style={{ color: subheadingColor ?? "rgba(255,255,255,0.5)" }}
            >
              {subheading}
            </motion.span>
          )}

          {heading && (
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif font-light leading-[1.08] max-w-3xl"
              style={{
                fontFamily: "var(--font-cormorant, Georgia, serif)",
                fontSize: "clamp(2.2rem, 5vw, 4rem)",
                color: headingColor ?? "#FFFFFF",
              }}
            >
              {heading}
            </motion.h1>
          )}
        </div>

        {/* Botones anclados al fondo, siempre a la misma distancia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center gap-5 pb-10"
        >
          <Link
            href="/tienda"
            className="font-sans text-[11px] uppercase tracking-[0.25em] text-white bg-sage-600 hover:bg-sage-500 border border-sage-400 px-9 py-4 min-w-[240px] flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-sage-900/30 hover:-translate-y-0.5"
          >
            Descubrí nuestras opciones
          </Link>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[11px] uppercase tracking-[0.2em] text-white bg-white/15 border border-white/70 hover:bg-white/25 hover:border-white flex items-center justify-center gap-2 px-9 py-4 min-w-[240px] transition-all duration-300 backdrop-blur-sm"
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
        className="relative z-10 flex flex-col items-center gap-1.5 pb-5 text-white/30"
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
