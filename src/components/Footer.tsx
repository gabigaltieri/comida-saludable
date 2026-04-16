import { Leaf, Instagram, MessageCircle, Heart } from "lucide-react";
import { WHATSAPP_NUMBER, INSTAGRAM_HANDLE, ADDRESS } from "@/lib/data";

export default function Footer() {
  const year = new Date().getFullYear();
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <footer className="bg-sage-800 text-white">
      {/* CTA Strip */}
      <div className="bg-sage-700 py-12 px-5 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3
              className="font-serif text-3xl md:text-4xl text-white font-semibold mb-1"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              ¿Lista para comer rico?
            </h3>
            <p className="font-sans text-white/60 text-sm">
              Pedí por WhatsApp y coordinamos entrega o retiro.
            </p>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-sans font-medium rounded-full px-7 py-3.5 transition-all duration-300 shadow-[0_4px_24px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_32px_rgba(37,211,102,0.50)] hover:-translate-y-0.5 whitespace-nowrap"
          >
            <MessageCircle className="w-5 h-5" />
            Hacer un pedido
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="py-12 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <span
                    className="font-serif text-white font-semibold text-lg leading-none block"
                    style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                  >
                    262
                  </span>
                  <span className="font-sans text-white/40 text-[9px] uppercase tracking-[0.18em] leading-none block">
                    Cosas Ricas
                  </span>
                </div>
              </div>
              <p className="font-sans text-white/50 text-sm leading-relaxed max-w-xs">
                Comida casera, fresca y nutritiva para simplificarte la vida.
                Elaborada con amor en el corazón de Buenos Aires.
              </p>

              <div className="flex gap-3 mt-5">
                <a
                  href="https://instagram.com/262.cosasricas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
                  aria-label="Seguinos en Instagram"
                >
                  <Instagram className="w-4 h-4 text-white/60" />
                </a>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-white/60" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="font-sans text-white/30 text-[10px] uppercase tracking-widest mb-4">
                Navegación
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  { label: "Inicio", href: "#" },
                  { label: "Menú completo", href: "#menu" },
                  { label: "Catering", href: "#catering" },
                  { label: "Reseñas", href: "#about" },
                  { label: "Contacto", href: "#location" },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="font-sans text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="font-sans text-white/30 text-[10px] uppercase tracking-widest mb-4">
                Contacto
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-sans text-white/30 text-[10px] mb-0.5">Dirección</p>
                  <p className="font-sans text-white/60 text-sm">{ADDRESS}</p>
                </div>
                <div>
                  <p className="font-sans text-white/30 text-[10px] mb-0.5">Horarios</p>
                  <p className="font-sans text-white/60 text-sm">Lun–Vie: 9:00–20:00</p>
                  <p className="font-sans text-white/60 text-sm">Sáb: 10:00–16:00</p>
                </div>
                <div>
                  <p className="font-sans text-white/30 text-[10px] mb-0.5">Instagram</p>
                  <a
                    href="https://instagram.com/262.cosasricas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {INSTAGRAM_HANDLE}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="font-sans text-white/25 text-xs">
              © {year} 262 Cosas Ricas. Todos los derechos reservados.
            </p>
            <p className="font-sans text-white/25 text-xs flex items-center gap-1">
              Hecho con <Heart className="w-3 h-3 text-salmon-400 fill-salmon-400" /> en CABA
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
