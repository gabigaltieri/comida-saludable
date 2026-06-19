"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CredentialStatus {
  configured: boolean;
  masked: string;
}

interface CredentialsState {
  mp_access_token: CredentialStatus;
  mp_public_key: CredentialStatus;
  mp_webhook_secret: CredentialStatus;
}

type FieldKey = keyof CredentialsState;

const FIELDS: { key: FieldKey; label: string; description: string }[] = [
  {
    key: "mp_access_token",
    label: "Access Token",
    description: 'Empieza con "APP_USR-..." — es la llave principal para procesar pagos',
  },
  {
    key: "mp_public_key",
    label: "Public Key",
    description: 'Empieza con "APP_USR-..." — identifica tu cuenta en el checkout',
  },
  {
    key: "mp_webhook_secret",
    label: "Webhook Secret",
    description: "Clave secreta para verificar notificaciones de pagos aprobados",
  },
];

export default function CredencialesPage() {
  const [status, setStatus] = useState<CredentialsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState<Record<FieldKey, boolean>>({
    mp_access_token: false,
    mp_public_key: false,
    mp_webhook_secret: false,
  });
  const [form, setForm] = useState<Record<FieldKey, string>>({
    mp_access_token: "",
    mp_public_key: "",
    mp_webhook_secret: "",
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/credentials");
      if (res.ok) setStatus(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    const payload: Record<string, string> = {};
    for (const { key } of FIELDS) {
      if (form[key].trim()) payload[key] = form[key].trim();
    }

    if (Object.keys(payload).length === 0) {
      setError("Completá al menos un campo para guardar.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/credentials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al guardar");
      } else {
        setSaved(true);
        setForm({ mp_access_token: "", mp_public_key: "", mp_webhook_secret: "" });
        await fetchStatus();
        setTimeout(() => setSaved(false), 4000);
      }
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setSaving(false);
    }
  };

  const isPaymentConfigured =
    status?.mp_access_token.configured && status?.mp_public_key.configured;
  const isAllConfigured = isPaymentConfigured && status?.mp_webhook_secret.configured;

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#009EE3]/10 flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-5 h-5 text-[#009EE3]" />
          </div>
          <h1
            className="font-serif text-3xl text-sage-800 font-semibold"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            Credenciales de MercadoPago
          </h1>
        </div>
        <p className="font-sans text-sm text-sage-400 mt-1 ml-[52px]">
          Pegá acá las llaves de tu cuenta para activar los pagos online.
        </p>
      </div>

      {/* Status banner */}
      {!loading && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl px-5 py-4 mb-6 border",
            isAllConfigured
              ? "bg-sage-50 border-sage-200"
              : isPaymentConfigured
              ? "bg-blue-50 border-blue-200"
              : "bg-amber-50 border-amber-200"
          )}
        >
          {isAllConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-sage-500 flex-shrink-0" />
          ) : isPaymentConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          )}
          <p
            className={cn(
              "font-sans text-sm",
              isAllConfigured
                ? "text-sage-700"
                : isPaymentConfigured
                ? "text-blue-700"
                : "text-amber-700"
            )}
          >
            {isAllConfigured
              ? "MercadoPago está completamente configurado. Los pagos online están activos."
              : isPaymentConfigured
              ? "Pagos activos. Falta el Webhook Secret (opcional — sirve para marcar pedidos como pagados automáticamente)."
              : "Faltan el Access Token y la Public Key para activar los pagos."}
          </p>
        </div>
      )}

      {/* Credentials fields */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-100 mb-5">
        {FIELDS.map(({ key, label, description }) => {
          const configured = status?.[key]?.configured ?? false;
          const masked = status?.[key]?.masked ?? "";

          return (
            <div key={key} className="px-6 py-5">
              <div className="flex items-center justify-between mb-1">
                <label className="font-sans text-sm font-semibold text-sage-700">
                  {label}
                </label>
                {!loading && (
                  configured ? (
                    <span className="flex items-center gap-1 text-[11px] font-sans text-sage-500 bg-sage-50 px-2 py-0.5 rounded-full border border-sage-100">
                      <CheckCircle2 className="w-3 h-3" /> Configurado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-sans text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      <AlertCircle className="w-3 h-3" /> Sin configurar
                    </span>
                  )
                )}
              </div>
              <p className="font-sans text-xs text-sage-400 mb-3">{description}</p>

              {configured && !form[key] && (
                <p className="font-mono text-xs text-sage-400 mb-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  {masked}
                </p>
              )}

              <div className="relative">
                <input
                  type={show[key] ? "text" : "password"}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  placeholder={
                    configured
                      ? "Pegar nueva clave para reemplazar..."
                      : "Pegar clave aquí..."
                  }
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-xl border border-sage-200 bg-white px-4 py-3 pr-11 font-mono text-sm text-sage-700 placeholder:text-sage-300 focus:outline-none focus:border-sage-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-300 hover:text-sage-500 transition-colors"
                >
                  {show[key] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback */}
      {error && (
        <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          ⚠️ {error}
        </p>
      )}
      {saved && (
        <p className="font-sans text-sm text-sage-600 bg-sage-50 border border-sage-200 rounded-xl px-4 py-3 mb-4">
          ✓ Credenciales guardadas correctamente.
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#009EE3] hover:bg-[#0088C7] disabled:opacity-60 disabled:cursor-not-allowed text-white font-sans font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Guardando..." : "Guardar credenciales"}
        </button>
        <button
          onClick={fetchStatus}
          className="flex items-center gap-2 text-sage-400 hover:text-sage-600 font-sans text-sm px-3 py-3 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-sage-50 rounded-2xl px-6 py-5 border border-sage-100">
        <h3 className="font-sans text-sm font-semibold text-sage-700 mb-3">
          ¿Cómo obtener las claves?
        </h3>
        <ol className="font-sans text-sm text-sage-500 space-y-2.5 list-decimal list-inside">
          <li>
            Entrá a{" "}
            <span className="font-medium text-sage-700">
              mercadopago.com.ar/developers/panel
            </span>{" "}
            con la cuenta del negocio
          </li>
          <li>
            Creá una aplicación nueva (elegir{" "}
            <span className="font-medium text-sage-700">
              Pagos online → CheckoutPro
            </span>
            )
          </li>
          <li>
            En <span className="font-medium text-sage-700">&ldquo;Credenciales&rdquo;</span>{" "}
            copiá el <span className="font-medium text-sage-700">Access Token</span>{" "}
            y la <span className="font-medium text-sage-700">Public Key</span>
          </li>
          <li>
            En <span className="font-medium text-sage-700">&ldquo;Webhooks&rdquo;</span> configurá
            la URL:
            <br />
            <code className="text-xs bg-white border border-sage-200 rounded px-2 py-1 mt-1.5 inline-block text-sage-600 break-all">
              https://comida-saludable-gules.vercel.app/api/checkout/webhook
            </code>
          </li>
          <li>
            Copiá el{" "}
            <span className="font-medium text-sage-700">Webhook Secret</span> y
            pegalo en el campo de arriba
          </li>
        </ol>
      </div>
    </div>
  );
}
