import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import * as XLSX from "xlsx";
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
  const wb = XLSX.read(arrayBuffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

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
      // Actualizar producto existente
      const { error } = await supabaseAdmin
        .from("products")
        .update(payload)
        .eq("id", existingId);

      if (error) errors.push(`Error actualizando "${nombre}": ${error.message}`);
      else updated++;
    } else {
      // Crear nuevo producto
      const { error } = await supabaseAdmin
        .from("products")
        .insert({ id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...payload });

      if (error) errors.push(`Error creando "${nombre}": ${error.message}`);
      else created++;
    }
  }

  return NextResponse.json({ ok: true, created, updated, errors });
}
