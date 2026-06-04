"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Snowflake, User, Mail, Phone,
  MessageCircle, CheckCircle2, Loader2, Send, ShoppingBag,
} from "lucide-react";
import { Product } from "@/lib/data";

/* ── tipos ── */
type FormEmpresas = { nombre: string; apellido: string; mail: string; telefono: string; consulta: string };
type FormCatering = { nombre: string; apellido: string; mail: string; telefono: string; mensaje: string };

/* ── datos estáticos ── */
const COMBOS = [
  { size: 10, badge: "Ideal para la semana", price: "$85.000", href: "/tienda/combo-viandas?size=10" },
  { size: 20, badge: "Mejor precio",          price: "$164.000", href: "/tienda/combo-viandas?size=20" },
];

const EMPRESAS_BENEFITS = [
  "Amplio menú con opciones variadas",
  "Entregas puntuales en el horario que solicites",
  "Opciones vegetarianas, sin gluten, proteicas",
  "Calidad garantizada",
];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm font-sans text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-sage-400 transition-colors";

const btnClass =
  "w-full flex items-center justify-center gap-2.5 text-white font-sans font-medium rounded-xl px-6 py-3.5 mt-2 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0";

/* ── helpers ── */
function Separator() {
  return <div className="my-14 md:my-20 border-t" style={{ borderColor: "#D4C9B8" }} />;
}

