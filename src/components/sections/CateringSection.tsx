"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MessageCircle, CheckCircle2, Loader2, Send } from "lucide-react";

export default function CateringSection() {
  const [form, setForm] = useState({ nombre: "", apellido: "", mail: "", telefono: "", mensaje: "" });
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
          tipo: "catering",
          nombre: `${form.nombre} ${form.apellido}`.trim(),
          mail: form.mail,
          telefono: form.telefono,
          detalle: form.mensaje,
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
    <section className="py-24 md:py-32" style={{ background: "#fdf8f2" }}>
      <div className="max-w-2xl mx-auto px-5 md:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <p
            className="font-sans text-xs uppercase tracking-[0.35em] mb-4"
            style={{ color: "#547d54" }}
          >
            Servicio de catering
          </p>
          <h2
            className="font-serif font-light text-4xl md:text-5xl mb-6 leading-tight"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#1e2e1f" }}
          >
            Catering{" "}
            <em className="italic font-normal" style={{ color: "#e05d44" }}>
              a medida
            </em>
          </h2>
          <p
            className="font-sans text-base md:text-lg leading-relaxed"
            style={{ color: "#5a6b5a" }}
          >
            Armamos servicios de catering a medida para eventos, producciones de fotos y todo lo que necesites,{" "}
            <strong className="font-semibold" style={{ color: "#2a402b" }}>
              consultanos y te armamos la propuesta especialmente pensada para vos!
            </strong>
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl" style={{ border: "1px solid #ede9e3" }}>
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
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}
                  >
                    ¡Consulta enviada!
                  </p>
                  <p className="font-sans text-sm" style={{ color: "#6b7a6b" }}>
                    Nos comunicaremos con vos a la brevedad para armar tu propuesta.
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
                <p
                  className="font-serif text-xl font-light mb-6"
                  style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#2a2a2a" }}
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
                      placeholder="tu@email.com"
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
                      <MessageCircle className="w-3.5 h-3.5" /> Mensaje
                    </label>
                    <textarea
                      value={form.mensaje}
                      onChange={set("mensaje")}
                      placeholder="Contanos sobre tu evento, cantidad de personas, fecha..."
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
    </section>
  );
}
