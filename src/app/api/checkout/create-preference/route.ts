import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "MercadoPago no está configurado todavía." },
      { status: 503 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`checkout:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intentá en un momento." }, { status: 429 });
  }

  const body = await req.json();
  const { cliente, telefono, email, productos, entrega, direccion, notas } = body;

  if (!cliente || !telefono || !productos) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
  }

  type OrderItem = { nombre: string; cantidad: number; precio: number };
  const serverTotal = (productos as OrderItem[])
    .reduce((sum, p) => sum + Number(p.precio) * Number(p.cantidad), 0);

  if (serverTotal <= 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  // 1. Guardar pedido — el trigger genera order_number automáticamente
  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      cliente,
      telefono,
      email: email || null,
      productos,
      total: serverTotal,
      estado: "pendiente_pago",
      entrega,
      direccion: direccion || null,
      pago: "MercadoPago",
      notas: notas || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error al guardar pedido MP:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const order_number = data.order_number as string;

  // 2. Crear preferencia en MercadoPago
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
  const preference = new Preference(client);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://262cosasricas.com.ar";

  const mpItems = (productos as OrderItem[]).map((p) => ({
    id: p.nombre,
    title: p.nombre,
    quantity: p.cantidad,
    unit_price: p.precio,
    currency_id: "ARS",
  }));

  try {
    const result = await preference.create({
      body: {
        external_reference: order_number,
        items: mpItems,
        payer: {
          name: cliente,
          ...(email ? { email } : {}),
        },
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout/failure`,
          pending: `${baseUrl}/checkout/success`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/checkout/webhook`,
        statement_descriptor: "262 Cosas Ricas",
      },
    });

    return NextResponse.json(
      { init_point: result.init_point, order_number },
      { status: 200 }
    );
  } catch (mpError) {
    console.error("Error al crear preferencia MP:", mpError);
    return NextResponse.json(
      { error: "Error al conectar con MercadoPago" },
      { status: 500 }
    );
  }
}
