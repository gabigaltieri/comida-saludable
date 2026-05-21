================================================================================
PROGRESO DE AUDITORÍA Y CORRECCIONES — 262 COSAS RICAS
Fecha: 2026-05-20
================================================================================

CONTEXTO
--------
Se realizaron dos rondas de trabajo sobre este proyecto:
1. Auditoría completa (29 issues detectados, 4 críticos, 7 altos, 8 medios, 6 bajos)
2. Revisión del informe de correcciones previo (INFORME_AUDITORIA.md)
3. Aplicación de correcciones urgentes y de alta prioridad

Stack: Next.js 14 App Router, Supabase, MercadoPago, TypeScript, Tailwind CSS


================================================================================
CORRECCIONES YA APLICADAS
================================================================================

--- URGENTES ---

[OK] Webhook MercadoPago — timing attack en comparación HMAC
     Archivo: src/app/api/checkout/webhook/route.ts
     - Reemplazado `expected === v1` por `crypto.timingSafeEqual()`
     - Agregada validación de timestamp: rechaza webhooks con más de 5 min de antigüedad

[OK] ADMIN_EMAIL — placeholder agregado en .env.local
     Archivo: .env.local
     - Agregada la línea `ADMIN_EMAIL=` con comentario explicativo
     *** ACCIÓN REQUERIDA: completar con el email de la cuenta admin en Supabase ***
     *** También agregar en Vercel → Settings → Environment Variables ***

[OK] Rate limiter — documentada limitación serverless
     Archivo: src/lib/rateLimit.ts
     - Comentario de advertencia: el Map en memoria es inefectivo en Vercel serverless
     - Recomendación para migrar a Upstash Redis cuando sea necesario

--- ALTA PRIORIDAD ---

[OK] xlsx reemplazado por exceljs (CVEs: CVE-2023-30533, CVE-2024-22363)
     Archivos:
       - src/app/api/admin/products/import/route.ts (reescrito con API de exceljs)
       - src/app/api/admin/products/export/route.ts (reescrito con API de exceljs)
     - xlsx ^0.18.5 eliminado del package.json
     - exceljs ^4.4.0 instalado

[OK] Next.js actualizado de 14.2.5 a 14.2.35
     - next: ^14.2.35
     - eslint-config-next: ^14.2.35
     - Cubre CVE-2024-34351 y CVE-2024-46982


================================================================================
PENDIENTES — ACCIÓN MANUAL REQUERIDA
================================================================================

[!!] CRÍTICO — Completar ADMIN_EMAIL
     En .env.local:    ADMIN_EMAIL=tu-email-admin@dominio.com
     En Vercel:        Settings → Environment Variables → ADMIN_EMAIL

[!!] CRÍTICO — Rotar credenciales de Supabase y Resend
     Las claves en .env.local son credenciales reales de producción.
     Rotar desde los paneles:
       - Supabase: Project Settings → API → Service Role Key
       - Resend: API Keys → revocar re_EVhUpdCa_...
     Actualizar .env.local y Vercel con los nuevos valores.
     Investigar historial Git: git log --all --full-history -- ".env.local"

[!!] Eliminar NODE_TLS_REJECT_UNAUTHORIZED=0 en producción
     Solo sirve como workaround de desarrollo local en Windows.
     En Vercel NO debe estar presente.

[  ] Trigger Postgres para order_number atómico
     Script SQL entregado en sesión anterior (ver INFORME_AUDITORIA.md).
     Aplicar en Supabase → SQL Editor.

[  ] Imagen Open Graph
     Crear /public/og-image.jpg de 1200×630px con identidad visual del proyecto.

[  ] Claves de MercadoPago
     MP_ACCESS_TOKEN, MP_PUBLIC_KEY y MP_WEBHOOK_SECRET vacíos.
     Completar cuando el cliente las provea.

[  ] Dominio personalizado
     Configurar en Vercel una vez que el cliente registre/transfiera el dominio.


================================================================================
PENDIENTES — PRÓXIMA SESIÓN DE CÓDIGO
================================================================================

PRIORIDAD MEDIA:

[ ] Rate limiter real para serverless
    Migrar src/lib/rateLimit.ts a Upstash Redis (@upstash/ratelimit)
    Afecta: /api/orders, /api/contact, /api/checkout/create-preference

[ ] Paginación en lista de pedidos admin
    Archivo: src/app/api/admin/orders/route.ts + src/app/admin/pedidos/page.tsx
    Agregar PAGE_SIZE=20, controles Anterior/Siguiente

[ ] Manejo de errores en guardarEstado
    Archivo: src/app/admin/pedidos/page.tsx (función guardarEstado ~línea 56)
    Envolver en try/catch, mostrar error si la API falla

[ ] Separar clientes de Supabase
    src/lib/supabase.ts actualmente lanza excepción si SERVICE_ROLE_KEY no está.
    Separar en supabase-public.ts (anon) y supabase-admin.ts (service role).

[ ] Validación de entrada en /api/orders
    Archivo: src/app/api/orders/route.ts
    Verificar que `productos` sea array no vacío, precio >= 0, cantidad > 0.

[ ] Validación de longitud en formulario de contacto
    Archivo: src/app/api/contact/route.ts
    Limitar campos: nombre/empresa ≤ 100, detalle ≤ 2000, mail ≤ 200.

[ ] Restricción de remotePatterns en Next.js config
    Archivo: next.config.js
    Cambiar *.supabase.co por el hostname específico del proyecto:
    sdlgfdmhasftbelztvqb.supabase.co

PRIORIDAD BAJA:

[ ] Singleton para cliente Supabase en el browser
    Archivo: src/lib/supabase-browser.ts
    Agregar patrón singleton para evitar múltiples conexiones WebSocket.

[ ] IDs de productos con randomUUID()
    Archivo: src/app/api/admin/products/route.ts (línea ~10)
    Reemplazar `p-${Date.now()}` por `p-${randomUUID()}`

[ ] Formularios de contacto duplicados
    Archivo: src/app/tienda/viandas/[slug]/page.tsx
    ContactFormEmpresas y ContactFormCatering son ~150 líneas cada uno.
    Refactorizar en un componente genérico ContactForm.

[ ] Agregar tests
    0% de cobertura actual. Empezar con:
    - vitest para endpoints críticos (auth, checkout, webhook)
    - Playwright para flujo de checkout e2e


================================================================================
NOTAS TÉCNICAS IMPORTANTES
================================================================================

- SSL en Windows: npm requiere `--strict-ssl false` para instalar paquetes en este equipo.
  Usar: npm install <paquete> --strict-ssl false

- El issue #031 del informe anterior (array PRODUCTS en data.ts) fue marcado como
  falso positivo: MenuSection.tsx lo usa activamente en la homepage.

- El rate limiter en src/lib/rateLimit.ts existe en el código pero NO protege en Vercel.
  No confiar en él como barrera de seguridad real hasta migrar a Upstash.

- exceljs v4 incluye sus propios tipos TypeScript. No instalar @types/exceljs.
  Al llamar a wb.xlsx.load(), pasar arrayBuffer directamente (no Buffer.from()).

================================================================================
