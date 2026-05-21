# Reporte de Auditoría de Código

**Proyecto**: 262 Cosas Ricas
**Fecha**: 2026-05-19
**Stack detectado**: Next.js 14.2.5, TypeScript 5, React 18, Supabase (SSR + JS 2.105.3), MercadoPago SDK 2.12.0, Resend 6.12.0, Tailwind CSS 3, Framer Motion 11, dnd-kit, xlsx 0.18.5, Vercel (deployment)
**Alcance**: `src/` completo (app router, API routes, components, lib), archivos de configuración raíz, `.env.local`
**Archivos analizados**: 52
**Líneas de código (aprox.)**: ~5 800

---

## Resumen ejecutivo

| Severidad   | Cantidad |
|-------------|----------|
| 🔴 Crítico   | 4        |
| 🟠 Alto      | 8        |
| 🟡 Medio     | 10       |
| 🔵 Bajo      | 6        |
| ⚪ Info      | 5        |
| **Total**   | **33**   |

**Top 3 riesgos**:
1. Credenciales reales de producción (Supabase service role key, Resend API key) expuestas en `.env.local` commiteado al repositorio.
2. Todas las API routes del panel `/api/admin/*` carecen de autenticación server-side: cualquiera que conozca las URLs puede leer, crear, modificar y borrar productos, pedidos y leads sin estar logueado.
3. El webhook de MercadoPago omite la verificación de firma cuando `MP_WEBHOOK_SECRET` no está configurado, permitiendo que actores externos inserten pagos aprobados falsos y modifiquen el estado de pedidos.

**Estado general**: requiere atención inmediata en los ítems de seguridad críticos; el resto del código está bien estructurado y es mantenible.

---

## Issues detectados

### #001 🔴 CRÍTICO — Credenciales de producción expuestas en `.env.local`

