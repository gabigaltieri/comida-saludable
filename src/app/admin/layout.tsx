"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Leaf,
  Gift,
  Layers,
  Users,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/combos", label: "Combos", icon: Gift },
  { href: "/admin/categorias", label: "Categorías", icon: Layers },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/leads", label: "Consultas", icon: Users },
  { href: "/admin/tags", label: "Etiquetas", icon: Tag },
];

function Sidebar({ onLogout, mobile, onClose }: { onLogout: () => void; mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col bg-sage-800 text-white",
        mobile ? "w-72 h-full" : "w-64 h-screen sticky top-0"
      )}
    >
      <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage-500 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="font-serif text-white font-semibold text-xl leading-none"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>262</p>
            <p className="font-sans text-white/40 text-[9px] uppercase tracking-widest leading-none mt-0.5">Admin</p>
          </div>
        </div>
        {mobile && (
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        <p className="font-sans text-white/25 text-[10px] uppercase tracking-widest px-3 mb-2">Menú</p>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sage-500 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 border-t border-white/10 pt-4 flex flex-col gap-2 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <span className="text-base">🏠</span>
          Ver sitio
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm text-white/50 hover:text-red-300 hover:bg-white/10 transition-all w-full text-left"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") return;
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/admin/login");
    });
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;

  const logout = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar onLogout={logout} />
      </div>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <Sidebar onLogout={logout} mobile onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-sage-600 hover:bg-sage-50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif text-sage-800 font-semibold text-lg"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
            262 Admin
          </span>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
