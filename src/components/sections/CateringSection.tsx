"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/data";

const FEATURES = [
  "Menús personalizados según el evento",
  "Opciones vegetarianas, veganas y sin TACC",
  "Presentación boutique y packaging cuidado",
  "Coordinación de entrega en CABA y GBA",
  "Cotización sin cargo en 24hs",
  "Ideal para 10 a 200 personas",
];

export default function CateringSection() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "¡Hola! Me interesa cotizar un catering para un evento 🎉"
  )}`;

  return (
    <section id="catering" className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #547d54 0px, #547d54 1px, transparent 0px, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Content */}
          <div>
            <motion.p
              className="section-label mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Para eventos
            </motion.p>
            <motion.h2
              className="section-title text-4xl md:text-5xl mb-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              Catering
              <br />
              <span className="italic text-sage-500">boutique</span> para
              <br />
              tu evento.
            </motion.h2>

            <motion.p
              className="font-sans text-sage-600 text-base leading-relaxed mb-8 max-w-sm"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              Desayunos ejecutivos, almuerzos de trabajo, baby showers, reuniones de equipo.
              Llevamos nuestra cocina saludable y elegante a tu evento.
            </motion.p>

            {/* Features list */}
            <motion.ul
              className="flex flex-col gap-3 mb-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
            >
              {FEATURES.map((feat) => (
                <li key={feat} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sage-500 flex-shrink-0" />
                  <span className="font-sans text-sm text-sage-700">{feat}</span>
                </li>
              ))}
            </motion.ul>

            <motion.a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp inline-flex"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
            >
              <MessageCircle className="w-5 h-5" />
              Pedir cotización gratuita
            </motion.a>
          </div>

          {/* Right: Image grid */}
          <motion.div
            className="grid grid-cols-2 gap-3 h-[480px]"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative rounded-3xl overflow-hidden col-span-2 row-span-1 h-[55%]">
              <Image
                src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80"
                alt="Catering boutique saludable para eventos corporativos y sociales con presentación elegante"
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
            <div className="relative rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80"
                alt="Desayuno corporativo saludable con frutas frescas y jugos naturales"
                fill
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="relative rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80"
                alt="Mesa de catering con opciones vegetarianas y presentación boutique"
                fill
                className="object-cover"
                sizes="25vw"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
