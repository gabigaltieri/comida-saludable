import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import ExcelJS from "exceljs";
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

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Productos");

  ws.columns = [
    { header: "id",          key: "id",          width: 20 },
    { header: "nombre",      key: "nombre",      width: 32 },
    { header: "descripcion", key: "descripcion", width: 45 },
    { header: "precio",      key: "precio",      width: 10 },
    { header: "categoria",   key: "categoria",   width: 22 },
    { header: "imagen1",     key: "imagen1",     width: 50 },
    { header: "imagen2",     key: "imagen2",     width: 50 },
    { header: "imagen3",     key: "imagen3",     width: 50 },
    { header: "imagen_alt",  key: "imagen_alt",  width: 30 },
    { header: "tags",        key: "tags",        width: 30 },
    { header: "destacado",   key: "destacado",   width: 10 },
    { header: "disponible",  key: "disponible",  width: 10 },
  ];

  ws.addRows(
    (data ?? []).map((p) => ({
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
    }))
  );

  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="262-productos-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
