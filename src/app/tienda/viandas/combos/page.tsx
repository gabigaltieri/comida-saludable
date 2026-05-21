"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Snowflake, ArrowLeft, Gift } from "lucide-react";
import StoreNavbar from "@/components/StoreNavbar";
import Footer from "@/components/Footer";

const COMBOS = [
  {
    size: 10,
    discount: "5% off",
    badge: "Ideal para la semana",
    title: "Combo ×10",
    description:
      "Elegí 10 viandas congeladas a tu gusto. Perfectas para tener en el freezer y comer rico toda la semana sin esfuerzo.",
    perks: ["Precio individual por vianda", "5% de descuento automático", "Elegís vos las combinaciones"],
    color: "from-sage-700 to-sage-800",
  },
  {
    size: 20,
    discount: "10% off",
    badge: "Mejor precio",
    title: "Combo ×20",
    description:
      "Stockeate con 20 viandas congeladas y llevate el mejor descuento. El combo más conveniente para familias o quienes planifican el mes.",
    perks: ["Precio individual por vianda", "10% de descuento automático", "Elegís vos las combinaciones"],
    color: "from-sage-800 to-sage-900",
  },
];

export default function CombosLandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#EDEAE4" }}>
      <StoreNavbar />

      {/* Hero */}
      <div className="relative overflow-hidden py-20 md:py-28 px-5" style={{ background: "#1E1E1E" }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #547d54 0%, transparent 60%)" }}
        />
        <div className="relative max-w-6xl mx-auto">
          <Link
            href="/tienda/viandas"
            className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
            style={{ color: "#9A8B6E" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a categorías
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sage-700 flex items-center justify-center flex-shrink-0 mt-1">
              <Gift className="w-6 h-6 text-sage-200" />
            </div>
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-sans text-xs uppercase tracking-[0.35em] mb-3"
                style={{ color: "#9A8B6E" }}
              >
                Ahorrá más
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif font-light text-4xl md:text-6xl text-white mb-3"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
              >
                Combos de{" "}
                <em className="italic font-normal" style={{ color: "#a3bda3" }}>
                  Viandas
                </em>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="font-sans text-white/50 text-sm max-w-md"
              >
                Elegí la cantidad, después armás tu selección con las viandas que más te gustan.
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COMBOS.map((combo, i) => (
            <motion.div
              key={combo.size}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden h-full flex flex-col">
                {/* Card header */}
                <div
                  className={`bg-gradient-to-br ${combo.color} px-6 py-8 flex items-start justify-between`}
                >
                  <div>
                    <span className="inline-block font-sans text-[10px] uppercase tracking-wider font-semibold text-sage-200/80 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full mb-4">
                      {combo.badge}
                    </span>
                    <p
                      className="font-serif text-6xl font-light text-white leading-none mb-1"
                      style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                    >
                      ×{combo.size}
                    </p>
                    <p className="font-sans text-sage-200/70 text-sm">viandas congeladas</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Snowflake className="w-8 h-8 text-white/20" />
                    <span className="font-sans text-sm font-bold text-white bg-sage-500 px-3 py-1.5 rounded-full">
                      {combo.discount}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-6 py-5 flex flex-col flex-1 gap-4">
                  <p className="font-sans text-sm text-sage-500 leading-relaxed">
                    {combo.description}
                  </p>

                  <ul className="flex flex-col gap-2">
                    {combo.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2.5 font-sans text-sm text-sage-600">
                        <span className="w-4 h-4 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-sage-500" fill="none" viewBox="0 0 10 10">
                            <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-2">
                    <Link
                      href={`/tienda/combo-viandas?size=${combo.size}`}
                      className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-sans font-medium text-sm text-white transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                      style={{ background: "#547d54" }}
                    >
                      Armar mi Combo ×{combo.size}
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info adicional */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 p-5 md:p-6 bg-white rounded-2xl border border-sage-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0">
            <Snowflake className="w-5 h-5 text-sage-500" />
          </div>
          <div className="flex-1">
            <p className="font-sans text-sm font-medium text-sage-700 mb-0.5">¿Cómo funciona?</p>
            <p className="font-sans text-sm text-sage-400 leading-relaxed">
              Elegís el tamaño de tu combo, después seleccionás las viandas que quieras hasta completar
              la cantidad. El descuento se aplica automáticamente al finalizar.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
