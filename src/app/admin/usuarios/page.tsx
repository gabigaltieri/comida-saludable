"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Loader2, Search, RefreshCw, CheckCircle2, XCircle,
  Mail, Phone, CalendarDays, Clock, UserCheck,
  Trash2, AlertTriangle,
} from "lucide-react";

type UserRow = {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterConfirmed, setFilterConfirmed] = useState<"todos" | "confirmado" | "pendiente">("todos");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchUsers = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (Array.isArray(data)) setUsers(data);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, []);

  const eliminar = async (id: string) => {
    setDeleting(id);
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setConfirmDelete(null);
    setDeleting(null);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      (u.nombre ?? "").toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.telefono ?? "").includes(q);
    const matchFilter =
      filterConfirmed === "todos" ||
      (filterConfirmed === "confirmado" && !!u.email_confirmed_at) ||
      (filterConfirmed === "pendiente" && !u.email_confirmed_at);
    return matchSearch && matchFilter;
  });

  const totalConfirmados = users.filter((u) => !!u.email_confirmed_at).length;
  const totalPendientes = users.filter((u) => !u.email_confirmed_at).length;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1
            className="font-serif text-3xl text-sage-800 mb-1"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
          >
            Usuarios
          </h1>
          <p className="font-sans text-sm text-sage-500">
            Clientes registrados en la tienda.
          </p>
        </div>
        <button
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-sage-200 bg-white font-sans text-sm text-sage-600 hover:bg-sage-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          Recargar
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="font-sans text-2xl font-bold text-sage-800">{users.length}</p>
          <p className="font-sans text-xs text-sage-500 mt-1">Total registrados</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="font-sans text-2xl font-bold text-emerald-600">{totalConfirmados}</p>
          <p className="font-sans text-xs text-sage-500 mt-1">Confirmados</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="font-sans text-2xl font-bold text-amber-500">{totalPendientes}</p>
          <p className="font-sans text-xs text-sage-500 mt-1">Pendientes</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-sage-200 bg-white text-sm font-sans text-sage-700 placeholder:text-sage-400 focus:outline-none focus:border-sage-400"
          />
        </div>
        <select
          value={filterConfirmed}
          onChange={(e) => setFilterConfirmed(e.target.value as typeof filterConfirmed)}
          className="px-3 py-2.5 rounded-xl border border-sage-200 bg-white text-sm font-sans text-sage-700 focus:outline-none focus:border-sage-400"
        >
          <option value="todos">Todos</option>
          <option value="confirmado">Confirmados</option>
          <option value="pendiente">Pendientes de confirmación</option>
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-sage-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-sage-400 font-sans text-sm">
          {users.length === 0
            ? "Todavía no hay usuarios registrados."
            : "No hay usuarios que coincidan con la búsqueda."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-gray-100 bg-sage-50/60">
                  <th className="text-left px-5 py-3 font-semibold text-sage-600 text-xs uppercase tracking-wide">Usuario</th>
                  <th className="text-left px-5 py-3 font-semibold text-sage-600 text-xs uppercase tracking-wide">Contacto</th>
                  <th className="text-left px-5 py-3 font-semibold text-sage-600 text-xs uppercase tracking-wide">Estado</th>
                  <th className="text-left px-5 py-3 font-semibold text-sage-600 text-xs uppercase tracking-wide">Último acceso</th>
                  <th className="text-left px-5 py-3 font-semibold text-sage-600 text-xs uppercase tracking-wide">Registro</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-sage-50/30 transition-colors">
                    {/* Usuario */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                          <UserCheck className="w-4 h-4 text-sage-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sage-800 leading-tight">
                            {u.nombre ?? (
                              <span className="text-sage-400 italic font-normal">Sin nombre</span>
                            )}
                          </p>
                          <p className="text-xs text-sage-400 mt-0.5 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="px-5 py-4">
                      {u.telefono ? (
                        <a
                          href={`https://wa.me/549${u.telefono.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {u.telefono}
                        </a>
                      ) : (
                        <span className="text-sage-300 italic text-xs">Sin teléfono</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-4">
                      {u.email_confirmed_at ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Confirmado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                          <XCircle className="w-3 h-3" />
                          Pendiente
                        </span>
                      )}
                    </td>

                    {/* Último acceso */}
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sage-500 text-xs">
                        <Clock className="w-3.5 h-3.5 text-sage-400" />
                        {formatDateTime(u.last_sign_in_at)}
                      </span>
                    </td>

                    {/* Fecha de registro */}
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sage-500 text-xs">
                        <CalendarDays className="w-3.5 h-3.5 text-sage-400" />
                        {formatDate(u.created_at)}
                      </span>
                    </td>

                    {/* Eliminar */}
                    <td className="px-5 py-4">
                      {confirmDelete === u.id ? (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 whitespace-nowrap">
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <span className="font-sans text-xs text-red-600">¿Eliminar?</span>
                          <button
                            onClick={() => eliminar(u.id)}
                            disabled={deleting === u.id}
                            className="font-sans text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deleting === u.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Sí"
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="font-sans text-xs text-sage-500 hover:text-sage-700 px-2 py-1 rounded-lg transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(u.id)}
                          className="p-2 rounded-xl border border-transparent text-sage-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-sage-50/40">
            <p className="font-sans text-xs text-sage-400">
              Mostrando {filtered.length} de {users.length} usuarios
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
