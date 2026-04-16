"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Instagram, MessageCircle, ExternalLink } from "lucide-react";
import { ADDRESS, MAPS_LINK, OPENING_HOURS, WHATSAPP_NUMBER, INSTAGRAM_HANDLE } from "@/lib/data";

export default function LocationSection() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "¡Hola! Tengo una consulta sobre sus productos 🌿"
  )}`;

  return (
    <section id="location" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Info */}
          <div>
            <motion.p
              className="section-label mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Dónde encontrarnos
            </motion.p>
            <motion.h2
              className="section-title text-4xl md:text-5xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              Estamos en el corazón
              <br />
              del barrio.
            </motion.h2>

            <motion.div
              className="flex flex-col gap-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {/* Address */}
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-2xl bg-cream-100 hover:bg-cream-200 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0 group-hover:bg-sage-200 transition-colors">
                  <MapPin className="w-5 h-5 text-sage-600" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-xs text-sage-400 uppercase tracking-wider mb-0.5">Dirección</p>
                  <p className="font-sans text-sage-800 font-medium">{ADDRESS}</p>
                  <p className="font-sans text-sm text-sage-500 mt-0.5">Palermo / Villa Crespo, CABA</p>
                </div>
                <ExternalLink className="w-4 h-4 text-sage-300 group-hover:text-sage-500 transition-colors mt-1" />
              </a>

              {/* Hours */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-cream-100">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-sage-600" />
                </div>
                <div>
                  <p className="font-sans text-xs text-sage-400 uppercase tracking-wider mb-1.5">Horarios</p>
                  <div className="flex flex-col gap-1">
                    <p className="font-sans text-sage-700 text-sm">{OPENING_HOURS.weekdays}</p>
                    <p className="font-sans text-sage-700 text-sm">{OPENING_HOURS.saturday}</p>
                    <p className="font-sans text-sage-400 text-sm">{OPENING_HOURS.sunday}</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="flex gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors group"
                >
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  <div>
                    <p className="font-sans text-xs text-sage-400 uppercase tracking-wider mb-0.5">WhatsApp</p>
                    <p className="font-sans text-sage-700 text-sm font-medium">Escribinos</p>
                  </div>
                </a>

                <a
                  href="https://instagram.com/262.cosasricas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-pink-50 border border-pink-100 hover:bg-pink-100 transition-colors group"
                >
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="font-sans text-xs text-sage-400 uppercase tracking-wider mb-0.5">Instagram</p>
                    <p className="font-sans text-sage-700 text-sm font-medium">{INSTAGRAM_HANDLE}</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right: Map placeholder */}
          <motion.div
            className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(84,125,84,0.15)] h-[400px] md:h-[480px] bg-sage-50"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Map iframe */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.095!2d-58.4326!3d-34.6037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzEzLjMiUyA1OMKwMjUnNTcuNCJX!5e0!3m2!1ses!2sar!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "saturate(0.8) hue-rotate(10deg)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de 262 Cosas Ricas en CABA"
            />

            {/* Map overlay card */}
            <div className="absolute bottom-4 left-4 right-4">
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-sage-500 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-serif text-sage-800 font-semibold text-base truncate"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                  >
                    262 Cosas Ricas
                  </p>
                  <p className="font-sans text-sage-500 text-xs truncate">{ADDRESS}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-sage-400 flex-shrink-0" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
