# INFORME DE AUDITORÍA DE SEGURIDAD — Kitcho Menu

**Fecha:** 18/08/2026
**Auditor:** Análisis automatizado + revisión manual
**Objetos auditados:**
- https://kitcho-menu.vercel.app/
- https://kitcho-menu.vercel.app/menu/vi-cool

**Alcance:** Cabeceras HTTP, exposición de secretos, bundles JS, configuración de Supabase (RLS), XSS reflejado, clickjacking, open redirect, soft-404, políticas de contraseña, saneamiento de rutas y TLS.

---

## RESUMEN EJECUTIVO

**Veredicto general: MEDIO-RIESGO.**

La aplicación es un frontend Next.js SSR alojado en Vercel con autenticación vía Supabase (proyecto `ubnsrznxdhnkznmhmhce.supabase.co`). No hay backend propio, no hay secretos críticos expuestos, RLS está activo en Supabase, TLS es correcto (1.3) y no se detectó XSS ni exfiltración de datos. Los problemas principales son **cabeceras de seguridad ausentes** (clickjacking), **política de contraseñas débil**, **ausencia de control anti-fuerza bruta** y **soft-404**.

---

## 1. HALLAZGOS CRÍTICOS / ALTOS

### 1.1 Clickjacking habilitado (Alto)
- **Vulnerabilidad:** CWE-1021 / CWE-693
- **Detalle:** Ninguna de las páginas (`/`, `/login`, `/register`, `/menu/vi-cool`) envía `X-Frame-Options` ni CSP `frame-ancestors`. Todas las páginas pueden incrustarse en un `<iframe>` de un sitio malicioso.
- **Impacto:** Un atacante puede montar "loginjacking": superponer un iframe transparente del formulario `/login` sobre elementos que el usuario cree clicar, capturando credenciales del restaurante.
- **URLs afectadas:** todas.
- **Evidencia:** `X-Frame-Options: (AUSENTE)`, `Content-Security-Policy: (AUSENTE)` en `/`, `/login`, `/register`, `/menu/vi-cool`.

### 1.2 Ausencia total de Content-Security-Policy (Alto)
- **Vulnerabilidad:** CWE-693 (mitigación defensiva inexistente)
- **Detalle:** No hay CSP en ninguna respuesta. Si en el futuro se introduce una vulnerabilidad XSS (por ejemplo en el contenido del menú, que hoy es estático), el navegador no tendrá ninguna capa de contención: se podrán ejecutar scripts inline, `eval`, conexiones a dominios arbitrarios, etc.
- **Evidencia:** `Content-Security-Policy: (AUSENTE)` en las 4 URLs.

### 1.3 Sin protección contra fuerza bruta en autenticación (Alto)
- **Vulnerabilidad:** CWE-307
- **Detalle:** El formulario `/login` llama directamente a `supabase.auth.signInWithPassword()` desde el navegador (confirmado en el bundle `3_p6daybwt32c.js`). No existe rate-limiting propio, CAPTCHA, bloqueo por IP, ni 2FA. La protección queda 100% delegada a los límites por defecto de Supabase Auth (que permiten reintentos reiterados).
- **Impacto:** Fuerza bruta de contraseñas contra cuentas de restaurante.
- **Evidencia:** bundle cliente `3_p6daybwt32c.js` → `supabase.auth.signInWithPassword({email, password})`.

---

## 2. HALLAZGOS MEDIOS

### 2.1 Política de contraseñas débil (Medio)
- **Vulnerabilidad:** CWE-521
- **Detalle:** `/register` solo exige `minLength="6"`. No hay requisito de mayúsculas, números, símbolos ni longitud mínima robusta (recomendado ≥ 10-12). Tampoco hay verificación de contraseñas en listas comunes (breach check).
- **Evidencia:** `<input ... type="password" minLength="6" required />` en `/register`.

