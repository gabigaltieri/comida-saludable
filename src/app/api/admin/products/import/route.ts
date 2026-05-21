import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import ExcelJS from "exceljs";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });

  const ALLOWED_MIME = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: "Solo se aceptan archivos .xlsx o .xls." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "El archivo no puede superar 5 MB." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(arrayBuffer);
  const ws = wb.worksheets[0];

  if (!ws || ws.rowCount < 2) {
    return NextResponse.json({ error: "El archivo está vacío." }, { status: 400 });
  }

  // Extraer cabeceras de la primera fila
  const headers: string[] = [];
  ws.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
    headers.push(cell.text);
  });

  // Construir objetos por fila (saltar fila de cabecera)
  const rows: Record<string, unknown>[] = [];
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const record: Record<string, unknown> = {};
    row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
      const header = headers[colIdx - 1];
      if (header) record[header] = cell.value;
    });
    rows.push(record);
  });

  if (!rows.length) return NextResponse.json({ error: "El archivo está vacío." }, { status: 400 });

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const nombre = String(row["nombre"] ?? "").trim();
    if (!nombre) continue; // saltar filas vacías

    const precio = Number(row["precio"]);
    if (!precio || isNaN(precio)) {
      errors.push(`Fila sin precio válido: "${nombre}"`);
      continue;
    }

    const tagsRaw = String(row["tags"] ?? "");
    const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

    const payload = {
      name:        nombre,
      description: String(row["descripcion"] ?? ""),
      price:       precio,
      category:    String(row["categoria"] ?? "viandas-congeladas"),
      image:       String(row["imagen1"] ?? ""),
      image2:      String(row["imagen2"] ?? "") || null,
      image3:      String(row["imagen3"] ?? "") || null,
      image_alt:   String(row["imagen_alt"] ?? ""),
      tags,
      featured:    String(row["destacado"] ?? "").toUpperCase() === "SI",
      available:   String(row["disponible"] ?? "SI").toUpperCase() !== "NO",
    };

    const existingId = String(row["id"] ?? "").trim();

    if (existingId) {
      const { error } = await supabaseAdmin
        .from("products")
        .update(payload)
        .eq("id", existingId);

      if (error) errors.push(`Error actualizando "${nombre}": ${error.message}`);
      else updated++;
    } else {
      const { error } = await supabaseAdmin
        .from("products")
        .insert({ id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...payload });

      if (error) errors.push(`Error creando "${nombre}": ${error.message}`);
      else created++;
    }
  }

  return NextResponse.json({ ok: true, created, updated, errors });
}
