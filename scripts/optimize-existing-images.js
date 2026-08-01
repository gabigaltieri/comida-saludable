// Backfill: recomprime a WebP + redimensiona todas las imagenes YA subidas
// al bucket "product-images" de Supabase Storage. Mantiene el mismo path
// (misma URL publica) asi que no hace falta tocar la base de datos.
//
// Requiere que la cuota de Supabase este disponible (no sirve mientras el
// proyecto este restringido por exceed_cached_egress_quota).
//
// Uso: node --env-file=.env.local scripts/optimize-existing-images.js

const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");

const BUCKET = "product-images";
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 82;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function listAllFiles() {
  const files = [];
  const limit = 100;
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list("", { limit, offset });
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const f of data) {
      if (f.name && f.id) files.push(f.name); // f.id null => "carpeta", la ignoramos
    }
    if (data.length < limit) break;
    offset += limit;
  }
  return files;
}

async function run() {
  console.log(`Listando archivos del bucket "${BUCKET}"...`);
  const files = await listAllFiles();
  console.log(`Encontrados ${files.length} archivos.`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;

  for (const name of files) {
    if (name.toLowerCase().endsWith(".gif")) {
      skipped++;
      continue;
    }

    try {
      const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(name);
      if (downloadError) throw downloadError;

      const original = Buffer.from(await blob.arrayBuffer());
      const optimized = await sharp(original)
        .rotate()
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      // No reemplaza si la version "optimizada" termina siendo mas pesada
      // (puede pasar con imagenes ya chicas/comprimidas).
      if (optimized.length >= original.length) {
        skipped++;
        continue;
      }

      const { error: updateError } = await supabase.storage.from(BUCKET).update(name, optimized, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });
      if (updateError) throw updateError;

      bytesBefore += original.length;
      bytesAfter += optimized.length;
      processed++;
      console.log(
        `OK  ${name}: ${(original.length / 1024).toFixed(0)}KB -> ${(optimized.length / 1024).toFixed(0)}KB`
      );
    } catch (err) {
      failed++;
      console.error(`FAIL ${name}:`, err.message ?? err);
    }
  }

  console.log("\n--- Resumen ---");
  console.log(`Procesadas: ${processed}`);
  console.log(`Omitidas (gif o ya optimas): ${skipped}`);
  console.log(`Fallidas: ${failed}`);
  if (processed > 0) {
    console.log(
      `Peso: ${(bytesBefore / 1024 / 1024).toFixed(2)}MB -> ${(bytesAfter / 1024 / 1024).toFixed(2)}MB ` +
        `(${(100 - (bytesAfter / bytesBefore) * 100).toFixed(0)}% menos)`
    );
  }
}

run().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
