"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Package, Smile } from "lucide-react";

const STEPS = [
  {
    number: "01",
    label: "Compra",
    description: "Elegí tus viandas desde la tienda o por WhatsApp.",
    Icon: ShoppingCart,
  },
  {
    number: "02",
    label: "Recibe",
    description: "Coordinamos la entrega o el retiro en local.",
    Icon: Package,
  },
  {
    number: "03",
    label: "Disfruta",
    description: "Comé rico, nutritivo y sin perder tiempo.",
    Icon: Smile,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-32" style={{ background: "#EDEAE4" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">

        {/* Title */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-sans text-xs uppercase tracking-[0.35em] mb-4"
            style={{ color: "#9A8B6E" }}
          >
            Simple y rápido
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-light text-4xl md:text-6xl text-gray-800"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            Así{" "}
            <em className="italic font-normal" style={{ color: "#9A8B6E" }}>
              funciona
            </em>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center"
            >
              {/* Number badge */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-7 text-white font-sans font-bold text-sm"
                style={{ background: "#2A2A2A" }}
              >
                {i + 1}
              </div>

              {/* Icon illustration area */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 + 0.2 }}
                className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
                style={{ background: "rgba(154, 139, 110, 0.1)", border: "1.5px solid rgba(154, 139, 110, 0.2)" }}
              >
                <step.Icon
                  className="w-10 h-10"
                  style={{ color: "#9A8B6E" }}
                  strokeWidth={1.2}
                />
              </motion.div>

              <h3
                className="font-serif text-2xl font-light text-gray-800 mb-3"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
              >
                {step.label}
              </h3>
              <p className="font-sans text-sm text-gray-500 leading-relaxed max-w-[220px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Connecting line (desktop only) */}
        <div className="hidden md:block relative mt-[-180px] mb-[180px] pointer-events-none">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            className="absolute top-0 left-[16.7%] right-[16.7%] h-px"
            style={{
              background: "linear-gradient(90deg, transparent, #9A8B6E 20%, #9A8B6E 80%, transparent)",
              transformOrigin: "left",
              opacity: 0.3,
              marginTop: "-52px",
            }}
          />
        </div>

      </div>
    </section>
  );
}
