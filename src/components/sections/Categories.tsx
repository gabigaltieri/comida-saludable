"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/data";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Categories({ onCategorySelect }: { onCategorySelect: (id: string) => void }) {
  return (
    <section id="categories" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <motion.p
              className="section-label mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Lo que ofrecemos
            </motion.p>
            <motion.h2
              className="section-title text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              Nuestras categorías
            </motion.h2>
          </div>
          <motion.p
            className="font-sans text-sm text-sage-500 max-w-xs"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Cada línea fue pensada para distintos momentos de tu semana.
          </motion.p>
        </div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {CATEGORIES.map((cat, idx) => (
            <motion.button
              key={cat.id}
              variants={cardVariants}
              onClick={() => onCategorySelect(cat.id)}
              className="group relative overflow-hidden rounded-2xl text-left card-hover cursor-pointer focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-offset-2"
              style={{ minHeight: idx === 0 || idx === 3 ? "320px" : "280px" }}
            >
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src={cat.image}
                  alt={cat.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-sage-900/80 via-sage-900/20 to-transparent transition-opacity duration-300 group-hover:from-sage-900/90" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans text-white/60 text-[10px] uppercase tracking-widest mb-1">
                      {cat.emoji} {cat.shortName}
                    </p>
                    <h3
                      className="font-serif text-white text-xl md:text-2xl font-semibold leading-tight"
                      style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                    >
                      {cat.name}
                    </h3>
                    <p className="font-sans text-white/70 text-xs mt-1.5 leading-snug line-clamp-2 max-w-[200px]">
                      {cat.description}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ml-3 group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Top badge */}
              <div className="absolute top-4 left-4">
                <span className="font-sans text-[10px] bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full border border-white/20">
                  Ver todo
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