- **Categoría**: seguridad
- **Ubicación**: `.env.local:1-17`
- **Descripción**: El archivo `.env.local` contiene la Supabase Service Role Key, el Anon Key de Supabase y la Resend API Key con valores reales y activos. Si este archivo está (o estuvo) commiteado al repositorio Git, estas credenciales deben considerarse comprometidas. Adicionalmente, `NODE_TLS_REJECT_UNAUTHORIZED=0` deshabilita la validación TLS en el entorno de desarrollo, lo que expone la app a ataques MITM en esa máquina.
- **Impacto**: La Service Role Key de Supabase bypasea Row Level Security por completo; con ella se puede leer, modificar o borrar toda la base de datos. La Resend Key permite enviar emails ilimitados desde el dominio configurado.
- **Evidencia**:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
RESEND_API_KEY=re_EVhUpdCa_...
NODE_TLS_REJECT_UNAUTHORIZED=0
```
- **Solución propuesta**: 1) Rotar inmediatamente las tres credenciales desde los paneles de Supabase y Resend. 2) Agregar `.env.local` al `.gitignore` (si no está ya). 3) Verificar el historial de Git con `git log --all --full-history -- .env.local` y, si apareció en algún commit, reescribir la historia o crear un nuevo repositorio limpio. 4) Eliminar `NODE_TLS_REJECT_UNAUTHORIZED=0`.
- **Esfuerzo estimado**: bajo (rotar keys es trivial; limpiar historial Git es medio)
- **Referencias**: CWE-312, OWASP A02:2021

---

### #002 🔴 CRÍTICO — API routes admin sin autenticación server-side

- **Categoría**: seguridad
- **Ubicación**: `src/app/api/admin/products/route.ts:4`, `src/app/api/admin/products/[id]/route.ts:4`, `src/app/api/admin/orders/route.ts:6`, `src/app/api/admin/orders/[id]/route.ts:6`, `src/app/api/admin/categories/route.ts:6`, `src/app/api/admin/leads/route.ts:11`, `src/app/api/admin/combos/route.ts:7`, `src/app/api/admin/tags/route.ts:11`, `src/app/api/admin/upload/route.ts:4`, `src/app/api/admin/products/import/route.ts:7`, `src/app/api/admin/products/export/route.ts:7`, `src/app/api/admin/products/reorder/route.ts:4`, `src/app/api/admin/dashboard/route.ts:27`
- **Descripción**: Ninguna de las rutas bajo `/api/admin/*` verifica si el request proviene de un usuario autenticado y con el rol de administrador. El middleware de Next.js sólo protege las páginas del panel (`/admin/:path*`), pero las API routes son endpoints HTTP independientes que no pasan por ese matcher.
- **Impacto**: Cualquier persona con conocimiento de las URLs puede: listar todos los pedidos y leads (PII de clientes), crear/eliminar productos, subir archivos arbitrarios a Supabase Storage, exportar toda la base de productos.
- **Solución propuesta**: Crear un helper `requireAdmin(req)` que verifique la sesión con `createServerClient` de `@supabase/ssr` y compruebe que `user.email === process.env.ADMIN_EMAIL`. Llamarlo al inicio de cada handler:
```typescript
// lib/require-admin.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<{ error: NextResponse } | { error: null }> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { error: null };
}
```
- **Esfuerzo estimado**: medio
- **Referencias**: CWE-862, OWASP A01:2021

---

### #003 🔴 CRÍTICO — Webhook MercadoPago sin verificación de firma cuando el secret no está configurado

- **Categoría**: seguridad
- **Ubicación**: `src/app/api/checkout/webhook/route.ts:6-9`
- **Descripción**: La función `verifySignature` retorna `true` cuando `MP_WEBHOOK_SECRET` no está configurado. Esto permite que cualquier agente externo envíe un POST al endpoint con `type: "payment"` y un `data.id` de pago real, haciendo que el sistema consulte ese pago a MercadoPago y, si está aprobado, actualice el estado del pedido a "pagado".
- **Evidencia**:
```typescript
function verifySignature(req: NextRequest, body: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // ← bypass total de verificación
```
- **Solución propuesta**:
```typescript
if (!secret) {
  console.warn("MP_WEBHOOK_SECRET no configurado: rechazando webhook");
  return false;
}
```
- **Esfuerzo estimado**: trivial
- **Referencias**: CWE-345, OWASP A07:2021

---

### #004 🔴 CRÍTICO — Librería `xlsx` 0.18.5 con vulnerabilidades conocidas

- **Categoría**: dependencias / seguridad
- **Ubicación**: `package.json:29`
- **Descripción**: `xlsx` versión `0.18.5` tiene múltiples CVEs documentados incluyendo prototype pollution y ReDoS cuando se parsean archivos no confiables. El endpoint `/api/admin/products/import` recibe archivos `.xlsx` y los parsea directamente sin validación previa.
- **Evidencia**:
```typescript
// src/app/api/admin/products/import/route.ts:14
const wb = XLSX.read(arrayBuffer, { type: "array" });
```
- **Solución propuesta**:
```typescript
if (file.size > 5 * 1024 * 1024) {
  return NextResponse.json({ error: "Archivo demasiado grande (máx. 5 MB)" }, { status: 413 });
}
const validTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
if (!validTypes.includes(file.type)) {
  return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
}
```
- **Esfuerzo estimado**: medio
- **Referencias**: CVE-2023-30533, OWASP A06:2021

---

### #005 🟠 ALTO — Email del administrador hardcodeado en el middleware

- **Categoría**: seguridad / mantenibilidad
- **Ubicación**: `src/middleware.ts:31`
- **Descripción**: El email `"262cosasricas.web@gmail.com"` está escrito directamente en el código fuente.
- **Solución propuesta**:
```typescript
// .env.local
ADMIN_EMAIL=262cosasricas.web@gmail.com

// middleware.ts
const isAdmin = user?.email === process.env.ADMIN_EMAIL;
```
- **Esfuerzo estimado**: trivial

---

### #006 🟠 ALTO — Upload de archivos sin validación de tipo en `/api/admin/upload`

- **Categoría**: seguridad
- **Ubicación**: `src/app/api/admin/upload/route.ts:12-23`
- **Descripción**: El endpoint sólo toma la extensión del nombre de archivo provisto por el cliente sin validar el `Content-Type` real ni la firma mágica del archivo.
- **Solución propuesta**:
```typescript
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
if (!ALLOWED_TYPES.includes(file.type)) {
  return NextResponse.json({ error: "Tipo de imagen no permitido" }, { status: 400 });
}
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
};
const ext = EXT_MAP[file.type] ?? "jpg";
const MAX_SIZE = 10 * 1024 * 1024;
if (file.size > MAX_SIZE) {
  return NextResponse.json({ error: "Imagen demasiado grande" }, { status: 413 });
}
```
- **Esfuerzo estimado**: trivial
- **Referencias**: CWE-434, OWASP A03:2021

---

### #007 🟠 ALTO — XSS potencial en el cuerpo HTML del email de contacto

- **Categoría**: seguridad
- **Ubicación**: `src/app/api/contact/route.ts:65`, `src/app/api/contact/route.ts:89`
- **Descripción**: Los campos del formulario de contacto se interpolan directamente en HTML sin escapado previo.
- **Solución propuesta**:
```typescript
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
// Uso: `<td>${esc(nombre)}</td>`
```
- **Esfuerzo estimado**: trivial
- **Referencias**: CWE-79, OWASP A03:2021

---

### #008 🟠 ALTO — Falta de validación server-side del total en checkout

- **Categoría**: seguridad / corrección
- **Ubicación**: `src/app/api/orders/route.ts:11-17`, `src/app/api/checkout/create-preference/route.ts:22-25`
- **Descripción**: El `total` enviado por el cliente se usa directamente sin verificar que corresponda al precio real de los productos en la base de datos.
- **Solución propuesta**: Recalcular el total en el servidor consultando los precios reales desde Supabase antes de crear la preferencia o el pedido.
- **Esfuerzo estimado**: medio
- **Referencias**: CWE-20, OWASP A04:2021

---

### #009 🟠 ALTO — `supabaseAdmin` usado en rutas públicas (no-admin)

- **Categoría**: seguridad
- **Ubicación**: `src/app/api/products/route.ts:6-7`, `src/app/api/combos/route.ts:6-7`
- **Descripción**: Las rutas públicas usan la service role key, ignorando completamente las políticas RLS de Supabase.
- **Solución propuesta**: Usar el cliente anon para rutas de lectura pública y reservar `supabaseAdmin` para operaciones admin autenticadas.
- **Esfuerzo estimado**: bajo

---

### #010 🟠 ALTO — Race condition en generación de `order_number`

- **Categoría**: corrección / concurrencia
- **Ubicación**: `src/app/api/orders/route.ts:20-50`
- **Descripción**: El pedido se inserta sin `order_number`, luego se hace un UPDATE separado. Bajo carga, puede resultar en pedidos sin número si el UPDATE falla.
- **Solución propuesta**: Usar un trigger de Postgres que genere el `order_number` automáticamente en el INSERT:
```sql
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'CR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_order
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION set_order_number();
```
- **Esfuerzo estimado**: medio

---

### #011 🟠 ALTO — `isYesterday` calculado incorrectamente en el dashboard

- **Categoría**: corrección
- **Ubicación**: `src/app/admin/page.tsx:75`
- **Descripción**: Falla cuando el día actual es el primero del mes.
- **Evidencia**:
```typescript
const isYesterday = dateAr.getUTCDate() === nowAr.getUTCDate() - 1; // ← bug
```
- **Solución propuesta**:
```typescript
const oneDayMs = 24 * 60 * 60 * 1000;
const yesterdayAr = new Date(nowAr.getTime() - oneDayMs);
const isYesterday =
  dateAr.getUTCFullYear() === yesterdayAr.getUTCFullYear() &&
  dateAr.getUTCMonth() === yesterdayAr.getUTCMonth() &&
  dateAr.getUTCDate() === yesterdayAr.getUTCDate();
```
- **Esfuerzo estimado**: trivial

---

### #012 🟠 ALTO — Sin rate limiting en formularios públicos

- **Categoría**: seguridad / performance
- **Ubicación**: `src/app/api/contact/route.ts`, `src/app/api/orders/route.ts`, `src/app/api/checkout/create-preference/route.ts`
- **Descripción**: Un bot puede enviar miles de emails, crear pedidos falsos masivamente o saturar la API de MercadoPago.
- **Solución propuesta**: Usar Vercel WAF, `@vercel/edge-config` o Upstash Rate Limit.
- **Esfuerzo estimado**: medio

---

### #013 🟡 MEDIO — `supabaseAdmin` cae silenciosamente al cliente anon si no hay service key

- **Categoría**: seguridad / corrección
- **Ubicación**: `src/lib/supabase.ts:15-17`
- **Evidencia**:
```typescript
export const supabaseAdmin = service
  ? createClient(url, service, {...})
  : supabase; // ← fallback silencioso
```
- **Solución propuesta**:
```typescript
if (!service) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada");
}
```
- **Esfuerzo estimado**: trivial

---

### #014 🟡 MEDIO — `supabase` anon instanciado a nivel de módulo en rutas server-side

- **Categoría**: corrección / performance
- **Ubicación**: `src/lib/supabase.ts:11-13`
- **Descripción**: Puede provocar que cookies/sesiones de un request contaminen otro.
- **Solución propuesta**: Para rutas server-side con contexto de sesión, usar siempre `createServerClient` de `@supabase/ssr` con las cookies del request.
- **Esfuerzo estimado**: medio

---

### #015 🟡 MEDIO — `useEffect` sin `fetchProfile` en dependencias en `auth.tsx`

- **Categoría**: corrección / React
- **Ubicación**: `src/lib/auth.tsx:48-62`
- **Descripción**: `fetchProfile` está en el scope pero no en el array de dependencias del `useEffect`.
- **Solución propuesta**: Envolver `fetchProfile` en `useCallback` con dependencias adecuadas y agregarla al array del `useEffect`.
- **Esfuerzo estimado**: trivial

---

### #016 🟡 MEDIO — `handleDragEnd` usa `products` del closure (valor stale)

- **Categoría**: corrección / concurrencia
- **Ubicación**: `src/app/admin/productos/page.tsx:344-369`
- **Descripción**: `setProducts` es asíncrono; el código usa `products` (valor viejo) para calcular el orden enviado a la API.
- **Solución propuesta**:
```typescript
const reordered = arrayMove(products, oldIndex, newIndex);
setProducts(reordered);
setSavingOrder(true);
try {
  await fetch("/api/admin/products/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order: reordered.map((p) => p.id) }),
  });
} finally {
  setSavingOrder(false);
}
```
- **Esfuerzo estimado**: trivial

---

### #017 🟡 MEDIO — Reordering con N queries paralelas sin límite

- **Categoría**: performance / corrección
- **Ubicación**: `src/app/api/admin/products/reorder/route.ts:11-19`
- **Descripción**: Una query de UPDATE por producto en paralelo. Con 100 productos son 100 queries simultáneas.
- **Solución propuesta**:
```typescript
const updates = order.map((id, index) => ({ id, sort_order: index + 1 }));
const { error } = await supabaseAdmin.from("products").upsert(updates, { onConflict: "id" });
```
- **Esfuerzo estimado**: bajo

---

### #018 🟡 MEDIO — Sin validación de enum para `estado` y `pago`

- **Categoría**: corrección / seguridad
- **Ubicación**: `src/app/api/orders/route.ts:13`, `src/app/api/admin/orders/[id]/route.ts:15`
- **Solución propuesta**:
```typescript
const ESTADOS_VALIDOS = ["pendiente", "en preparación", "entregado", "cancelado"] as const;
if (!ESTADOS_VALIDOS.includes(estado)) {
  return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
}
```
- **Esfuerzo estimado**: trivial

---

### #019 🟡 MEDIO — `loadCategories` en `useEffect` sin estar en dependencias

- **Categoría**: corrección / React
- **Ubicación**: `src/app/admin/categorias/page.tsx:94`
- **Solución propuesta**: Envolver `loadCategories` en `useCallback` y agregarla al array del `useEffect`.
- **Esfuerzo estimado**: trivial

---

### #020 🟡 MEDIO — Filtro de subcategorías en la tienda no funcional (TODO pendiente)

- **Categoría**: corrección
- **Ubicación**: `src/app/tienda/viandas/[slug]/page.tsx:435-437`
- **Descripción**: Los tabs de subcategorías son clicables pero `displayProducts` siempre retorna todos los productos.
- **Solución propuesta**: Ocultar los tabs hasta implementar la funcionalidad.
- **Esfuerzo estimado**: trivial

---

### #021 🟡 MEDIO — Link de Rappi con `href="#"` en producción

- **Categoría**: corrección / UX
- **Ubicación**: `src/app/tienda/viandas/[slug]/page.tsx:599-608`
- **Descripción**: Botón que parece funcional pero no lleva a ningún lado.
- **Solución propuesta**: Cambiar a `<button disabled>` hasta tener el link real.
- **Esfuerzo estimado**: trivial

---

### #022 🟡 MEDIO — `getSession()` en lugar de `getUser()` en auth.tsx

- **Categoría**: seguridad
- **Ubicación**: `src/lib/auth.tsx:49`
- **Descripción**: `getSession()` retorna datos del JWT sin verificarlos contra el servidor.
- **Solución propuesta**:
```typescript
supabase.auth.getUser().then(({ data: { user } }) => {
  setUser(user ?? null);
  if (user) fetchProfile(user.id);
  setLoadingAuth(false);
});
```
- **Esfuerzo estimado**: trivial

---

### #023 🟡 MEDIO — Sin paginación en la lista de pedidos

- **Categoría**: performance
- **Ubicación**: `src/app/api/admin/orders/route.ts:6-13`
- **Descripción**: Selecciona todos los registros sin límite.
- **Solución propuesta**: Agregar `.range(offset, offset + limit - 1)` con parámetros `?page=N&limit=50`.
- **Esfuerzo estimado**: medio

---

### #024 🟡 MEDIO — `combo_selection_*` en localStorage crece indefinidamente

- **Categoría**: recursos
- **Ubicación**: `src/app/tienda/combo-viandas/page.tsx:127-129`
- **Solución propuesta**:
```typescript
Object.keys(localStorage).forEach((key) => {
  if (key.startsWith("combo_selection_")) localStorage.removeItem(key);
});
```
- **Esfuerzo estimado**: trivial

---

### #025 🔵 BAJO — Instanciación duplicada de Supabase client en rutas API

- **Categoría**: mantenibilidad
- **Ubicación**: `src/app/api/admin/tags/route.ts`, `src/app/api/admin/leads/route.ts`, `src/app/api/contact/route.ts`
- **Solución propuesta**: Importar `supabaseAdmin` desde `@/lib/supabase`.
- **Esfuerzo estimado**: trivial

---

### #026 🔵 BAJO — Validación de `codigoPostal` con lógica frágil

- **Categoría**: corrección
- **Ubicación**: `src/app/checkout/page.tsx:103-105`
- **Esfuerzo estimado**: trivial

---

### #027 🔵 BAJO — `imageAlt` sin fallback al nombre del producto

- **Categoría**: accesibilidad
- **Ubicación**: `src/app/api/admin/products/route.ts:18`
- **Solución propuesta**: `image_alt: body.imageAlt || body.name`
- **Esfuerzo estimado**: trivial
- **Referencias**: WCAG 2.1 criterio 1.1.1

---

### #028 🔵 BAJO — `openGraph` sin imagen configurada

- **Categoría**: SEO
- **Ubicación**: `src/app/layout.tsx:23-28`
- **Solución propuesta**: Agregar `images: [{ url: "/og-image.jpg", width: 1200, height: 630 }]`.
- **Esfuerzo estimado**: bajo

---

### #029 🔵 BAJO — Elemento `{src` con nombre inválido en raíz del proyecto

- **Categoría**: corrección / entorno
- **Descripción**: Posiblemente creado por un error de interpolación de shell. Investigar y eliminar.
- **Esfuerzo estimado**: trivial

---

### #030 🔵 BAJO — Realtime del dashboard suscripto con cliente anon

- **Categoría**: seguridad
- **Ubicación**: `src/app/admin/page.tsx:119-131`
- **Esfuerzo estimado**: bajo

---

### #031 🔵 BAJO — Array `PRODUCTS` estático muerto en `data.ts`

- **Categoría**: mantenibilidad
- **Ubicación**: `src/lib/data.ts:58-198`
- **Descripción**: 12 productos de ejemplo que nunca se usan en producción.
- **Solución propuesta**: Eliminar o mover a fixtures de testing.
- **Esfuerzo estimado**: trivial

---

### #032 ⚪ INFO — Sin tests automatizados

- **Categoría**: testing
- **Descripción**: 0% de cobertura. Sin Jest, Vitest ni Playwright.
- **Recomendación**: Comenzar con tests unitarios para `isCABA()`, `verifySignature()`, `formatOrderNumber()`.
- **Esfuerzo estimado**: alto

---

### #033 ⚪ INFO — Next.js 14.2.5 no es la versión más reciente

- **Categoría**: dependencias
- **Ubicación**: `package.json:24`
- **Esfuerzo estimado**: bajo

---

### #034 ⚪ INFO — Timezone UTC-3 hardcodeada sin constante compartida

- **Categoría**: mantenibilidad
- **Ubicación**: `src/app/api/admin/dashboard/route.ts:7`, `src/app/admin/page.tsx:68`
- **Solución propuesta**: Extraer a `const ARG_OFFSET_MS = -3 * 60 * 60 * 1000` en utils compartido.
- **Esfuerzo estimado**: trivial

---

### #035 ⚪ INFO — Sin Content Security Policy en `next.config.js`

- **Categoría**: seguridad
- **Esfuerzo estimado**: medio

---

## Lo que está bien

- Arquitectura Next.js App Router correctamente aplicada con separación clara entre server/client components y API routes
- Contexto del carrito (`cart.tsx`) con `useCallback` en todos los handlers, persistencia en localStorage y manejo de combos independiente
- Flujo del webhook de MercadoPago con estructura correcta (leer body como texto, responder 200 siempre)
- Middleware de Next.js protege correctamente las páginas del panel admin (`/admin/:path*`)
- Drag-and-drop para reordenar productos bien integrado con `dnd-kit`
- Layout responsivo del panel admin con sidebar colapsable en mobile bien implementado
- Timezone de Argentina correctamente implementada (UTC-3 es correcto para el país)

---

## Plan de remediación recomendado

1. **Inmediato (esta semana)**: #001, #002, #003, #006
2. **Corto plazo (este sprint)**: #004, #007, #008, #009, #013, #016, #020, #021
3. **Mediano plazo**: #005, #010, #011, #012, #017, #018, #022, #023, #024, #025, #035
4. **Backlog**: #014, #015, #019, #026, #027, #028, #029, #030, #031, #032, #033, #034

---

## Prompt accionable para aplicar correcciones

Copiá el bloque siguiente y pegalo en una **nueva sesión** de Claude Code en la raíz del proyecto:

```
Actuá como ingeniero senior aplicando correcciones derivadas de una
auditoría previa. Trabajás sobre este mismo repositorio.

REGLAS DE TRABAJO:
1. Resolvé los issues en el orden estricto: primero todos los CRITICO,
   después ALTO, después MEDIO, después BAJO, y al final INFO.
   Dentro de cada severidad, agrupá por archivo para minimizar context
   switching.
2. Antes de cada cambio, mostrame:
   - ID del issue (ej. #007)
   - Archivo y líneas afectadas
   - Diff propuesto (formato unified diff)
   - Justificación en 1-2 líneas
3. Pedime confirmación explícita ("aplicar / siguiente / saltar / detener")
   antes de modificar cualquier archivo.
4. Después de aplicar cada grupo de cambios por archivo:
   - Corré el linter con: npm run lint
   - Reportá resultados antes de seguir.
5. Si una corrección rompe el build, detenete y consultame.
6. Nunca cambies dependencias mayores ni hagas refactors fuera del scope
   del issue sin pedir permiso.
7. Para el issue #001 (credenciales expuestas): NO modifiques .env.local
   directamente. Solo recordame que debo rotar las keys manualmente en los
   paneles de Supabase y Resend ANTES de aplicar cualquier otra corrección.

LISTA DE ISSUES A APLICAR (en orden de prioridad):

CRITICO:
#001 - Credenciales expuestas en .env.local (acción manual requerida primero)
#002 - Crear helper requireAdmin() y aplicarlo en TODAS las rutas /api/admin/*
#003 - Webhook MP: rechazar cuando MP_WEBHOOK_SECRET no está configurado
#004 - xlsx import: validar MIME type y tamaño antes de parsear

ALTO:
#005 - Mover ADMIN_EMAIL a variable de entorno
#006 - Upload: validar MIME type real y tamaño máximo
#007 - Escapar HTML en cuerpo del email de contacto
#008 - Validar total en servidor antes de crear pedido/preferencia
#009 - Usar cliente anon (no supabaseAdmin) en rutas públicas de lectura
#010 - Migrar generación de order_number a trigger de Postgres
#011 - Corregir bug isYesterday en dashboard
#012 - Agregar rate limiting básico en endpoints públicos

MEDIO:
#013 - supabase.ts: fallar explícitamente si no hay service key
#016 - handleDragEnd: calcular reordered antes de setProducts
#017 - Reorder: usar upsert en lugar de N queries paralelas
#018 - Validar estados/pago contra allowlist en API
#020 - Ocultar tabs de subcategorías no funcionales
#021 - Reemplazar link Rappi href="#" por botón disabled
#022 - Reemplazar getSession() por getUser() en auth.tsx
#023 - Agregar paginación a la lista de pedidos
#024 - Limpiar localStorage combo_selection_* al vaciar carrito
#025 - Deduplicar instanciación de cliente Supabase en rutas API

BAJO:
#026 - Refactorizar condición de validación de CP en checkout
#027 - Fallback imageAlt al nombre del producto si está vacío
#028 - Agregar images al bloque openGraph en metadata
#031 - Eliminar array PRODUCTS estático muerto en data.ts

INFO:
#034 - Extraer constante ARG_OFFSET_MS a utils compartido

ENTREGABLES AL FINAL:
- Resumen de issues resueltos vs. pospuestos
- Lista de archivos modificados
- Resultado final del linter (npm run lint)
- Sugerencias de commits atómicos en formato Conventional Commits

Empezá recordándome la acción manual del #001 y esperá mi confirmación
antes de tocar código.
```
