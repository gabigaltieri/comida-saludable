"use client";

import { motion } from "framer-motion";
import { ShoppingCart, LayoutGrid, ClipboardList, Truck } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: LayoutGrid,
    title: "Explorá el menú",
    description:
      "Navegá por nuestras categorías: viandas congeladas, diarias y combos. Tenemos opciones para todos los gustos y necesidades.",
  },
  {
    number: "02",
    icon: ShoppingCart,
    title: "Sumá al carrito",
    description:
      "Elegí los productos que más te gusten y la cantidad que necesitás. Podés armar combos de 10 o 20 viandas con descuento especial.",
  },
  {
    number: "03",
    icon: ClipboardList,
    title: "Completá tu pedido",
    description:
      "Ingresá tu nombre, teléfono y dirección de entrega. Elegí si pagás en efectivo, por transferencia o con MercadoPago.",
  },
  {
    number: "04",
    icon: Truck,
    title: "¡Lo recibís en casa!",
    description:
      "Confirmamos tu pedido por WhatsApp y coordinamos la entrega. Te avisamos cuando ya estamos en camino.",
  },
];

export default function HowToOrder() {
  return (
    <section className="py-24 md:py-32" style={{ background: "#F5F2EC" }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8">

        {/* Header */}
        <div className="text-center mb-16">
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
            className="font-serif font-light text-4xl md:text-6xl"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}
          >
            ¿Cómo realizo{" "}
            <em className="italic font-normal" style={{ color: "#9A8B6E" }}>
              mi pedido?
            </em>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Línea conectora (solo desktop) */}
          <div
            className="hidden lg:block absolute top-10 left-0 right-0 h-px"
            style={{ background: "linear-gradient(to right, transparent, #D4C9B2 20%, #D4C9B2 80%, transparent)" }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.7, delay: i * 0.13, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
                >
                  {/* Número + ícono */}
                  <div className="relative mb-5">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm"
                      style={{ background: "#fff", border: "1px solid #E8E0D4" }}
                    >
                      <Icon className="w-8 h-8" style={{ color: "#547d54" }} />
                    </div>
                    <span
                      className="absolute -top-2.5 -right-2.5 font-sans text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                      style={{ background: "#547d54", color: "white" }}
                    >
                      {i + 1}
                    </span>
                  </div>

                  <h3
                    className="font-serif text-xl font-semibold mb-2 leading-snug"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}
                  >
                    {step.title}
                  </h3>
                  <p className="font-sans text-sm leading-relaxed" style={{ color: "#7a7060" }}>
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 text-center"
        >
          <a
            href="/tienda"
            className="inline-flex items-center gap-2.5 font-sans font-medium text-sm text-white px-8 py-3.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "#2a402b", boxShadow: "0 4px 20px rgba(42,64,43,0.25)" }}
          >
            <ShoppingCart className="w-4 h-4" />
            Ir a la tienda
          </a>
        </motion.div>

      </div>
    </section>
  );
}
