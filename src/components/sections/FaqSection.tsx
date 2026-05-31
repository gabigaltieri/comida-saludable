"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "¿Cómo realizo mi pedido?",
    a: "Podés realizar tu pedido directamente en nuestra página web seleccionando las viandas que mejor se adapten a tus necesidades y agregándolas al carrito. Una vez que completes la compra, te enviaremos un correo con la confirmación.",
  },
  {
    q: "¿Cómo recibo mi pedido?",
    a: "Hacemos entregas a domicilio en CABA con costo adicional de $10.000 o podés pasar a retirarlo por nuestro local en Villa Crespo de lunes a viernes de 9 a 15 hs. Para entregas fuera de ese horario se coordina por WhatsApp.",
  },
  {
    q: "¿Hay opciones para personas con restricciones alimenticias?",
    a: "¡Claro! Tenemos opciones vegetarianas, veganas, sin gluten y proteicas. Escribinos por necesidades específicas.",
  },
  {
    q: "¿Cuál es el tiempo de entrega?",
    a: "El tiempo de entrega es de 48 a 72 horas luego de confirmado el pedido.",
  },
  {
    q: "¿Qué viandas ofrecen?",
    a: "Tenemos viandas congeladas para comprar por combo o la cantidad que quieras, o bien las viandas diarias, que vienen frescas y podés encontrarlas en nuestro local en Villa Crespo de lunes a viernes de 9 a 15 hs.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Podés abonar con tarjeta de crédito o débito utilizando Mercado Pago al momento de finalizar la compra, por transferencia bancaria o al contado si retirás en nuestro local.",
  },
];

function FaqItem({ faq, index }: { faq: typeof FAQS[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="border-b last:border-0"
      style={{ borderColor: "#E8E0D5" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span
          className="font-serif text-lg md:text-xl font-light group-hover:text-sage-700 transition-colors"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}
        >
          {faq.q}
        </span>
        <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ background: open ? "#547d54" : "#EDEAE4" }}>
          {open
            ? <Minus className="w-3.5 h-3.5 text-white" />
            : <Plus className="w-3.5 h-3.5" style={{ color: "#9A8B6E" }} />
          }
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="font-sans text-sm leading-relaxed pb-5 max-w-2xl" style={{ color: "#6b7a6b" }}>
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FaqSection() {
  return (
    <section className="py-24 md:py-32" style={{ background: "#EDEAE4" }}>
      <div className="max-w-3xl mx-auto px-5 md:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-sans text-xs uppercase tracking-[0.35em] mb-4"
            style={{ color: "#9A8B6E" }}
          >
            Preguntas frecuentes
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-light text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}
          >
            Todo lo que necesitás{" "}
            <em className="italic font-normal" style={{ color: "#9A8B6E" }}>
              saber
            </em>
          </motion.h2>
        </div>

        {/* Acordeón */}
        <div className="bg-white rounded-2xl px-6 md:px-8 shadow-sm">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} faq={faq} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
