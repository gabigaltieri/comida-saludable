import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB

  if (!ALLOWED_IMAGE_MIME.includes(file.type)) {
    return NextResponse.json({ error: "Solo se aceptan imágenes JPEG, PNG, WebP o GIF." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "La imagen no puede superar 15 MB." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);
  let contentType = file.type;
  let ext = file.name.split(".").pop() ?? "jpg";

  // GIF se sube tal cual para no romper la animación; el resto se recomprime a WebP
  if (file.type !== "image/gif") {
    buffer = await sharp(buffer)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    contentType = "image/webp";
    ext = "webp";
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from("product-images")
    .upload(filename, buffer, {
      contentType,
      upsert: false,
      cacheControl: "31536000",
    });

  if (error) {
    console.error("Storage error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("product-images")
    .getPublicUrl(filename);

  return NextResponse.json({ url: urlData.publicUrl });
}
