import { supabase, supabaseAdmin } from "./supabase";
// supabaseAdmin se usa en las API routes del servidor para operaciones de escritura
import { Product, CategoryId, Combo } from "./data";

// Mapea la fila de Supabase (snake_case) al tipo Product (camelCase)
function toProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    price: Number(row.price),
    category: row.category as CategoryId,
    image: row.image as string,
    image2: (row.image2 as string) || undefined,
    image3: (row.image3 as string) || undefined,
    imageAlt: row.image_alt as string,
    tags: (row.tags as string[]) ?? [],
    featured: row.featured as boolean,
    available: row.available as boolean,
  };
}

// ── Products ──────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const res = await fetch("/api/products", { cache: "no-store" });
  if (!res.ok) throw new Error("Error al cargar productos");
  const data = await res.json();
  return (data ?? []).map(toProduct);
}

export async function createProduct(p: Omit<Product, "id">): Promise<Product> {
  const res = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!res.ok) throw new Error(await res.text());
  const row = await res.json();
  return toProduct(row);
}

export async function updateProduct(id: string, p: Partial<Omit<Product, "id">>): Promise<Product> {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!res.ok) throw new Error(await res.text());
  const row = await res.json();
  return toProduct(row);
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

// ── Orders ────────────────────────────────────────────────

export interface Order {
  id: number;
  order_number: string;
  cliente: string;
  telefono: string;
  email?: string;
  productos: { nombre: string; cantidad: number; precio: number }[];
  total: number;
  estado: "pendiente" | "en preparación" | "entregado" | "cancelado";
  entrega: "envio" | "retiro";
  direccion?: string;
  pago: string;
  notas?: string;
  created_at: string;
}

export async function getOrders(): Promise<Order[]> {
  const res = await fetch("/api/admin/orders", { cache: "no-store" });
  if (!res.ok) throw new Error("Error al cargar pedidos");
  return res.json();
}

export async function updateOrderStatus(
  id: number,
  estado: Order["estado"]
): Promise<void> {
  const res = await fetch(`/api/admin/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error("Error al actualizar estado");
}

// ── Combos ────────────────────────────────────────────────

function toCombo(row: Record<string, unknown>): Combo {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    price: Number(row.price),
    image: row.image as string,
    imageAlt: (row.image_alt as string) ?? "",
    product_ids: (row.product_ids as string[]) ?? [],
    available: row.available as boolean,
    sort_order: row.sort_order as number | undefined,
  };
}

export async function getCombos(): Promise<Combo[]> {
  const res = await fetch("/api/combos", { cache: "no-store" });
  if (!res.ok) throw new Error("Error al cargar combos");
  const data = await res.json();
  return Array.isArray(data) ? data.map(toCombo) : [];
}

export async function getAllCombos(): Promise<Combo[]> {
  const res = await fetch("/api/admin/combos", { cache: "no-store" });
  if (!res.ok) throw new Error("Error al cargar combos");
  const data = await res.json();
  return Array.isArray(data) ? data.map(toCombo) : [];
}

export async function createCombo(c: Omit<Combo, "id">): Promise<Combo> {
  const res = await fetch("/api/admin/combos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(c),
  });
  if (!res.ok) throw new Error(await res.text());
  return toCombo(await res.json());
}

export async function updateCombo(id: string, c: Partial<Omit<Combo, "id">>): Promise<Combo> {
  const res = await fetch(`/api/admin/combos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(c),
  });
  if (!res.ok) throw new Error(await res.text());
  return toCombo(await res.json());
}

export async function deleteCombo(id: string): Promise<void> {
  const res = await fetch(`/api/admin/combos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

export async function createOrder(
  order: Omit<Order, "id" | "created_at">
): Promise<Order> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert(order)
    .select()
    .single();
  if (error) throw error;
  return data as Order;
}
