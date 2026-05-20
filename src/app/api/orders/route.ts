import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`orders:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intentá en un momento." }, { status: 429 });
  }

  const body = await req.json();
  const { cliente, telefono, email, productos, entrega, direccion, pago, notas } = body;

  if (!cliente || !telefono || !productos) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
  }

  type OrderItem = { nombre: string; cantidad: number; precio: number };
  const serverTotal = (productos as OrderItem[])
    .reduce((sum, p) => sum + Number(p.precio) * Number(p.cantidad), 0);

  if (serverTotal <= 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      cliente,
      telefono,
      email: email || null,
      productos,
      total: serverTotal,
      estado: "pendiente",
      entrega,
      direccion: direccion || null,
      pago,
      notas: notas || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error al guardar pedido:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
