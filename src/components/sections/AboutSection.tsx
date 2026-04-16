"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Leaf, Heart, Zap, Shield } from "lucide-react";

const VALUES = [
  {
    icon: Leaf,
    title: "Ingredientes reales",
    description: "Compramos a proveedores locales. Sin aditivos, sin conservantes, sin trucos.",
    color: "bg-sage-100 text-sage-600",
  },
  {
    icon: Heart,
    title: "Hecho con amor",
    description: "Cada preparación lleva el cuidado de una cocina casera con estándares profesionales.",
    color: "bg-salmon-100 text-salmon-500",
  },
  {
    icon: Zap,
    title: "Listo en minutos",
    description: "Para que tengas más tiempo de hacer lo que te gusta. Comer rico sin cocinar.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Shield,
    title: "Packaging responsable",
    description: "Usamos recipientes biodegradables y reutilizables. Cuidamos el planeta también.",
    color: "bg-sky-100 text-sky-600",
  },
];

export default function AboutSection() {
  return (
    <section className="py-20 md:py-28 bg-cream-200 relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-sage-100 opacity-60 blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Image */}
          <motion.div
            className="relative h-[400px] md:h-[520px] order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(84,125,84,0.18)]">
              <Image
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
                alt="Cocina artesanal de 262 Cosas Ricas, preparando viandas con ingredientes frescos"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-sage-900/5 to-sage-900/20" />
            </div>

            {/* Decorative second image */}
            <motion.div
              className="absolute -bottom-6 -right-6 w-36 h-44 rounded-3xl overflow-hidden shadow-xl border-4 border-cream-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80"
                alt="Ingredientes frescos y coloridos usados en la preparación de viandas"
                fill
                className="object-cover"
                sizes="160px"
              />
            </motion.div>

            {/* Floating badge */}
            <motion.div
              className="absolute top-6 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 max-w-[160px]"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <p className="font-sans text-[10px] text-sage-400 uppercase tracking-wider mb-1">
                Cocinamos
              </p>
              <p
                className="font-serif text-sage-800 font-semibold text-base leading-tight"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
              >
                Con ingredientes del día
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <motion.p
              className="section-label mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Nuestra filosofía
            </motion.p>
            <motion.h2
              className="section-title text-4xl md:text-5xl mb-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              Comer bien
              <br />
              no debería ser
              <br />
              <span className="italic text-sage-500">complicado.</span>
            </motion.h2>

            <motion.p
              className="font-sans text-sage-600 text-base leading-relaxed mb-8 max-w-sm"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Somos un emprendimiento familiar ubicado en el límite entre Palermo y Villa Crespo.
              Cada día preparamos viandas frescas para que vos puedas comer rico, nutritivo y
              sin perder tiempo.
            </motion.p>

            {/* Values */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {VALUES.map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.title}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-white/60 hover:bg-white/90 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${val.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-semibold text-sage-800 mb-0.5">
                        {val.title}
                      </p>
                      <p className="font-sans text-xs text-sage-500 leading-snug">
                        {val.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