### 2.2 `Access-Control-Allow-Origin: *` en respuestas HTML (Medio)
- **Vulnerabilidad:** CWE-942 (configuración CORS excesivamente permisiva)
- **Detalle:** Las páginas `/`, `/login` y `/register` responden con `Access-Control-Allow-Origin: *` (sin `Access-Control-Allow-Credentials`, por lo que no se pueden leer respuestas autenticadas vía fetch). Es de bajo riesgo práctico hoy, pero es una configuración anómala en páginas HTML y debe corregirse a origen propio.
- **Evidencia:** Header observado en `/`, `/login`, `/register`. Curiosamente `/menu/vi-cool` NO lo incluye (inconsistencia).

### 2.3 X-Content-Type-Options ausente (Medio)
- **Vulnerabilidad:** CWE-79 / CWE-16
- **Detalle:** No se envía `X-Content-Type-Options: nosniff`. Ante cualquier subida de archivos/imágenes futura (los platos se suben como WebP embebido en base64), un navegador podría interpretar contenido como un tipo distinto (MIME sniffing).
- **Evidencia:** `X-Content-Type-Options: (AUSENTE)` en todas las URLs.

### 2.4 Referrer-Policy ausente (Medio)
- **Vulnerabilidad:** CWE-200 (fuga de información en referrer)
- **Detalle:** No hay `Referrer-Policy`. Si el menú o el login enlazan a un dominio externo (p. ej. un futuro pago o red social), el `Referer` completo —incluyendo tokens de URL en `/auth/callback` (se usa `emailRedirectTo: ${origin}/auth/callback`)— puede filtrarse al sitio externo.
- **Evidencia:** Bundle `0t2oer8_gya4r.js` confirma el flujo de callback por URL; `Referrer-Policy: (AUSENTE)`.

---

## 3. HALLAZGOS BAJOS

### 3.1 Soft-404 en rutas `/menu/*` (Bajo)
- **Detalle:** `/menu/slug-que-no-existe` devuelve **HTTP 200** con la página "Menú no encontrado" en lugar de un 404 real.
- **Impacto:** Problema de SEO (contenido duplicado/no indexable correctamente) y permite enumerar slugs de menús activos comparando respuestas.
- **Evidencia:** `GET /menu/slug-que-no-existe-xyz => 200` con `Cache-Control: private, no-cache, no-store` y **sin** `X-Robots-Tag: noindex`.

### 3.2 Divulgación de tecnología (Bajo)
- **Vulnerabilidad:** CWE-200
- **Detalle:** `/menu/vi-cool` expone `X-Powered-By: Next.js`. En `/`, `/login`, `/register` no aparece (inconsistente). 
- **Impacto:** Facilita la selección de exploits dirigidos al framework.

### 3.3 Ausencia de robots.txt, sitemap.xml y security.txt (Bajo)
- **Detalle:** `/robots.txt`, `/sitemap.xml` → 404. `/.well-known/security.txt` → 404.
- **Impacto:** SEO deficiente y no existe canal declarado de divulgación responsable de vulnerabilidades.

### 3.4 Metadatos SEO incompletos en menús (Bajo)
- **Detalle:** Los menús públicos no llevan `<link rel="canonical">`, ni meta robots, ni og:url, ni hreflang. Favicon sirve `icon.svg` como apple-touch-icon (formato incorrecto, debería ser PNG 180x180).

---

## 4. PRUEBAS REALIZADAS — RESULTADOS POSITIVOS (BIEN)

