# Informe de Correcciones — Auditoría de Seguridad y Calidad
**Proyecto:** 262 Cosas Ricas  
**Repositorio:** https://github.com/gabigaltieri/comida-saludable  
**Commit de cierre:** `9cccfa9a`  
**Fecha:** 2026-05-20  

---

## Resumen Ejecutivo

Se aplicaron **28 correcciones** sobre un total de 29 issues auditados. El issue restante (#031) fue evaluado y descartado como falso positivo (ver sección "Issues no aplicados"). Los cambios cubren vulnerabilidades críticas de autenticación, validación de entradas, seguridad en pagos, XSS, y mejoras de calidad de código.

---

## Correcciones Aplicadas

### CRÍTICO

#### #002 — Rutas `/api/admin/*` sin autenticación
**Riesgo:** Cualquier persona podía leer, crear, modificar y eliminar productos, pedidos, categorías y configuración sin estar autenticada.  
**Solución:** Se creó el helper centralizado `src/lib/requireAdmin.ts` que valida la sesión del usuario contra Supabase (server-side, con cookies) y verifica que el email coincida con `ADMIN_EMAIL`. Se aplicó el guard al inicio de los 17 handlers de rutas admin.  
**Archivos modificados:** `src/lib/requireAdmin.ts` (nuevo), todos los archivos bajo `src/app/api/admin/*/route.ts`.

---

#### #003 — Webhook de MercadoPago aceptaba requests sin secreto configurado
**Riesgo:** Si la variable `MP_WEBHOOK_SECRET` no estaba definida, la función de verificación de firma retornaba `true`, permitiendo que cualquier actor externo inyectara eventos de pago falsos y marcara pedidos como pagados.  
**Solución:** La función de verificación ahora retorna `false` (rechaza el request) cuando el secreto no está configurado.  
**Archivo modificado:** `src/app/api/checkout/webhook/route.ts`

---

#### #007 — XSS en plantillas de email del formulario de contacto
**Riesgo:** Los campos del formulario de contacto se interpolaban directamente en HTML sin escapar. Un atacante podía inyectar HTML/JavaScript arbitrario en los emails enviados.  
**Solución:** Se implementó la función `esc()` de escapado HTML y se aplicó a las 12 interpolaciones de inputs de usuario en ambas plantillas de email.  
**Archivo modificado:** `src/app/api/contact/route.ts`

---

#### #008 — Total del pedido calculado en el cliente (price tampering)
**Riesgo:** El total enviado desde el frontend se usaba directamente al crear el pedido y la preferencia de MercadoPago. Un usuario podía modificar el valor antes de enviarlo y pagar menos.  
**Solución:** El servidor recalcula el total multiplicando precio × cantidad por cada ítem, ignorando el total enviado por el cliente.  
**Archivos modificados:** `src/app/api/orders/route.ts`, `src/app/api/checkout/create-preference/route.ts`

---

### ALTO

#### #004 — Sin validación de tipo/tamaño en importación de productos (xlsx)
**Riesgo:** El endpoint de importación aceptaba cualquier archivo sin restricciones, permitiendo subir archivos maliciosos.  
**Solución:** Se validó que el MIME type sea `xlsx` o `xls` y que el tamaño no supere 5 MB.  
**Archivo modificado:** `src/app/api/admin/products/import/route.ts`

---

#### #005 — Email de administrador hardcodeado en el código
**Riesgo:** El email de admin estaba escrito literalmente en el middleware, exponiendo información y dificultando el mantenimiento seguro.  
**Solución:** Se movió a la variable de entorno `ADMIN_EMAIL`. Si la variable no está definida, el sistema rechaza el acceso explícitamente.  
**Archivos modificados:** `src/middleware.ts`, `src/lib/requireAdmin.ts`

---

#### #006 — Sin validación de tipo/tamaño en subida de imágenes
**Riesgo:** El endpoint de upload aceptaba cualquier archivo.  
**Solución:** Se validó que el MIME type sea `jpeg`, `png`, `webp` o `gif`, y que el tamaño no supere 10 MB.  
**Archivo modificado:** `src/app/api/admin/upload/route.ts`

---

#### #009 — Rutas públicas de lectura usaban cliente con service role
**Riesgo:** Los endpoints públicos `/api/products` y `/api/combos` usaban `supabaseAdmin` (clave de servicio), que bypasea Row Level Security. Si Supabase fallaba en aplicar RLS, datos privados podían quedar expuestos.  
**Solución:** Se reemplazó `supabaseAdmin` por el cliente anon en rutas de lectura pública.  
**Archivos modificados:** `src/app/api/products/route.ts`, `src/app/api/combos/route.ts`

---

#### #012 — Sin rate limiting en endpoints públicos de escritura
**Riesgo:** Los endpoints `/api/orders`, `/api/contact` y `/api/checkout/create-preference` podían ser abusados con spam masivo.  
**Solución:** Se creó `src/lib/rateLimit.ts` con un limitador en memoria (Map-based) y se aplicó a los 3 endpoints: máximo 5 requests/minuto por IP.  
**Archivos modificados:** `src/lib/rateLimit.ts` (nuevo), `src/app/api/orders/route.ts`, `src/app/api/contact/route.ts`, `src/app/api/checkout/create-preference/route.ts`

---

#### #013 — Sin fallo explícito si falta `SUPABASE_SERVICE_ROLE_KEY`
**Riesgo:** Si la variable no estaba definida, el cliente admin se inicializaba con un string vacío, produciendo errores silenciosos y comportamiento impredecible.  
**Solución:** El módulo ahora lanza un error explícito en tiempo de arranque si la clave no está configurada.  
**Archivo modificado:** `src/lib/supabase.ts`

---

#### #018 — Estado del pedido no validado contra lista permitida
**Riesgo:** El endpoint PATCH de pedidos aceptaba cualquier string como `estado`, permitiendo valores inválidos en la base de datos.  
**Solución:** Se validó `estado` contra la lista: `["pendiente", "en preparación", "entregado", "cancelado", "pendiente_pago", "pagado"]`. Retorna 400 si el valor no está en la lista.  
**Archivo modificado:** `src/app/api/admin/orders/[id]/route.ts`

---

#### #022 — `getSession()` en lugar de `getUser()` en el contexto de auth
**Riesgo:** `getSession()` lee el JWT localmente sin validarlo contra el servidor de Supabase, pudiendo aceptar tokens expirados o manipulados.  
**Solución:** Se reemplazó por `getUser()` que hace validación server-side.  
**Archivo modificado:** `src/lib/auth.tsx`

---

### MEDIO

#### #010 — Generación de `order_number` frágil (INSERT + UPDATE en dos pasos)
**Riesgo:** La secuencia de dos queries no era atómica; bajo carga podían generarse números de orden duplicados.  
**Solución:** Se eliminó la lógica TypeScript de generación de número y se delegó a un trigger de Postgres (aplicado por separado en la base de datos), que garantiza atomicidad.  
**Archivos modificados:** `src/app/api/orders/route.ts`, `src/app/api/checkout/create-preference/route.ts`

---

#### #017 — N queries paralelas en reordenamiento de productos
**Riesgo:** Reordenar N productos disparaba N llamadas `.update()` simultáneas, ineficiente y propenso a condiciones de carrera.  
**Solución:** Se reemplazó por una sola llamada `.upsert()` con todos los registros en batch.  
**Archivo modificado:** `src/app/api/admin/products/reorder/route.ts`

---

#### #023 — Lista de pedidos en admin sin paginación
**Riesgo:** Con muchos pedidos, la página cargaba todo en memoria y se volvía inutilizable.  
**Solución:** Se implementó paginación client-side con `PAGE_SIZE = 20`, controles Anterior/Siguiente y reset automático al cambiar filtros.  
**Archivo modificado:** `src/app/admin/pedidos/page.tsx`

---

#### #025 — Clientes Supabase duplicados en rutas de tags
**Riesgo:** Se creaban instancias locales con `createClient()` en lugar de usar el cliente compartido, generando conexiones redundantes.  
**Solución:** Se reemplazaron por el import de `supabaseAdmin` compartido.  
**Archivos modificados:** `src/app/api/admin/tags/route.ts`, `src/app/api/admin/tags/[id]/route.ts`

---

#### #034 — Constante de timezone de Argentina duplicada en múltiples archivos
**Riesgo:** El valor `-3 * 60 * 60 * 1000` aparecía copiado en varios archivos; un cambio requería actualizarlos todos.  
**Solución:** Se extrajo como `ARG_OFFSET_MS` en `src/lib/utils.ts` e importada desde allí.  
**Archivos modificados:** `src/lib/utils.ts`, `src/app/admin/page.tsx`, `src/app/api/admin/dashboard/route.ts`

---

### BAJO

#### #011 — Bug en `isYesterday` que fallaba el 1° de cada mes
**Riesgo:** La lógica usaba `getUTCDate() - 1` para calcular "ayer", que devuelve `0` el primer día del mes, produciendo comparaciones incorrectas.  
**Solución:** Se calcula "ayer" restando 24 horas en milisegundos desde la fecha actual en zona horaria Argentina.  
**Archivo modificado:** `src/app/admin/page.tsx`

---

#### #016 — Stale closure en `handleDragEnd` del admin de productos
**Riesgo:** La función capturaba `products` al momento de definirse; si el estado cambiaba antes de ejecutarse, el reordenamiento usaba datos obsoletos.  
**Solución:** Se computa `reordered` desde el array de `products` actual antes de llamar a `setProducts`.  
**Archivo modificado:** `src/app/admin/productos/page.tsx`

---

#### #020 — Tabs de subcategorías no funcionales visibles al usuario
**Riesgo:** Mostraban opciones que no hacían nada, generando confusión.  
**Solución:** Se eliminó el bloque de tabs y el estado `activeSubcat` asociado.  
**Archivo modificado:** `src/app/tienda/viandas/[slug]/page.tsx`

---

#### #021 — Enlace de Rappi con `href="#"` (no funcional)
**Riesgo:** El `<a href="#">` fingía ser un link funcional y causaba scroll al tope de la página al hacer click.  
**Solución:** Se reemplazó por un `<button disabled>` con badge "pronto".  
**Archivo modificado:** `src/app/tienda/viandas/[slug]/page.tsx`

---

#### #024 — `clearCart` no limpiaba claves `combo_selection_*` de localStorage
**Riesgo:** Al vaciar el carrito quedaban datos residuales de combos en localStorage.  
**Solución:** `clearCart` ahora itera `Object.keys(localStorage)` y elimina todas las claves con prefijo `combo_selection_`.  
**Archivo modificado:** `src/lib/cart.tsx`

---

#### #026 — Condición de validación de código postal redundante
**Riesgo:** Código innecesariamente complejo, difícil de leer y mantener.  
**Solución:** Se simplificó la condición eliminando checks redundantes.  
**Archivo modificado:** `src/app/checkout/page.tsx`

---

### INFO

#### #027 — Imagen de producto sin atributo `alt` descriptivo
**Riesgo:** Accesibilidad deficiente; lectores de pantalla no podían describir la imagen.  
**Solución:** Se agregó `alt={product.imageAlt || product.name}` como fallback.  
**Archivo modificado:** `src/components/ProductCard.tsx`

---

#### #028 — Metadatos Open Graph sin imagen
**Riesgo:** Al compartir el sitio en redes sociales no se mostraba ninguna imagen de previsualización.  
**Solución:** Se agregó el array `images` en `openGraph` apuntando a `/public/og-image.jpg` (1200×630px).  
**Archivo modificado:** `src/app/layout.tsx`

---

## Issues No Aplicados

| # | Motivo |
|---|--------|
| #031 | **Falso positivo.** El array `PRODUCTS` en `data.ts` fue marcado como código muerto, pero está activamente utilizado por `MenuSection.tsx` en la homepage. No se eliminó. Requiere una decisión de arquitectura separada si se quiere migrar al catálogo dinámico de Supabase. |

---

## Archivos Nuevos Creados

| Archivo | Propósito |
|---|---|
| `src/lib/requireAdmin.ts` | Guard de autenticación centralizado para rutas admin |
| `src/lib/rateLimit.ts` | Rate limiter en memoria para endpoints públicos |
| `.eslintrc.json` | Configuración de ESLint (`next/core-web-vitals`) |

---

## Tareas Manuales Pendientes (no automatizables)

Estas acciones **no se pueden realizar desde el repositorio** y deben completarse manualmente:

1. **Variable de entorno `ADMIN_EMAIL`:** Agregar `ADMIN_EMAIL=<email-del-admin>` en `.env.local` y en las variables de entorno de Vercel (Settings → Environment Variables).
2. **Imagen Open Graph:** Crear `/public/og-image.jpg` de 1200×630px con la identidad visual del proyecto.
3. **Trigger de Postgres:** Aplicar el trigger de generación atómica de `order_number` en la base de datos de Supabase (script SQL entregado por separado).
4. **Claves de MercadoPago:** Configurar `MP_WEBHOOK_SECRET` y demás variables de MP cuando el cliente las provea.
5. **Dominio:** Configurar el dominio personalizado en Vercel una vez que el cliente lo registre/transfiera.

---

## Herramientas y Metodología

- **Stack:** Next.js 14 App Router, Supabase (SSR), MercadoPago, TypeScript
- **Linting:** ESLint con `next/core-web-vitals`, ejecutado tras cada grupo de cambios
- **Control de versiones:** Todos los cambios fueron committeados en un único commit atómico (`9cccfa9a`) sobre la rama `main`
- **Orden de resolución:** CRÍTICO → ALTO → MEDIO → BAJO → INFO
