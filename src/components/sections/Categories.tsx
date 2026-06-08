"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone,
  MessageCircle, CheckCircle2, Loader2, Send,
} from "lucide-react";

/* ── tipos ── */
type FormEmpresas = { nombre: string; apellido: string; mail: string; telefono: string; consulta: string };
type FormCatering = { nombre: string; apellido: string; mail: string; telefono: string; mensaje: string };

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

  const [emp, setEmp] = useState<FormEmpresas>({ nombre: "", apellido: "", mail: "", telefono: "", consulta: "" });
  const [empSending, setEmpSending] = useState(false);
  const [empSent, setEmpSent] = useState(false);
  const [empError, setEmpError] = useState("");

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

  return (
    <section id="nuestras-opciones" className="py-24 md:py-32" style={{ background: "#EDEAE4" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">

        {/* ── VIANDAS PARA EMPRESAS ── */}
        <motion.div
          id="viandas-empresas"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="scroll-mt-32"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
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