| Prueba | Resultado |
|---|---|
| Secretos en HTML / bundles JS | ✅ Ninguno. Solo anon key de Supabase (diseñada para ser pública). Sin service_role, sin API keys de terceros. |
| Supabase RLS (anon) | ✅ **Activo.** `GET /rest/v1/{restaurants,menus,users,profiles,...}` con anon key → **401**. No hay acceso a datos vía anon. |
| TLS | ✅ TLS 1.3, AES128, certificado Google Trust Services válido (28/06/2026 → 26/09/2026). |
| HSTS | ✅ `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`. |
| XSS reflejado en `/menu/[slug]` | ✅ No. El payload `" onload="alert(1)<script>...` se escapa/niega; el slug se serializa como string en el payload RSC sin ejecutarse. |
| Open redirect (`/login?next=https://evil.com`) | ✅ No. Devuelve 200 sin redirección externa. |
| Source maps (`*.js.map`) | ✅ Bloqueados (403). |
| Archivos sensibles (`.env`, `.git/config`, `package.json`, `config.json`) | ✅ 404 todos. |
| Cache de páginas dinámicas | ✅ `/menu/*` usa `Cache-Control: private, no-cache, no-store` (no cachea datos dinámicos). |
| Traversal de ruta (`/menu/../..`) | ✅ Rechazado (400). |
| Inyección SQL / APIs propias | N/A — no hay backend propio; toda la lógica va a Supabase (parametrizado por su API REST). |
| Datos de clientes | ✅ El HTML público solo contiene el menú del restaurante (público por diseño). Sin emails, teléfonos ni datos personales. |

---

## 5. RECOMENDACIONES DE CORRECCIÓN (priorizadas)

### Prioridad 1 — Critico/Altos
1. **Bloquear clickjacking**: añadir en la configuración de headers de Next.js (`next.config.ts`):
   - `X-Frame-Options: DENY`
   - `Content-Security-Policy: frame-ancestors 'none'`
2. **Definir CSP completa** (estricta, sin 'unsafe-inline' salvo lo imprescindible para Next.js; verificar con cada build):
   ```
   default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://ubnsrznxdhnkznmhmhce.supabase.co; connect-src 'self' https://ubnsrznxdhnkznmhmhce.supabase.co wss://ubnsrznxdhnkznmhmhce.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
   ```
3. **Anti fuerza bruta**: añadir rate-limiting en el flujo de login. Opciones:
   - Habilitar CAPTCHA en Supabase Auth (`security.captchaEnabled` + verificación de token) — recomendado.
   - O un Edge Middleware en Vercel que límite intentos por IP.
4. **Endurecer política de contraseñas**: mínimo 10 caracteres con mayúscula, número y símbolo (Supabase: `min_password_length` vía API de admin; validación también en el cliente).

### Prioridad 2 — Medios
5. Añadir `X-Content-Type-Options: nosniff` y `Referrer-Policy: strict-origin-when-cross-origin` en headers globales.
6. Cambiar `Access-Control-Allow-Origin: *` a `https://kitcho-menu.vercel.app` (o eliminar si no se necesita CORS) y unificar la configuración de headers entre rutas (hoy `/menu/*` no aplica los mismos headers).

### Prioridad 3 — Bajos
7. Devolver **HTTP 404 real** (o 410) para slugs de menú inexistentes, con `X-Robots-Tag: noindex` en la página "no encontrado".
8. Eliminar `X-Powered-By: Next.js` (en `next.config.ts`: `poweredByHeader: false`).
9. Crear `/robots.txt`, `/sitemap.xml` y `/.well-known/security.txt`.
10. Añadir `<link rel="canonical">` y meta `robots` en los menús públicos; usar PNG para apple-touch-icon.

---

## 6. CONFIGURACIÓN SUGERIDA (next.config.ts)

```ts
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "<CSP DEFINIDA ARRIBA>" },
        ],
      },
    ];
  },
};
```

---

## 7. NOTAS ADICIONALES PARA EL EQUIPO

- **Slugs como único control de acceso:** el contenido del menú es público por diseño (es el modelo de negocio), pero cualquier persona puede enumerar `/menu/*`. No colocar jamás información sensible (p. ej. costes internos, datos de clientes) en estas páginas o en el HTML prerenderizado.
- **El HTML del menú embebe el contenido completo del restaurante en base64** (logos e imágenes). Con el tiempo esto aumenta el peso de la página (401 KB hoy). No es un fallo de seguridad pero sí de rendimiento/privacidad (los datos viajan en el HTML servido).
- **Recomendación:** revisar en Supabase que las únicas políticas de lectura pública sean las estrictamente necesarias para el renderizado SSR (idealmente el SSR usa `service_role` en el servidor y anon queda sin permisos, como se verificó: 401).
