"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MessageCircle, Star, ChevronDown, Sparkles } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

const TRUST_BADGES = [
  "Sin conservantes",
  "Ingredientes frescos",
  "Hecho en casa",
  "Entrega en CABA",
];

export default function Hero() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "¡Hola! Me gustaría saber más sobre sus viandas y hacer un pedido 🌿"
  )}`;

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-cream-100">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large sage circle top right */}
        <motion.div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-sage-100 opacity-60"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* Salmon blob bottom left */}
        <motion.div
          className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-salmon-100 opacity-40"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
        />
        {/* Dotted pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #547d54 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 w-full pt-28 md:pt-36 pb-12 flex-1 flex flex-col">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center flex-1">

          {/* Left: Text content */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-sage-200 rounded-full px-4 py-2 w-fit shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-salmon-400" />
              <span className="font-sans text-xs font-medium text-sage-600 tracking-wide">
                Comida saludable en Palermo & Villa Crespo
              </span>
            </motion.div>

            {/* Main headline */}
            <div className="flex flex-col gap-2">
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.2}
                className="font-serif leading-[1.05] text-sage-800"
                style={{
                  fontFamily: "var(--font-cormorant, Georgia, serif)",
                  fontSize: "clamp(3rem, 8vw, 5.5rem)",
                }}
              >
                Comida que te{" "}
                <span className="relative inline-block">
                  <span className="italic text-sage-500">simplifica</span>
                  <motion.span
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-salmon-300 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                  />
                </span>{" "}
                la vida.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.35}
                className="font-sans text-base md:text-lg text-sage-600 leading-relaxed max-w-md"
              >
                Viandas frescas, congeladas y catering boutique elaborados con
                ingredientes de calidad. Sin apuro, sin excusas, con mucho sabor.
              </motion.p>
            </div>

            {/* Trust — stars */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.45}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < 5 ? "fill-amber-400 text-amber-400" : "text-sage-200"}`}
                  />
                ))}
              </div>
              <span className="font-sans text-sm text-sage-600">
                <strong className="text-sage-800">4.8</strong> en Google · más de 200 reseñas
              </span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.55}
              className="flex flex-wrap gap-3 items-center"
            >
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <MessageCircle className="w-5 h-5" />
                Pedir por WhatsApp
              </a>
              <a href="#menu" className="btn-primary">
                Ver menú completo
              </a>
            </motion.div>

            {/* Trust badges marquee-style on mobile */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.65}
              className="flex flex-wrap gap-2"
            >
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="font-sans text-xs text-sage-600 bg-white/70 border border-sage-200 rounded-full px-3 py-1"
                >
                  {badge}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Image collage */}
          <motion.div
            className="relative h-[400px] md:h-[540px] lg:h-[580px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Main large image */}
            <div className="absolute top-0 left-4 right-0 bottom-12 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(84,125,84,0.22)] bg-sage-100">
              <Image
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=85"
                alt="Vianda saludable casera con verduras frescas y cereales integrales lista para llevar"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sage-800/20 to-transparent" />
            </div>

            {/* Floating card: rating */}
            <motion.div
              className="absolute bottom-4 left-0 z-10 bg-white rounded-2xl shadow-[0_8px_32px_rgba(84,125,84,0.18)] p-4 flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              style={{ animation: "float 6s ease-in-out infinite" }}
            >
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-xl flex-shrink-0">
                🌿
              </div>
              <div>
                <p className="font-sans text-[11px] text-sage-500 font-medium">Opción del día</p>
                <p className="font-serif text-sage-800 font-semibold text-sm" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                  Bowl de Pollo al Limón
                </p>
              </div>
            </motion.div>

            {/* Floating card: delivery */}
            <motion.div
              className="absolute top-8 -left-4 z-10 bg-white rounded-2xl shadow-[0_8px_32px_rgba(84,125,84,0.18)] px-4 py-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <p className="font-sans text-xs font-semibold text-sage-700">🚴 Entrega a domicilio</p>
              <p className="font-sans text-[10px] text-sage-400">Palermo, V. Crespo & más</p>
            </motion.div>

            {/* Small secondary image */}
            <motion.div
              className="absolute bottom-16 right-[-16px] w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-xl border-2 border-white"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80"
                alt="Ensalada fresca colorida con vegetales de temporada"
                fill
                className="object-cover"
                sizes="150px"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="flex flex-col items-center gap-1 mt-8 text-sage-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <span className="font-sans text-[10px] tracking-widest uppercase">Explorá</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>

      {/* Marquee strip */}
      <div className="relative z-10 border-y border-sage-200 bg-sage-500 py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-0">
              {[
                "🥗 Ensaladas Frescas",
                "❄️ Viandas Congeladas",
                "🥘 Menú del Día",
                "🎉 Catering Boutique",
                "🌿 Sin Conservantes",
                "🏠 Hecho en Casa",
                "🚴 Delivery CABA",
              ].map((item) => (
                <span
                  key={item}
                  className="font-sans text-xs md:text-sm text-white font-medium tracking-wide mx-6"
                >
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
