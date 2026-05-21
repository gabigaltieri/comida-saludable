"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, CheckCircle2, Loader2, Send, Building2, MessageCircle } from "lucide-react";

const BENEFITS = [
  "Menú rotativo semanal con variedad garantizada",
  "Entrega en tu oficina en el horario que necesitás",
  "Opciones vegetarianas, sin gluten y sin lactosa",
  "Facturación empresarial disponible",
];

export default function EmpresasSection() {
  const [form, setForm] = useState({ nombre: "", apellido: "", mail: "", telefono: "", consulta: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setApiError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "empresas",
          nombre: `${form.nombre} ${form.apellido}`.trim(),
          mail: form.mail,
          telefono: form.telefono,
          detalle: form.consulta,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error ?? "No se pudo enviar. Intentá de nuevo.");
      } else {
        setSent(true);
      }
    } catch {
      setApiError("Error de conexión. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm font-sans text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-sage-400 transition-colors";

  return (
    <section className="py-24 md:py-32" style={{ background: "#2a402b" }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="font-sans text-xs uppercase tracking-[0.35em] mb-4"
              style={{ color: "#a8c5a8" }}
            >
              Servicio corporativo
            </p>
            <h2
              className="font-serif font-light text-4xl md:text-5xl text-white mb-4 leading-tight"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              Viandas para{" "}
              <em className="italic font-normal" style={{ color: "#D4B882" }}>
                empresas
              </em>
            </h2>
            <p className="font-sans text-white/60 text-base leading-relaxed mb-8 max-w-md">
              Alimentá a tu equipo con comida real, nutritiva y deliciosa. Nos encargamos de todo para que vos te enfoques en lo importante.
            </p>

            <ul className="space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#a8c5a8" }} />
                  <span className="font-sans text-sm text-white/70">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <Building2 className="w-5 h-5 text-white/60" />
              </div>
              <p className="font-sans text-sm text-white/40 leading-snug">
                Ya trabajamos con empresas de Palermo, Villa Crespo y Almagro.
              </p>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-[#f9f6f0] rounded-3xl p-8 shadow-2xl">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4 py-10 text-center"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "#e8f0e8" }}
                  >
                    <CheckCircle2 className="w-8 h-8" style={{ color: "#3a6b3a" }} />
                  </div>
                  <div>
                    <p
                      className="font-serif text-2xl font-light mb-1"
                      style={{
                        fontFamily: "var(--font-cormorant, Georgia, serif)",
                        color: "#2a2a2a",
                      }}
                    >
                      ¡Consulta enviada!
                    </p>
                    <p className="font-sans text-sm" style={{ color: "#6b7a6b" }}>
                      Nos comunicaremos con vos a la brevedad.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <>
                  <p
                    className="font-serif text-xl font-light mb-6"
                    style={{
                      fontFamily: "var(--font-cormorant, Georgia, serif)",
                      color: "#2a2a2a",
                    }}
                  >
                    Dejanos tus datos y te contactamos
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Nombre
                        </label>
                        <input
                          type="text"
                          value={form.nombre}
                          onChange={set("nombre")}
                          placeholder="Tu nombre"
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Apellido
                        </label>
                        <input
                          type="text"
                          value={form.apellido}
                          onChange={set("apellido")}
                          placeholder="Tu apellido"
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </label>
                      <input
                        type="email"
                        value={form.mail}
                        onChange={set("mail")}
                        placeholder="tu@empresa.com"
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Teléfono
                      </label>
                      <input
                        type="tel"
                        value={form.telefono}
                        onChange={set("telefono")}
                        placeholder="11 1234-5678"
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="font-sans text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5" /> ¿En qué podemos ayudarte?
                      </label>
                      <textarea
                        value={form.consulta}
                        onChange={set("consulta")}
                        placeholder="Contanos qué necesitás: cantidad de personas, frecuencia, tipo de viandas..."
                        rows={4}
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    {apiError && (
                      <p className="font-sans text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        {apiError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full flex items-center justify-center gap-2.5 text-white font-sans font-medium rounded-xl px-6 py-3.5 mt-2 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      style={{
                        background: "#2a402b",
                        boxShadow: "0 4px 24px rgba(42,64,43,0.3)",
                      }}
                    >
                      {sending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Enviar consulta</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
