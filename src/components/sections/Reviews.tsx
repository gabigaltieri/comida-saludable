"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    name: "Valentina R.",
    avatar: "V",
    avatarColor: "bg-sage-500",
    rating: 5,
    date: "Hace 2 semanas",
    text: "Las viandas son increíbles. Se nota que usan ingredientes de calidad y que hay amor en la preparación. El bowl de salmón es mi favorito. 100% recomendable.",
    via: "Google",
  },
  {
    id: 2,
    name: "Martín G.",
    avatar: "M",
    avatarColor: "bg-salmon-400",
    rating: 5,
    date: "Hace 1 mes",
    text: "Contraté el catering para el desayuno de nuestra empresa y fue un éxito total. Presentación hermosa, todo muy rico y saludable. Ya les voy a pedir para el próximo evento.",
    via: "Google",
  },
  {
    id: 3,
    name: "Camila F.",
    avatar: "C",
    avatarColor: "bg-sage-400",
    rating: 5,
    date: "Hace 3 semanas",
    text: "Empecé con las viandas semanales y cambió mi vida. Ahorro tiempo, como sano y rico. Las congeladas son perfectas para los días que llego tarde. Super recomendado!",
    via: "Instagram",
  },
  {
    id: 4,
    name: "Lucía P.",
    avatar: "L",
    avatarColor: "bg-amber-400",
    rating: 5,
    date: "Hace 1 semana",
    text: "La tarta de zapallito con ricota es lo mejor que probé en mucho tiempo. Todo llega impecable, el packaging es muy cuidado. Un negocio con mucho amor.",
    via: "Google",
  },
];

const STATS = [
  { value: "4.8★", label: "Puntuación promedio" },
  { value: "200+", label: "Reseñas positivas" },
  { value: "3 años", label: "En el barrio" },
  { value: "500+", label: "Familias felices" },
];

export default function Reviews() {
  return (
    <section id="about" className="py-20 md:py-28 bg-sage-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-sage-600 opacity-50 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-sage-800 opacity-50 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 md:px-8">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 pb-16 border-b border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <p
                className="font-serif text-5xl md:text-6xl text-white font-semibold leading-none mb-2"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
              >
                {stat.value}
              </p>
              <p className="font-sans text-xs text-white/50 uppercase tracking-widest">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <motion.p
              className="font-sans text-white/40 text-xs uppercase tracking-[0.2em] mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Reseñas
            </motion.p>
            <motion.h2
              className="font-serif text-white text-4xl md:text-5xl leading-tight"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              Lo que dicen
              <br />
              nuestros clientes
            </motion.h2>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="font-sans text-white/70 text-sm ml-1">4.8 / 5</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.id}
              className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/12 transition-colors"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              {/* Quote icon */}
              <Quote className="w-5 h-5 text-white/20" />

              {/* Review text */}
              <p className="font-sans text-sm text-white/80 leading-relaxed flex-1">
                "{review.text}"
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full ${review.avatarColor} flex items-center justify-center text-white font-sans font-bold text-sm flex-shrink-0`}
                  >
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-sans text-white text-sm font-medium">{review.name}</p>
                    <p className="font-sans text-white/40 text-[11px]">{review.date}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-sans text-[10px] text-white/30">{review.via}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
