"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Leaf, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña incorrectos");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-sage-800 flex items-center justify-center px-5">
      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-sage-600 px-8 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1
              className="font-serif text-white text-3xl font-semibold"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              262 Admin
            </h1>
            <p className="font-sans text-sage-200 text-sm mt-1">Panel de administración</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sage-400" />
                <span className="font-sans text-sm font-medium text-sage-600">Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@262cosasricas.com"
                className="w-full rounded-xl border border-sage-200 px-4 py-3.5 font-sans text-sm text-sage-700 placeholder:text-sage-300 focus:outline-none focus:border-sage-400 transition-colors"
                autoFocus
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sage-400" />
                <span className="font-sans text-sm font-medium text-sage-600">Contraseña</span>
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-xl border px-4 py-3.5 pr-11 font-sans text-sm text-sage-700 placeholder:text-sage-300 focus:outline-none transition-colors",
                    error ? "border-red-300 bg-red-50/30" : "border-sage-200 focus:border-sage-400"
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="font-sans text-xs text-red-400">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sage-500 hover:bg-sage-600 disabled:opacity-60 text-white font-sans font-semibold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