function SuccessCard({ subtitle }: { subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 py-10 text-center"
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#e8f0e8" }}>
        <CheckCircle2 className="w-8 h-8" style={{ color: "#3a6b3a" }} />
      </div>
      <div>
        <p className="font-serif text-2xl font-light mb-1" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}>
          ¡Consulta enviada!
        </p>
        <p className="font-sans text-sm" style={{ color: "#6b7a6b" }}>{subtitle}</p>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════ */
export default function Categories() {

  /* estado form empresas */
  const [emp, setEmp] = useState<FormEmpresas>({ nombre: "", apellido: "", mail: "", telefono: "", consulta: "" });
  const [empSending, setEmpSending] = useState(false);
  const [empSent, setEmpSent] = useState(false);
  const [empError, setEmpError] = useState("");

  /* productos viandas diarias para el carrusel */
  const [diarias, setDiarias] = useState<Product[]>([]);
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((all: Product[]) => {
        const filtered = all.filter((p) => p.category === "viandas-diarias" && p.available);
        // garantizar al menos 6 items duplicando si hace falta
        if (filtered.length === 0) return;
        let items = [...filtered];
        while (items.length < 6) items = [...items, ...filtered];
        setDiarias(items);
      })
      .catch(() => {});
  }, []);

  /* estado form catering */
  const [cat, setCat] = useState<FormCatering>({ nombre: "", apellido: "", mail: "", telefono: "", mensaje: "" });
  const [catSending, setCatSending] = useState(false);
  const [catSent, setCatSent] = useState(false);
  const [catError, setCatError] = useState("");

  const setEmpField = (k: keyof FormEmpresas) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setEmp((p) => ({ ...p, [k]: e.target.value }));

  const setCatField = (k: keyof FormCatering) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setCat((p) => ({ ...p, [k]: e.target.value }));

  async function submitEmpresas(e: React.FormEvent) {
    e.preventDefault();
    setEmpSending(true); setEmpError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "empresas", nombre: `${emp.nombre} ${emp.apellido}`.trim(), mail: emp.mail, telefono: emp.telefono, detalle: emp.consulta }),
      });
      const data = await res.json();
      if (!res.ok || data.error) setEmpError(data.error ?? "No se pudo enviar. Intentá de nuevo.");
      else setEmpSent(true);
    } catch { setEmpError("Error de conexión. Intentá de nuevo."); }
    finally { setEmpSending(false); }
  }

  async function submitCatering(e: React.FormEvent) {
    e.preventDefault();
    setCatSending(true); setCatError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "catering", nombre: `${cat.nombre} ${cat.apellido}`.trim(), mail: cat.mail, telefono: cat.telefono, detalle: cat.mensaje }),
      });
      const data = await res.json();
      if (!res.ok || data.error) setCatError(data.error ?? "No se pudo enviar. Intentá de nuevo.");
      else setCatSent(true);
    } catch { setCatError("Error de conexión. Intentá de nuevo."); }
    finally { setCatSending(false); }
  }

  /* ── render ── */
  return (
    <section id="nuestras-opciones" className="py-24 md:py-32" style={{ background: "#EDEAE4" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">

        {/* ── HEADER ── */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="font-sans text-xs uppercase tracking-[0.35em] mb-4"
            style={{ color: "#9A8B6E" }}
          >
            Lo que ofrecemos
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-light text-3xl md:text-5xl max-w-3xl mx-auto leading-snug"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}
          >
            Te presentamos todas las opciones que{" "}
            <em className="italic font-normal" style={{ color: "#9A8B6E" }}>262</em>{" "}
            tiene para ofrecerte
          </motion.h2>
        </div>

        {/* ── VIANDAS CONGELADAS ── */}
        <motion.div
          id="viandas-congeladas"
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center scroll-mt-32"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-2xl">❄️</span>
            <h3 className="font-serif text-3xl md:text-4xl" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}>
              Viandas Congeladas
            </h3>
          </div>
          <p className="font-sans text-[10px] uppercase tracking-widest mb-8" style={{ color: "#9A8B6E" }}>
            Elegí tu combo
          </p>

          <div className="flex justify-center gap-4 mb-6">
            {COMBOS.map((combo) => (
              <Link key={combo.size} href={combo.href} className="group block w-40 md:w-48">
                <div className="rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-200 group-hover:-translate-y-1">
                  <div className="px-4 py-5 relative" style={{ background: "#1a3325" }}>
                    <Snowflake className="absolute top-3 right-3 w-3.5 h-3.5 text-white/20" />
                    <span className="inline-block font-sans text-[9px] uppercase tracking-widest text-white/50 bg-white/10 px-2 py-0.5 rounded-full mb-3">
                      {combo.badge}
                    </span>
                    <p className="font-serif text-white font-light leading-none" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: "2.4rem" }}>
                      ×{combo.size}
                    </p>
                    <p className="font-sans text-white/50 text-[10px] mt-1">viandas congeladas</p>
                  </div>
                  <div className="px-4 py-3 bg-white flex items-center justify-center">
                    <span className="font-sans text-[10px] text-stone-400 group-hover:text-stone-700 transition-colors flex items-center gap-0.5">
                      Armar combo <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link href="/tienda/viandas/viandas-congeladas" className="inline-flex items-center gap-1.5 font-sans text-xs hover:opacity-70 transition-opacity" style={{ color: "#9A8B6E" }}>
            Ver todos los productos <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

        <Separator />

        {/* ── VIANDAS DIARIAS ── */}
        <motion.div
          id="viandas-diarias"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="scroll-mt-32"
        >
          {/* Encabezado centrado */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl">🥗</span>
              <h3 className="font-serif text-3xl md:text-4xl" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}>
                Viandas Diarias
              </h3>
            </div>
            <p className="font-sans text-base text-stone-500 max-w-md mx-auto leading-relaxed">
              Opciones frescas para que pases a buscar para el almuerzo de todos los días por nuestro local.
            </p>
          </div>

          {/* Carrusel de loop infinito */}
          {diarias.length > 0 && (
            <div className="overflow-hidden mb-8 -mx-5 md:-mx-8">
              <div className="flex animate-marquee" style={{ width: "max-content" }}>
                {/* Dos copias idénticas para el loop perfecto */}
                {[...diarias, ...diarias].map((product, i) => (
                  <Link
                    key={`${product.id}-${i}`}
                    href={`/tienda/${product.id}`}
                    className="flex-shrink-0 w-44 mx-2 group"
                  >
                    <div className="rounded-2xl overflow-hidden bg-white shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
                      {/* Imagen */}
                      <div className="relative h-36 bg-stone-100">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.imageAlt || product.name}
                            fill
                            className="object-cover"
                            sizes="176px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-stone-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                      </div>
                      {/* Nombre */}
                      <div className="px-3 py-2.5">
                        <p className="font-sans text-xs font-medium text-stone-700 line-clamp-2 leading-snug">
                          {product.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Botón ver más */}
          <div className="text-center">
            <Link
              href="/tienda/viandas/viandas-diarias"
              className="inline-flex items-center gap-2 font-sans text-sm font-medium text-white px-6 py-3 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
              style={{ background: "#547d54" }}
            >
              Ver más opciones <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        <Separator />

        {/* ── VIANDAS PARA EMPRESAS ── */}
        <motion.div
          id="viandas-empresas"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="scroll-mt-32"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* copy */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🏢</span>
                <h3 className="font-serif text-3xl md:text-4xl" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}>
                  Viandas para Empresas
                </h3>
              </div>
              <p className="font-sans text-sm text-stone-500 leading-relaxed mb-6">
                Resolvemos de manera inteligente el almuerzo de tus colaboradores para que todos coman a su gusto.
              </p>
              <ul className="space-y-3">
                {EMPRESAS_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#547d54" }} />
                    <span className="font-sans text-sm text-stone-600">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* form */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              {empSent ? (
                <SuccessCard subtitle="Nos comunicaremos con vos a la brevedad." />
              ) : (
                <>
                  <p className="font-serif text-xl font-light mb-5" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}>
                    Dejanos tus datos y te contactamos
                  </p>
                  <form onSubmit={submitEmpresas} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Nombre</label>
                        <input type="text" value={emp.nombre} onChange={setEmpField("nombre")} placeholder="Tu nombre" required className={inputClass} />
                      </div>
                      <div>
                        <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Apellido</label>
                        <input type="text" value={emp.apellido} onChange={setEmpField("apellido")} placeholder="Tu apellido" required className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                      <input type="email" value={emp.mail} onChange={setEmpField("mail")} placeholder="tu@empresa.com" required className={inputClass} />
                    </div>
                    <div>
                      <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Teléfono</label>
                      <input type="tel" value={emp.telefono} onChange={setEmpField("telefono")} placeholder="11 1234-5678" required className={inputClass} />
                    </div>
                    <div>
                      <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> ¿En qué podemos ayudarte?</label>
                      <textarea value={emp.consulta} onChange={setEmpField("consulta")} placeholder="Cantidad de personas, frecuencia, tipo de viandas..." rows={3} className={`${inputClass} resize-none`} />
                    </div>
                    {empError && <p className="font-sans text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{empError}</p>}
                    <button type="submit" disabled={empSending} className={btnClass} style={{ background: "#2a402b", boxShadow: "0 4px 24px rgba(42,64,43,0.3)" }}>
                      {empSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar consulta</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <Separator />

        {/* ── CATERING PARA EVENTOS ── */}
        <motion.div
          id="catering-eventos"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="scroll-mt-32"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* copy */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎉</span>
                <h3 className="font-serif text-3xl md:text-4xl" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}>
                  Catering para Eventos
                </h3>
              </div>
              <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ color: "#9A8B6E" }}>
                Catering a la carta
              </p>
              <p className="font-sans text-sm text-stone-500 leading-relaxed">
                Armamos servicios de catering a medida para eventos, producciones, rodajes y todo lo que necesites.
                Consultanos y te armamos la propuesta especialmente pensada para vos.
              </p>
            </div>

            {/* form */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              {catSent ? (
                <SuccessCard subtitle="Nos comunicaremos con vos para armar tu propuesta." />
              ) : (
                <>
                  <p className="font-serif text-xl font-light mb-5" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}>
                    Dejanos tus datos y te contactamos
                  </p>
                  <form onSubmit={submitCatering} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Nombre</label>
                        <input type="text" value={cat.nombre} onChange={setCatField("nombre")} placeholder="Tu nombre" required className={inputClass} />
                      </div>
                      <div>
                        <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Apellido</label>
                        <input type="text" value={cat.apellido} onChange={setCatField("apellido")} placeholder="Tu apellido" required className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                      <input type="email" value={cat.mail} onChange={setCatField("mail")} placeholder="tu@email.com" required className={inputClass} />
                    </div>
                    <div>
                      <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Teléfono</label>
                      <input type="tel" value={cat.telefono} onChange={setCatField("telefono")} placeholder="11 1234-5678" required className={inputClass} />
                    </div>
                    <div>
                      <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> Mensaje</label>
                      <textarea value={cat.mensaje} onChange={setCatField("mensaje")} placeholder="Contanos sobre tu evento, cantidad de personas, fecha..." rows={3} className={`${inputClass} resize-none`} />
                    </div>
                    {catError && <p className="font-sans text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{catError}</p>}
                    <button type="submit" disabled={catSending} className={btnClass} style={{ background: "#2a402b", boxShadow: "0 4px 24px rgba(42,64,43,0.3)" }}>
                      {catSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar consulta</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
