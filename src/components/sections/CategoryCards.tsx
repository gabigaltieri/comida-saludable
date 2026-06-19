"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CARDS = [
  {
    label: "Viandas Congeladas",
    href: "#menu",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
    emoji: "❄️",
  },
  {
    label: "Viandas Diarias",
    href: "/tienda/viandas/viandas-diarias",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    emoji: "🥗",
  },
  {
    label: "Catering y Eventos",
    href: "#catering-eventos",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
    emoji: "🎉",
  },
  {
    label: "Viandas para Empresas",
    href: "#viandas-empresas",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    emoji: "🏢",
  },
];

export default function CategoryCards() {
  return (
    <section className="py-12 px-5 md:px-8" style={{ background: "#EDEAE4" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CARDS.map((card, i) => (
            <motion.a
              key={card.href}
              href={card.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
            >
              {/* Imagen */}
              <Image
                src={card.image}
                alt={card.label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
              />

              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80" />

              {/* Contenido */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <span className="text-xl mb-1 block">{card.emoji}</span>
                <h3
                  className="font-serif text-white font-light text-xl md:text-2xl leading-tight mb-2"
                  style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                >
                  {card.label}
                </h3>
                <span className="inline-flex items-center gap-1 font-sans text-xs text-white/70 group-hover:text-white transition-colors">
                  Ver más <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
