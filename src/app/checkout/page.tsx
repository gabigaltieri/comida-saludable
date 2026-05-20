"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, formatPrice } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { WHATSAPP_NUMBER } from "@/lib/data";
import StoreNavbar from "@/components/StoreNavbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  Truck,
  Store,
  Banknote,
  CreditCard,
  MessageCircle,
  CheckCircle2,
  ShoppingBag,
  ArrowLeft,
  Package,
  Loader2,
  Gift,
  UserCircle2,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Delivery = "envio" | "retiro";
type Payment = "efectivo" | "transferencia" | "mercadopago";

interface FormData {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  codigoPostal: string;
  notas: string;
}

function isCABA(cp: string): boolean {
  const clean = cp.trim().toUpperCase();
  if (/^C\d{4}[A-Z]{3}$/.test(clean)) return true;
  const num = parseInt(clean, 10);
  return !isNaN(num) && num >= 1000 && num <= 1499;
}

function CheckoutContent() {
  const { items, total, itemCount, updateQuantity, removeItem, comboItems, updateComboQuantity, removeCombo, clearCart } = useCart();
  const { user, profile, isEmailConfirmed, openAuthModal, saveProfile } = useAuth();

  const [delivery, setDelivery] = useState<Delivery>("envio");
  const [payment, setPayment] = useState<Payment>("transferencia");
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [saveData, setSaveData] = useState(false);
  const [form, setForm] = useState<FormData>({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    codigoPostal: "",
    notas: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [saving, setSaving] = useState(false);
  const [mpError, setMpError] = useState<string | null>(null);
  const [comboError, setComboError] = useState<string | null>(null);

  // Pre-llenar con datos del perfil cuando el usuario está logueado
  useEffect(() => {
    if (user && isEmailConfirmed && profile) {
      setForm((f) => ({
        ...f,
        nombre: profile.nombre || f.nombre,
        telefono: profile.telefono || f.telefono,
        email: user.email || f.email,
        direccion: profile.direccion || f.direccion,
      }));
    } else if (user && user.email) {
      setForm((f) => ({ ...f, email: user.email! }));
    }
  }, [user, profile, isEmailConfirmed]);

  // Devuelve el tamaño esperado de un combo de viandas (vc10- → 10, vc20- → 20)
  const getViandasComboTarget = (id: string): number | null => {
    if (id.startsWith("vc10-")) return 10;
    if (id.startsWith("vc20-")) return 20;
    return null;
  };

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.telefono.trim()) e.telefono = "El teléfono es requerido";
    if (delivery === "envio" && !form.direccion.trim())
      e.direccion = "La dirección es requerida para envío";
    if (delivery === "envio") {
      if (!form.codigoPostal.trim())
        e.codigoPostal = "El código postal es requerido";
      else if (!isCABA(form.codigoPostal))
        e.codigoPostal = "Solo realizamos envíos dentro de CABA (CP 1000–1499)";
    }
    setErrors(e);

    // Validar combos de viandas: product_ids.length debe coincidir con el target
    const badCombos = comboItems.filter((ci) => {
      const target = getViandasComboTarget(ci.combo.id);
      return target !== null && ci.combo.product_ids.length !== target;
    });
    if (badCombos.length > 0) {
      const names = badCombos.map((ci) => {
        const target = getViandasComboTarget(ci.combo.id)!;
        const selected = ci.combo.product_ids.length;
        return `"${ci.combo.name}": elegiste ${selected} de ${target}`;
      });
      setComboError(`Combo incompleto: ${names.join("; ")}. Editalo antes de continuar.`);
      return false;
    }
    setComboError(null);

    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setMpError(null);

    const deliveryLabel = delivery === "envio" ? "Envío a domicilio" : "Retiro en local";
    const paymentLabel =
      payment === "efectivo"
        ? "Efectivo"
        : payment === "mercadopago"
        ? "MercadoPago"
        : "Transferencia bancaria";

    // ── Flujo MercadoPago ──────────────────────────────────────────────────
    if (payment === "mercadopago") {
      const productos = [
        ...items.map((i) => ({
          nombre: i.product.name,
          cantidad: i.quantity,
          precio: i.product.price,
        })),
        ...comboItems.map((i) => ({
          nombre: `🎁 ${i.combo.name} (combo)`,
          cantidad: i.quantity,
          precio: i.combo.price,
        })),
      ];

      try {
        const res = await fetch("/api/checkout/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cliente: form.nombre,
            telefono: form.telefono,
            email: form.email,
            productos,
            total,
            entrega: delivery,
            direccion: form.direccion,
            notas: form.notas,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMpError(data.error ?? "Error al procesar el pago. Intentá con otro método.");
          setSaving(false);
          return;
        }

        clearCart();
        window.location.href = data.init_point;
      } catch {
        setMpError("No se pudo conectar con MercadoPago. Intentá con otro método.");
        setSaving(false);
      }
      return;
    }
    // ──────────────────────────────────────────────────────────────────────

    // Guardar pedido en Supabase (no bloquea si falla — el WhatsApp igual se abre)
    let savedOrderNumber: string | null = null;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: form.nombre,
          telefono: form.telefono,
          email: form.email,
          productos: [
            ...items.map((i) => ({
              nombre: i.product.name,
              cantidad: i.quantity,
              precio: i.product.price,
            })),
            ...comboItems.map((i) => ({
              nombre: `🎁 ${i.combo.name} (combo)`,
              cantidad: i.quantity,
              precio: i.combo.price,
            })),
          ],
          total,
          entrega: delivery,
          direccion: form.direccion,
          pago: paymentLabel,
          notas: form.notas,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        savedOrderNumber = data.order_number ?? null;
      }
    } catch {
      // El pedido igual se envía por WhatsApp aunque falle el guardado
    }

    const lines = [
      `¡Hola! Quiero hacer un pedido 🛒`,
      savedOrderNumber ? `*Nº de orden: ${savedOrderNumber}*` : "",
      ``,
      `*Productos:*`,
      ...items.map((i) => `• ${i.quantity}x ${i.product.name} – ${formatPrice(i.product.price * i.quantity)}`),
      ...comboItems.map((i) => `• ${i.quantity}x 🎁 ${i.combo.name} (combo) – ${formatPrice(i.combo.price * i.quantity)}`),
      ``,
      `*Total: ${formatPrice(total)}*`,
      ``,
      `*Entrega:* ${deliveryLabel}`,
      delivery === "envio" ? `*Dirección:* ${form.direccion}` : "",
      `*Pago:* ${paymentLabel}`,
      ``,
      `*Datos del cliente:*`,
      `Nombre: ${form.nombre}`,
      `Teléfono: ${form.telefono}`,
      form.email ? `Email: ${form.email}` : "",
      form.notas ? `\nNotas: ${form.notas}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank");

    // Guardar perfil si el usuario lo pidió
    if (user && isEmailConfirmed && saveData) {
      saveProfile({
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: form.direccion,
      }).catch(() => {});
    }

    setSaving(false);
    setOrderNumber(savedOrderNumber);
    setSubmitted(true);
    clearCart();
  };

  const field = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    },
  });

  /* ── Empty cart ── */
  if (items.length === 0 && comboItems.length === 0 && !submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-5 text-center">
        <div className="w-20 h-20 rounded-2xl bg-sage-100 flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-sage-300" />
        </div>
        <h2
          className="font-serif text-3xl text-sage-700 mb-2"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
        >
          Tu carrito está vacío
        </h2>
        <p className="font-sans text-sm text-sage-400 mb-8">
          Agregá productos desde la tienda para hacer tu pedido.
        </p>
        <Link
          href="/tienda"
          className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium px-6 py-3 rounded-full transition-colors shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          Ir a la tienda
        </Link>
      </div>
    );
  }

  /* ── Success state ── */
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 px-5 text-center max-w-md mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-sage-100 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-sage-500" />
        </motion.div>
        <h2
          className="font-serif text-4xl text-sage-800 font-semibold mb-3"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
        >
          ¡Pedido enviado!
        </h2>
        <p className="font-sans text-sage-500 text-base leading-relaxed mb-2">
          Te abrimos WhatsApp con el detalle de tu pedido.
        </p>

        {orderNumber && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full bg-sage-50 border border-sage-200 rounded-2xl px-6 py-4 my-5"
          >
            <p className="font-sans text-xs uppercase tracking-widest text-sage-400 mb-1">
              Número de orden
            </p>
            <p
              className="font-serif text-3xl font-semibold text-sage-700 tracking-wide"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              {orderNumber}
            </p>
            <p className="font-sans text-xs text-sage-400 mt-1">
              Guardá este número para hacer seguimiento de tu pedido
            </p>
          </motion.div>
        )}

        <p className="font-sans text-sm text-sage-400 mb-10">
          En breve te confirmamos disponibilidad y coordinaremos la entrega.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/tienda"
            className="flex-1 flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium px-6 py-3.5 rounded-2xl transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 border border-sage-200 text-sage-600 hover:border-sage-400 font-sans font-medium px-6 py-3.5 rounded-2xl transition-colors bg-white"
          >
            Ir al inicio
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-12">

        {/* ── Left: form ── */}
        <div className="flex flex-col gap-8">

          {/* Banner auth */}
          {!user ? (
            <div className="flex items-center gap-3 bg-sage-50 border border-sage-200 rounded-2xl px-4 py-3.5">
              <UserCircle2 className="w-5 h-5 text-sage-400 flex-shrink-0" />
              <p className="font-sans text-sm text-sage-600 flex-1">
                ¿Tenés cuenta?{" "}
                <button type="button" onClick={openAuthModal} className="text-sage-700 font-semibold underline underline-offset-2 hover:text-sage-800">
                  Iniciá sesión
                </button>{" "}
                para pre-llenar tus datos automáticamente.
              </p>
            </div>
          ) : !isEmailConfirmed ? (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
              <span className="text-amber-500 flex-shrink-0">⚠️</span>
              <p className="font-sans text-sm text-amber-700">
                Confirmá tu email para poder guardar tus datos en tu perfil.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-sage-50 border border-sage-200 rounded-2xl px-4 py-3.5">
              <UserCircle2 className="w-5 h-5 text-sage-500 flex-shrink-0" />
              <p className="font-sans text-sm text-sage-600">
                Hola, <span className="font-semibold text-sage-700">{profile?.nombre?.split(" ")[0] ?? user.email}</span>. Tus datos fueron pre-cargados.
              </p>
            </div>
          )}

          {/* Delivery method */}
          <Section title="Método de entrega" step={1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <OptionCard
                active={delivery === "envio"}
                onClick={() => setDelivery("envio")}
                icon={<Truck className="w-5 h-5" />}
                label="Envío a domicilio"
                sub="Solo dentro de CABA"
              />
              <OptionCard
                active={delivery === "retiro"}
                onClick={() => setDelivery("retiro")}
                icon={<Store className="w-5 h-5" />}
                label="Retiro en local"
                sub="Tte. Gral. Frías 262, CABA"
              />
            </div>
            {delivery === "envio" && (
              <div className="mt-3 flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <Truck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-blue-700 leading-relaxed">
                  <span className="font-semibold">Realizamos envíos únicamente en CABA.</span>{" "}
                  Si estás en GBA u otra zona, podés pasar a retirar por el local o escribirnos por WhatsApp para consultar.
                </p>
              </div>
            )}
          </Section>

          {/* Contact info */}
          <Section title="Tus datos" step={2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Nombre completo *"
                placeholder="Ej: Laura García"
                error={errors.nombre}
                {...field("nombre")}
              />
              <Field
                label="Teléfono / WhatsApp *"
                placeholder="Ej: 11 1234-5678"
                error={errors.telefono}
                type="tel"
                {...field("telefono")}
              />
              <Field
                label="Email"
                placeholder="tu@email.com"
                type="email"
                {...field("email")}
              />
              {delivery === "envio" && (
                <>
                  <Field
                    label="Dirección de entrega *"
                    placeholder="Calle, número, piso, depto"
                    error={errors.direccion}
                    {...field("direccion")}
                  />
                  <CPField
                    value={form.codigoPostal}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, codigoPostal: v }));
                      if (errors.codigoPostal) setErrors((e) => ({ ...e, codigoPostal: undefined }));
                    }}
                    error={errors.codigoPostal}
                  />
                </>
              )}
            </div>
            <div className="mt-4">
              <label className="block font-sans text-xs font-medium text-sage-500 uppercase tracking-wider mb-1.5">
                Notas adicionales
              </label>
              <textarea
                placeholder="Aclaraciones sobre el pedido, alergias, preferencias..."
                rows={3}
                className="w-full rounded-xl border border-sage-200 bg-white px-4 py-3 font-sans text-sm text-sage-700 placeholder:text-sage-300 focus:outline-none focus:border-sage-400 transition-colors resize-none"
                {...field("notas")}
              />
            </div>
          </Section>

          {/* Guardar datos — solo si logueado y confirmado */}
          {user && isEmailConfirmed && (
            <label className="flex items-center gap-3 cursor-pointer group -mt-4 px-1">
              <div
                onClick={() => setSaveData((v) => !v)}
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  saveData ? "bg-sage-500 border-sage-500" : "border-sage-300 group-hover:border-sage-400"
                )}
              >
                {saveData && <Save className="w-3 h-3 text-white" />}
              </div>
              <span className="font-sans text-sm text-sage-600">
                Guardar mis datos para la próxima compra
              </span>
            </label>
          )}

          {/* Payment method */}
          <Section title="Forma de pago" step={3}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <OptionCard
                active={payment === "mercadopago"}
                onClick={() => { setPayment("mercadopago"); setMpError(null); }}
                icon={<CreditCard className="w-5 h-5" />}
                label="MercadoPago"
                sub="Tarjeta, débito o QR"
              />
              <OptionCard
                active={payment === "transferencia"}
                onClick={() => setPayment("transferencia")}
                icon={<Banknote className="w-5 h-5" />}
                label="Transferencia bancaria"
                sub="CBU / Alias por WhatsApp"
              />
              <OptionCard
                active={payment === "efectivo"}
                onClick={() => setPayment("efectivo")}
                icon={<Banknote className="w-5 h-5" />}
                label="Efectivo"
                sub="Al momento de la entrega"
              />
            </div>
            {payment === "mercadopago" ? (
              <p className="font-sans text-xs text-sage-400 mt-3 bg-sage-50 rounded-xl px-4 py-3 border border-sage-100">
                🔒 Serás redirigido a MercadoPago para completar el pago de forma segura.
              </p>
            ) : (
              <p className="font-sans text-xs text-sage-400 mt-3 bg-sage-50 rounded-xl px-4 py-3 border border-sage-100">
                💬 Al confirmar el pedido te enviamos los datos de pago por WhatsApp.
              </p>
            )}
            {mpError && (
              <p className="font-sans text-xs text-salmon-500 mt-2 bg-salmon-50 rounded-xl px-4 py-3 border border-salmon-200">
                ⚠️ {mpError}
              </p>
            )}
            {comboError && (
              <p className="font-sans text-xs text-red-600 mt-2 bg-red-50 rounded-xl px-4 py-3 border border-red-200">
                ❌ {comboError}
              </p>
            )}
          </Section>
        </div>

        {/* ── Right: order summary ── */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(84,125,84,0.10)] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-sage-100">
              <h3
                className="font-serif text-2xl text-sage-800 font-semibold"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
              >
                Tu pedido
              </h3>
              <p className="font-sans text-xs text-sage-400 mt-0.5">
                {itemCount} {itemCount === 1 ? "producto" : "productos"}
              </p>
            </div>

            {/* Items */}
            <div className="px-6 py-4 flex flex-col gap-4 max-h-72 overflow-y-auto">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-200 flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.imageAlt}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-serif text-sage-800 font-semibold text-base leading-snug truncate"
                        style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                      >
                        {item.product.name}
                      </p>
                      <p className="font-sans text-sage-400 text-xs">
                        {formatPrice(item.product.price)} c/u
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-sage-100 hover:bg-sage-200 flex items-center justify-center text-sage-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-sans text-sm font-semibold text-sage-700 w-4 text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-sage-100 hover:bg-sage-200 flex items-center justify-center text-sage-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-serif text-sage-700 font-semibold"
                            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                          >
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id)}
                            className="p-1 text-sage-300 hover:text-salmon-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Combo items en el resumen */}
              <AnimatePresence>
                {comboItems.map((item) => (
                  <motion.div key={`combo-${item.combo.id}`} layout exit={{ opacity: 0, height: 0 }} className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Gift className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-sans text-[9px] uppercase tracking-wider text-amber-600 font-semibold bg-amber-100 px-1.5 py-0.5 rounded-full">Combo</span>
                      </div>
                      <p className="font-serif text-sage-800 font-semibold text-base leading-snug truncate" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                        {item.combo.name}
                      </p>
                      <p className="font-sans text-sage-400 text-xs">{formatPrice(item.combo.price)} c/u</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => updateComboQuantity(item.combo.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-amber-700 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-sans text-sm font-semibold text-sage-700 w-4 text-center tabular-nums">{item.quantity}</span>
                          <button type="button" onClick={() => updateComboQuantity(item.combo.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-amber-700 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sage-700 font-semibold" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                            {formatPrice(item.combo.price * item.quantity)}
                          </span>
                          <button type="button" onClick={() => removeCombo(item.combo.id)} className="p-1 text-sage-300 hover:text-salmon-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Totals */}
            <div className="px-6 py-4 border-t border-sage-100 bg-sage-50/60">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-sm text-sage-500">Subtotal</span>
                <span className="font-sans text-sm text-sage-700">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-sans text-sm text-sage-500">Envío</span>
                <span className="font-sans text-xs text-sage-400 italic">
                  {delivery === "retiro" ? "Gratis (retiro)" : "A coordinar"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-sage-200">
                <span className="font-sans font-semibold text-sage-700">Total</span>
                <span
                  className="font-serif text-3xl font-semibold text-sage-800"
                  style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
                >
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Submit */}
            <div className="px-6 pb-6 pt-4">
              <motion.button
                type="submit"
                disabled={saving}
                whileTap={{ scale: saving ? 1 : 0.97 }}
                className={cn(
                  "w-full flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed text-white font-sans font-semibold text-base py-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5",
                  payment === "mercadopago"
                    ? "bg-[#009EE3] hover:bg-[#0088C7] shadow-[0_4px_20px_rgba(0,158,227,0.35)] hover:shadow-[0_6px_28px_rgba(0,158,227,0.45)]"
                    : "bg-[#25D366] hover:bg-[#20BD5A] shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.45)]"
                )}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : payment === "mercadopago" ? (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pagar con MercadoPago
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    Confirmar pedido por WhatsApp
                  </>
                )}
              </motion.button>
              <p className="font-sans text-[11px] text-sage-400 text-center mt-3">
                {payment === "mercadopago"
                  ? "Serás redirigido a MercadoPago de forma segura"
                  : "Se abrirá WhatsApp con el detalle de tu pedido"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ── Small UI components ── */

function Section({
  title,
  step,
  children,
}: {
  title: string;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(84,125,84,0.07)] p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-full bg-sage-500 text-white flex items-center justify-center font-sans font-bold text-xs flex-shrink-0">
          {step}
        </div>
        <h2
          className="font-serif text-xl text-sage-800 font-semibold"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function OptionCard({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 w-full",
        active
          ? "border-sage-400 bg-sage-50 shadow-sm"
          : "border-sage-100 bg-white hover:border-sage-200"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
          active ? "bg-sage-500 text-white" : "bg-sage-100 text-sage-500"
        )}
      >
        {icon}
      </div>
      <div>
        <p className="font-sans text-sm font-semibold text-sage-800">{label}</p>
        <p className="font-sans text-xs text-sage-400">{sub}</p>
      </div>
      {active && (
        <div className="ml-auto w-4 h-4 rounded-full bg-sage-500 flex items-center justify-center flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      )}
    </button>
  );
}

function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block font-sans text-xs font-medium text-sage-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        className={cn(
          "w-full rounded-xl border px-4 py-3 font-sans text-sm text-sage-700 placeholder:text-sage-300 focus:outline-none transition-colors bg-white",
          error
            ? "border-salmon-400 focus:border-salmon-400 bg-salmon-50/30"
            : "border-sage-200 focus:border-sage-400"
        )}
        {...props}
      />
      {error && (
        <p className="font-sans text-xs text-salmon-400 mt-1">{error}</p>
      )}
    </div>
  );
}

function CPField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const valid = value.trim() && isCABA(value);
  const invalid = value.trim() && !isCABA(value);

  return (
    <div>
      <label className="block font-sans text-xs font-medium text-sage-500 uppercase tracking-wider mb-1.5">
        Código postal *
      </label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: 1425 o C1425ABC"
          maxLength={8}
          className={cn(
            "w-full rounded-xl border px-4 py-3 pr-10 font-sans text-sm text-sage-700 placeholder:text-sage-300 focus:outline-none transition-colors bg-white",
            error || invalid
              ? "border-red-400 focus:border-red-400 bg-red-50/30"
              : valid
              ? "border-sage-400 focus:border-sage-500 bg-sage-50/30"
              : "border-sage-200 focus:border-sage-400"
          )}
        />
        {valid && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-500" />
        )}
      </div>
      {(error || invalid) && (
        <p className="font-sans text-xs text-red-500 mt-1">
          {error ?? "Solo realizamos envíos dentro de CABA (CP 1000–1499)"}
        </p>
      )}
      {valid && (
        <p className="font-sans text-xs text-sage-500 mt-1">✓ Código postal de CABA válido</p>
      )}
    </div>
  );
}

/* ── Page wrapper ── */

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-cream-100">
        <StoreNavbar />

        {/* Page header */}
        <div className="bg-sage-600 text-white py-10 px-5">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center gap-1.5 text-xs font-sans text-sage-300 mb-3">
              <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/tienda" className="hover:text-white transition-colors">Tienda</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">Checkout</span>
            </nav>
            <h1
              className="font-serif text-4xl md:text-5xl font-semibold"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              Finalizar pedido
            </h1>
          </div>
        </div>

        {/* Back link + content */}
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-8">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-1.5 text-sm font-sans text-sage-400 hover:text-sage-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Seguir comprando
          </Link>

          <CheckoutContent />
        </div>

        <Footer />
      </div>
  );
}
