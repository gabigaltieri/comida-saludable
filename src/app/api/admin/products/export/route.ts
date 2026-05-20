import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((p) => ({
    id:          p.id,
    nombre:      p.name,
    descripcion: p.description ?? "",
    precio:      p.price,
    categoria:   p.category,
    imagen1:     p.image ?? "",
    imagen2:     p.image2 ?? "",
    imagen3:     p.image3 ?? "",
    imagen_alt:  p.image_alt ?? "",
    tags:        Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags ?? ""),
    destacado:   p.featured ? "SI" : "NO",
    disponible:  p.available ? "SI" : "NO",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Anchos de columna
  ws["!cols"] = [
    { wch: 20 }, // id
    { wch: 32 }, // nombre
    { wch: 45 }, // descripcion
    { wch: 10 }, // precio
    { wch: 22 }, // categoria
    { wch: 50 }, // imagen1
    { wch: 50 }, // imagen2
    { wch: 50 }, // imagen3
    { wch: 30 }, // imagen_alt
    { wch: 30 }, // tags
    { wch: 10 }, // destacado
    { wch: 10 }, // disponible
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Productos");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="262-productos-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
