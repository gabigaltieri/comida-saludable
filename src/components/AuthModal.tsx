"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Tab = "login" | "register";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    nombre: "", telefono: "", email: "", password: "", confirm: "",
  });

  const supabase = createSupabaseBrowser();

  const handleResendConfirmation = async () => {
    if (!loginForm.email) return;
    setResending(true);
    await supabase.auth.resend({ type: "signup", email: loginForm.email });
    setResending(false);
    setResent(true);
  };

  const resetState = () => {
    setError(null);
    setRegistered(false);
    setEmailNotConfirmed(false);
    setResent(false);
    setShowPassword(false);
    setLoginForm({ email: "", password: "" });
    setRegisterForm({ nombre: "", telefono: "", email: "", password: "", confirm: "" });
  };

  const handleClose = () => {
    resetState();
    closeAuthModal();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Confirmá tu email antes de iniciar sesión. Revisá tu bandeja de entrada.");
        setEmailNotConfirmed(true);
      } else if (error.message.includes("Invalid login credentials")) {
        setError("Email o contraseña incorrectos.");
      } else {
        setError(error.message);
      }
      return;
    }
    handleClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { nombre, telefono, email, password, confirm } = registerForm;
    if (!nombre.trim() || !telefono.trim()) {
      setError("Nombre y teléfono son requeridos.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, telefono } },
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("already registered")) {
        setError("Este email ya tiene una cuenta. Iniciá sesión.");
      } else {
        setError(error.message);
      }
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        nombre,
        telefono,
        updated_at: new Date().toISOString(),
      });
    }
    setRegistered(true);
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="font-serif text-2xl text-sage-800 font-semibold"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
                {registered ? "¡Registro exitoso!" : tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </h2>
              {!registered && (
                <p className="font-sans text-xs text-sage-400 mt-0.5">
                  {tab === "login" ? "Accedé a tus datos guardados" : "Guardá tus datos para comprar más rápido"}
                </p>
              )}
            </div>
            <button onClick={handleClose} className="p-2 rounded-full hover:bg-sage-100 text-sage-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Registered success state */}
          {registered ? (
            <div className="px-6 pb-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center">
                <Mail className="w-8 h-8 text-sage-500" />
              </div>
              <div>
                <p className="font-sans text-sage-700 text-sm font-medium mb-1">
                  Te enviamos un email de confirmación a
                </p>
                <p className="font-sans text-sage-800 font-semibold text-sm">{registerForm.email}</p>
              </div>
              <p className="font-sans text-xs text-sage-400 leading-relaxed">
                Revisá tu bandeja de entrada (y la carpeta de spam) y hacé clic en el enlace para activar tu cuenta.
              </p>
              <button
                onClick={() => { setRegistered(false); setTab("login"); resetState(); }}
                className="w-full py-3 rounded-2xl bg-sage-500 hover:bg-sage-600 text-white font-sans font-medium text-sm transition-colors"
              >
                Ir a iniciar sesión
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex mx-6 mb-5 bg-sage-50 rounded-xl p-1">
                {(["login", "register"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(null); setEmailNotConfirmed(false); setResent(false); }}
                    className={cn(
                      "flex-1 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200",
                      tab === t ? "bg-white text-sage-700 shadow-sm" : "text-sage-400 hover:text-sage-600"
                    )}
                  >
                    {t === "login" ? "Iniciar sesión" : "Registrarme"}
                  </button>
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mx-6 mb-4 flex flex-col gap-2"
                  >
                    <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="font-sans text-xs text-red-600">{error}</p>
                    </div>

                    {emailNotConfirmed && (
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={resending || resent}
                        className={cn(
                          "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-sans text-sm font-medium border transition-all",
                          resent
                            ? "bg-sage-50 border-sage-200 text-sage-500 cursor-default"
                            : "bg-white border-sage-200 text-sage-600 hover:border-sage-400 hover:bg-sage-50"
                        )}
                      >
                        {resending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : resent ? (
                          <>✓ Email reenviado — revisá tu bandeja</>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Reenviar email de confirmación
                          </>
                        )}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login form */}
              {tab === "login" && (
                <form onSubmit={handleLogin} className="px-6 pb-6 flex flex-col gap-3">
                  <InputField
                    icon={<Mail className="w-4 h-4" />}
                    type="email" placeholder="tu@email.com" required
                    value={loginForm.email}
                    onChange={(e) => {
                      setLoginForm((f) => ({ ...f, email: e.target.value }));
                      setEmailNotConfirmed(false);
                      setResent(false);
                      setError(null);
                    }}
                  />
                  <div className="relative">
                    <InputField
                      icon={<Lock className="w-4 h-4" />}
                      type={showPassword ? "text" : "password"} placeholder="Contraseña" required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-sage-500 hover:bg-sage-600 disabled:opacity-60 text-white font-sans font-medium text-sm transition-colors mt-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ingresar"}
                  </button>
                  <p className="font-sans text-xs text-center text-sage-400">
                    ¿No tenés cuenta?{" "}
                    <button type="button" onClick={() => setTab("register")} className="text-sage-600 underline">
                      Registrate
                    </button>
                  </p>
                </form>
              )}

              {/* Register form */}
              {tab === "register" && (
                <form onSubmit={handleRegister} className="px-6 pb-6 flex flex-col gap-3">
                  <InputField
                    icon={<User className="w-4 h-4" />}
                    type="text" placeholder="Nombre completo *" required
                    value={registerForm.nombre}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, nombre: e.target.value }))}
                  />
                  <InputField
                    icon={<Phone className="w-4 h-4" />}
                    type="tel" placeholder="Teléfono / WhatsApp *" required
                    value={registerForm.telefono}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, telefono: e.target.value }))}
                  />
                  <InputField
                    icon={<Mail className="w-4 h-4" />}
                    type="email" placeholder="Email *" required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                  />
                  <div className="relative">
                    <InputField
                      icon={<Lock className="w-4 h-4" />}
                      type={showPassword ? "text" : "password"} placeholder="Contraseña (mín. 6 caracteres) *" required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <InputField
                    icon={<Lock className="w-4 h-4" />}
                    type={showPassword ? "text" : "password"} placeholder="Confirmar contraseña *" required
                    value={registerForm.confirm}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, confirm: e.target.value }))}
                  />
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-sage-500 hover:bg-sage-600 disabled:opacity-60 text-white font-sans font-medium text-sm transition-colors mt-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cuenta"}
                  </button>
                  <p className="font-sans text-xs text-center text-sage-400">
                    ¿Ya tenés cuenta?{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-sage-600 underline">
                      Iniciá sesión
                    </button>
                  </p>
                </form>
              )}
              {/* Admin access */}
              <div className="mx-6 mb-6 pt-4 border-t border-sage-100 flex items-center justify-center">
                <Link
                  href="/admin"
                  onClick={handleClose}
                  className="flex items-center gap-1.5 font-sans text-xs text-sage-400 hover:text-sage-600 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Acceder como administrador
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InputField({ icon, ...props }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400">{icon}</div>
      <input
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-sage-200 bg-white font-sans text-sm text-sage-700 placeholder:text-sage-300 focus:outline-none focus:border-sage-400 transition-colors"
        {...props}
      />
    </div>
  );
}
