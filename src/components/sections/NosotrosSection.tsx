"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Leaf } from "lucide-react";

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    alt: "Cocina artesanal 262 Cosas Ricas",
    className: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    alt: "Ingredientes frescos y naturales",
    className: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
    alt: "Viandas saludables preparadas con amor",
    className: "col-span-1 row-span-1",
  },
];

const PARAGRAPHS = [
  "Hace más de 15 años acompañamos a quienes eligen alimentarse mejor, creando viandas saludables, caseras y llenas de sabor.",
  "Cocinamos con amor, como si cada plato fuera para nuestra propia familia, cuidando cada detalle y seleccionando ingredientes de calidad.",
  "Creemos en una cocina saludable, rica y equilibrada, con ese sabor casero que hace sentir como en casa.",
];

export default function NosotrosSection() {
  return (
    <section id="about" className="py-24 md:py-32 overflow-hidden" style={{ background: "#fdf9f3" }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ── Texto ── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 lg:order-1"
          >
            {/* Label */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4 h-4 text-sage-600" />
              </div>
              <p className="font-sans text-xs uppercase tracking-[0.35em]" style={{ color: "#9A8B6E" }}>
                Quiénes somos
              </p>
            </div>

            {/* Título decorativo */}
            <h2
              className="font-serif font-light text-4xl md:text-5xl leading-[1.12] mb-10"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}
            >
              Más de{" "}
              <em className="italic font-normal" style={{ color: "#9A8B6E" }}>
                15 años
              </em>
              <br />
              cocinando con amor.
            </h2>

            {/* Párrafos */}
            <div className="flex flex-col gap-6">
              {PARAGRAPHS.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="font-sans text-base leading-relaxed"
                  style={{ color: "#6b7a6b" }}
                >
                  {p}
                </motion.p>
              ))}
            </div>

            {/* Separador decorativo */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10 flex items-center gap-4"
              style={{ transformOrigin: "left" }}
            >
              <div className="h-px flex-1 max-w-[80px]" style={{ background: "#D4C9B8" }} />
              <p className="font-sans text-xs uppercase tracking-[0.3em]" style={{ color: "#b8a88a" }}>
                262 Cosas Ricas
              </p>
            </motion.div>
          </motion.div>

          {/* ── Imágenes ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2"
          >
            <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[480px] md:h-[540px]">
              {/* Imagen principal — ocupa toda la columna izquierda */}
              <div className="col-span-1 row-span-2 relative rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={IMAGES[0].src}
                  alt={IMAGES[0].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Imagen superior derecha */}
              <motion.div
                className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <Image
                  src={IMAGES[1].src}
                  alt={IMAGES[1].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 25vw, 15vw"
                />
              </motion.div>

              {/* Imagen inferior derecha */}
              <motion.div
                className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.35 }}
              >
                <Image
                  src={IMAGES[2].src}
                  alt={IMAGES[2].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 25vw, 15vw"
                />
                {/* Badge flotante */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm">
                    <p className="font-sans text-[10px] text-stone-400 uppercase tracking-wider mb-0.5">
                      Desde 2009
                    </p>
                    <p
                      className="font-serif text-stone-700 text-base font-semibold leading-tight"
                      style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                    >
                      Con ingredientes del día
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
