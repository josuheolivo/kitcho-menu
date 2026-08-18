# INFORME DE AUDITORÍA SEO + DISEÑO + UX — Kitcho Menu

**Fecha:** 18/08/2026
**Auditor:** Análisis técnico automatizado + revisión manual de código fuente
**Páginas auditadas:**
- https://kitcho-menu.vercel.app/ (Landing)
- https://kitcho-menu.vercel.app/menu/vi-cool (Menú público del restaurante "Vi Cool")
- https://kitcho-menu.vercel.app/login y /register (Auth)
- CSS de diseño global (`/_next/static/immutable/chunks/3ovhvpfx8omtv.css`, 78 KB)

**Método:** Revisión de HTML prerenderizado SSR, payload RSC, bundles JS (658 KB), CSS del sistema de diseño, cálculo WCAG de contraste, verificación de headers, robótica (robots/sitemap) y enlaces.

---

## RESUMEN EJECUTIVO

**Veredicto general: NOTABLE en copywriting y microinteracciones, pero DÉBIL en SEO técnico y con bugs de diseño visibles.**

La **landing** tiene un copy humanizado excelente y CTAs consistentes, pero **cero SEO social y cero datos estructurados**, tipografía declarada que **nunca se carga**, y botones primarios con **contraste insuficiente** (blanco sobre naranja = 3.56:1, falla WCAG AA). El **menú público** (la página que ven los clientes de restaurantes, el producto) tiene **bugs graves**: corrupción de caracteres (mojibake), **ningún H1**, jerarquía de encabezados invertida, imagen social embebida en base64 (no se muestra en WhatsApp/Facebook), **choque de marca** (verde del restaurante sobre sistema naranja de Kitcho) y **descripciones de platos vacías** en el 80% de los ítems.

---

## 1. SEO GENERAL

### 1.1 SEO On-Page — Landing (`/`)

| Elemento | Estado | Detalle |
|---|---|---|
| `<title>` | ⚠️ Presente, corto | "Kitcho Menu — Menú Digital para Restaurantes" (42 chars, OK) |
| `<meta description>` | ✅ OK | 91 chars, sin keyword stuffing |
| `<h1>` | ✅ | "La carta digital que vende por ti." (único, correcto) |
| `<h2>`/`<h3>` | ⚠️ | 3 h2 + 8 h3, jerarquía correcta |
| `<link canonical>` | ❌ AUSENTE | Riesgo de contenido duplicado |
| OG / Twitter Cards | ❌ **AUSENTES al 100%** | 0 metas og:, 0 twitter: → no se previsualiza en WhatsApp/Facebook/X |
| JSON-LD / schema.org | ❌ AUSENTE | Sin datos estructurados (ni Product, ni SoftwareApplication, ni Organization) |
| hreflang / robots | ❌ AUSENTES | Sin meta robots, sin hreflang |
| theme-color / manifest | ❌ AUSENTES | Sin color de barra en móvil, sin PWA manifest |
| Alt en imágenes | ✅ | Sin `<img>` en landing (todo SVG/CSS) |

### 1.2 SEO On-Page — Menú público (`/menu/vi-cool`)

| Elemento | Estado | Detalle |
|---|---|---|
| `<title>` | ❌ **CORRUPTO** | `Vi Cool â€" Menú Digital` (mojibake; la "—" y la "ú" están doble codificadas) |
| `<meta description>` | ⚠️ | OK en si, pero es **plantilla genérica** ("Consulta la carta y platos de Vi Cool online en Kitcho Menu.") — será idéntica para todos los restaurantes → **contenido duplicado masivo** entre miles de menús |
| `<h1>` | ❌ **NO EXISTE** | El nombre del restaurante es una `<img alt="Vi Cool">`. Cero H1 en toda la página. |
| Jerarquía H | ❌ **INVERTIDA** | El primer encabezado es un **H3** ("Plato Destacado"); el único **H2** aparece después. Google no entiende la estructura. |
| OG / Twitter | ⚠️ | Presentes pero **og:image y twitter:image son `data:image/png;base64,...`** (9.798 chars) → **no se renderizan** en WhatsApp/Facebook/X (solo URLs funcionan) |
| og:url / og:type / site_name / locale | ❌ AUSENTES | Falta `og:type="restaurant.menu"` o similar |
| JSON-LD | ❌ **AUSENTE** | Pérdida crítica: **Restaurant, Menu, MenuSection, MenuItem, Offer, precio** no se exponen a Google → sin rich results, sin rich snippets de platos, sin Local SEO |
| canonical / hreflang | ❌ AUSENTES | Hay 6 idiomas pero **0 hreflang** → Google no entiende el multilingüismo |
| meta robots | ❌ AUSENTE | Ni `index` ni `noindex` |
| Enlaces crawlables | ❌ | **Solo 1 enlace interno** (logo → `/`). Los 5 menús, categorías y "Ver menú completo" son **`<button>`, no `<a>`** → el contenido del menú es **invisible para el crawler** |

### 1.3 SEO Técnico / Infraestructura

- `/robots.txt` → **404** ❌ (no existe)
- `/sitemap.xml` → **404** ❌ (no existe; imperativo para menús que Google debe indexar)
- `/.well-known/security.txt` → 404
- Soft-404: `/menu/slug-inexistente` devuelve **HTTP 200** con "Menú no encontrado" (sin `X-Robots-Tag: noindex`)
- Canonical ausente → variantes con/sin trailing slash generan duplicados
- `html lang="es"` ✅ correcto
- Favicon: `/icon.svg` como shortcut+icon+apple-touch-icon (apple-touch-icon debe ser PNG 180x180, SVG no es soportado por iOS)

---

## 2. RESPONSIVE Y LAYOUT

### Landing
- ✅ Excelente: breakpoints `sm/md/lg` en grillas (`lg:grid-cols-[1.05fr_.95fr]`), tipografía fluida `text-[clamp(3.2rem,7.5vw,5.5rem)]`, contenedor fluido hasta 96rem, nav sticky con blur.
- ✅ Hero con mockup de teléfono se apila correctamente en móvil (grid columna única).
- ⚠️ Los badges flotantes del hero ("📷 Fotos WebP", "🇻🇪 Tasa BCV") están `hidden` en móvil — se pierde mensaje clave en la pantalla más importante.

### Menú público
- ⚠️ **Solo breakpoint `sm:` en todo el HTML** (21 usos, ningún `md/lg/xl`). En pantallas grandes el contenido queda en 2-3 columnas y anchos máximos de 40rem — el menú se ve "estirado" en tablet/desktop, no aprovecha el espacio.
- ✅ Tabs y selector de 6 idiomas con scroll horizontal (`overflow-x-auto no-scrollbar`) — no rompen el layout.
- ✅ Footer fijo con `pb-20` de compensación — sin solapamiento de contenido.
- ⚠️ Riesgos: `truncate` en el título del plato destacado del hero; descripciones cortadas con `line-clamp-2` sin indicador de "más".
- ✅ Alérgenos en `grid-cols-2 sm:grid-cols-3` — legible en móvil.

---

## 3. ANIMACIONES

- ✅ **Con propósito y rápidas**: `fadeIn` (380ms), `scaleIn` (300ms), `progress` (barra del carrusel 4.5s), `float`, `pulseSubtle`, `reveal`, `shimmer` definidas en CSS con `cubic-bezier(.16,1,.3,1)` (easing suave de alta calidad).
- ✅ GSAP en tarjetas del menú (`gsap-animate-card`) y carrusel del hero.
- ✅ Hover limpios: `hover:-translate-y-1 hover:shadow-lg duration-200`, `group-hover:scale-105 duration-700` en imágenes.
- ✅ **`@media (prefers-reduced-motion:reduce)` presente** — respeta usuarios con sensibilidad al movimiento.
- ✅ Transición de tema claro/oscuro `duration-300` en el root.
- ⚠️ Sin skeleton/loading states (0 coincidencias) — el SSR lo mitiga, pero al navegar client-side no hay feedback de carga.
- ⚠️ El carrusel "Galería Destacada" usa barra de progreso automática (4.5s) sin pausa al hover — puede frustrar al leer descripciones largas.

---

## 4. CONTRASTE Y ACCESIBILIDAD DE COLOR (WCAG 2.1 — cálculo de luminancia real)

### Landing
| Par | Ratio | Resultado |
|---|---|---|
| Texto **blanco sobre naranja** `#ea580c` (botones primarios "Empieza gratis", "Crear mi menú", btn-primary) | **3.56:1** | ❌ **FALLA AA** (necesita 4.5 para texto normal). Los CTA principales tienen texto bold blanco sobre naranja. |
| Naranja dark `#c2410c` / fondo crema (textos acento) | 4.82:1 | ✅ AA (texto pequeño justo) |
| `--text-secondary` `#5e6776` / blanco (textos de apoyo) | 5.71:1 | ✅ AA |
| **`--kitcho-gray-dark` `#8a909c` / crema** (etiquetas "Fotos de Platos", "Tasa BCV", "Gestión de Monedas") | **2.99:1** | ❌ **FALLA** (text-xs bold) |
| Naranja `#ea580c` / charcoal `#172033` | 4.57:1 | ✅ AA |
| Charcoal / crema, Blanco / charcoal | 15.2:1 / 16.3:1 | ✅ AAA |

### Menú público (marca Vi Cool, verde `#00800f`)
| Par | Ratio | Resultado |
|---|---|---|
| Blanco sobre verde `#00800f` (botones ES, badge "3 platos", "Ver Menú Completo") | 5.13:1 | ✅ AA (no AAA) |
| **Verde sobre slate-900 `#0f172a`** ("Ver sección →", precio destacado) | **3.48:1** | ❌ FALLA AA para text-xs bold |
| **Verde sobre slate-800 `#1e293b`** (dot de cards) | **2.85:1** | ❌ FALLA |
| **`--text-secondary` sobre fondo oscuro** (etiqueta "Idioma") | **3.53:1** | ❌ FALLA AA |
| slate-500 sobre oscuro | 4.24:1 | ❌ FALLA AA |
| Anillo de foco naranja al 30% alpha (`focus-visible`) | ~1.2:1 | ❌ **FALLA WCAG 2.4.11** (foco visible necesita 3:1) |

**Conclusión contraste:** Los CTA primarios de la landing y varios textos del menú no cumplen AA. En el menú, el verde elegido por el restaurante es legible solo sobre blanco; sobre fondos oscuros del tema dark (default) falla.

---

## 5. JERARQUÍA VISUAL

### Landing — ✅ Bien resuelta
- H1 display (Playfair) vs párrafo → contraste de tamaño claro (`clamp` 3.2→5.5rem vs 1.25rem).
- Jerarquía de secciones con fondo alternado (crema → blanco → charcoal oscuro → crema) = ritmo visual claro.
- CTA primario destacado con shadow, CTA secundario outline. Eyebrows + displays + body → sistema tipográfico coherente.
- ⚠️ **Bug**: la tipografía declarada **Playfair Display y DM Sans NO SE CARGAN** (0 `@font-face`, 0 Google Fonts en el CSS y el HTML). El navegador **cae a Georgia y system sans-serif**. El titular "serif editorial" que define la marca **no se ve como se diseñó**. Esto degrada toda la jerarquía tipográfica.
- ⚠️ El H1 está en la columna izquierda con `max-w-xl` pero la palabra clave "vende por ti" en em naranja se apoya en `text-[var(--kitcho-orange)]` — correcto.

### Menú público — ⚠️ Regular
- El nombre del restaurante es solo una imagen (alt="Vi Cool"), sin H1 textual.
- Precio del menú festivo destaca bien (2xl→3xl extrabold verde).
- Secciones en cards con dot verde + badge de conteo → separación clara.
- ⚠️ Sin búsqueda, sin índice/atajo entre secciones; para navegar a un plato hay que recorrer las cards.
- ⚠️ 5 menús ocultos tras tabs con scroll horizontal — el usuario no ve que existen "Tapas de Mar" o "Vinos" sin hacer scroll horizontal.

---

## 6. LLAMADAS A LA ACCIÓN (CTA)

### Landing — ✅ Excelente
- 4 CTAs a `/register` + 2 a `/login` + 1 anchor `#como-funciona`. Frecuencia y ubicación correctas (nav, hero, final).
- Textos accionables: "Empieza gratis 15 días", "Crear mi menú gratis", "Crear mi menú".
- ✅ Beneficio clave sin fricción ("15 días de prueba gratis", "Sin tarjeta de crédito").
- ❌ **Contraste del CTA primario falla AA** (3.56:1 blanco/naranja) — se ve "quemado" en pantallas brillantes.
- ⚠️ Anchor "Ver cómo funciona" apunta a `#como-funciona` pero no hay scroll-margin definido y el nav es sticky (z-50, 4.5rem) → puede cubrir el título de la sección al anclar.

### Menú público — ⚠️ Oportunidad perdida
- "Ver Menú Completo →", "Ver sección →" ✅ claros.
- ❌ **No hay ningún CTA de acción comercial**: no hay botón de reserva, pedido, WhatsApp, teléfono, dirección ni redes (0 `tel:`, 0 `mailto`, 0 instagram/facebook/whatsapp en todo el menú). Para un menú de restaurante esto es **el principal KPI perdido**.
- ⚠️ "Ver Menú Completo" y "Ver sección" son `<button>` — no crawlables ni compartibles.

---

## 7. HUMANIZACIÓN Y COMPRENSIÓN DE TEXTOS

### Landing — ✅ Muy buena
- Copy emocional y específico: "La carta digital que **vende por ti.**", "Que tu menú hable tan bien de ti como tu cocina."
- Beneficios en 3 pasos claros ("Crea tu cuenta → Sube platos → Publica QR").
- Lenguaje coloquial en la línea de producto ("enamorar a tus comensales desde el primer escaneo").
- ⚠️ **El AGENTS.md prometía testimonios, trust banner y FAQ accordion en la landing — pero NO EXISTEN en el HTML servido** (0 matches de testimonio/FAQ/accordion/reseña/review). Se pierde prueba social, que es el recurso de conversión nº1 en SaaS.

### Menú público — ❌ Deficiente
- Tagline "Cocina con Alma" humanizado ✅, pero:
- ❌ **60+ descripciones de platos vacías** (solo 15 con texto, casi todos vinos). El contenido real del producto (la carta) está hueco.
- ❌ **Errores tipográficos**: "**Carpacho** de setas portobelo" (→ Carpaccio), "Clasicos" (sin tilde), "principales" (minúscula), "Salmorejo Clasico", inconsistencia "Entrantes"/"Clasicos"/"principales".
- ❌ **Mojibake**: "Menú" renderizado como "MenÃº", em-dash como "â€"". Esto es un bug de encoding (UTF-8 doble codificado) que corrompe títulos, botones y aria-labels en toda la página.
- ⚠️ Precio "S/M" (sin mercado) sin explicación — jerga interna que confunde al comensal.
- ⚠️ Alérgenos solo visibles al expandir `<details>`; la nota legal es correcta y completa (cumple Reglamento UE 1169/2011) ✅.

---

## 8. UX / UI

### Landing
- ✅ Navegación mínima y enfocada, scroll fluido, glassmorphism sutil en nav.
- ✅ Microinteracciones con propósito, tema coherente (naranja/charcoal/crema).
- ❌ **Tipografía fallida** (ver 5.1) — degrada toda la percepción de marca.
- ⚠️ Sin footer informativo (solo brand + "Acceder al panel"); faltan enlaces de términos, privacidad, contacto.
- ⚠️ Sin formulario de contacto, sin email, sin redes — el usuario no tiene canal de soporte visible.
- ⚠️ La landing no tiene imágenes reales (0 `<img>`), todo SVG/CSS → visualmente "plana" comparada con el marketing de food tech.

### Menú público
- ✅ 6 idiomas con selector accesible (aria-labels), default ES correcto, tema oscuro por defecto (bueno para restaurantes por la noche), alérgenos con chips emoji.
- ❌ **Touch targets insuficientes (WCAG 2.5.5, 44px mínimo)**: botones de idioma **32px**, tabs ~36px, toggle de tema ~34px, **dots del carrusel ~8px** (prácticamente imposibles de tocar).
- ❌ **Choque de marca**: el restaurante configura verde `#00800f` pero las variables derivadas siguen siendo naranja de Kitcho → el **hover del botón verde se vuelve naranja** (`btn-primary:hover`), el eyebrow es naranja, el anillo de foco es naranja, la sombra del botón es naranja `#ea580c33`. El menú parece "a medio pintar".
- ⚠️ Sin búsqueda en una carta de 72 platos — UX crítica para comensales impacientes.
- ⚠️ Sin estados vacíos/skeleton (0).
- ⚠️ Footer fijo "Tu carta digital" (branding Kitcho) sobre el contenido del restaurante: quita espacio y confunde la identidad del local.
- ✅ Precio "17,90 € / persona" con etiqueta "persona" — formato comprensible.
- ❌ Formatos de precio inconsistentes: coma ("17,90"), punto ("16.00 €"), sin decimales ("5"), "S/M".

---

## 9. PERFORMANCE (base de UX/SEO)

| Métrica | Valor | Veredicto |
|---|---|---|
| HTML landing | 27 KB | ✅ Ligero |
| **HTML menú** | **392 KB** (payload RSC 322 KB + imágenes base64) | ❌ Pesadísimo para un menú; el contenido completo viaja inline |
| JS total landing | **658 KB** (11 chunks) | ❌ Excesivo para una landing estática (LCP/TTI lentos en 3G) |
| CSS | 78 KB | ⚠️ |
| Imágenes menú | base64 inline (logo PNG 7.3KB, plato WebP 24.8KB) | ⚠️ Sin caching/CDN, sin width/height (**riesgo de CLS**), sin lazy |
| preconnect/preload | 1 preload (JS), **0 preconnect** | ⚠️ Sin preconnect a Supabase |
| width/height en imágenes | 0 en ambas imágenes | ❌ CLS probable |
| loading="lazy" | 0 | ❌ |

---

## 10. ACCESIBILIDAD GENERAL

- ✅ `html lang="es"`, aria-labels en logo e idiomas, botones reales (`<button>`) en la UI interactiva.
- ❌ **aria-labels corruptos por mojibake** en selector de idioma ("Ver menÃº en EspaÃ±ol", coreano corrupto).
- ❌ Dots de carrusel sin aria-label (solo `title`), sin `aria-current` en el dot activo.
- ❌ Sin H1 en menú; focus-visible falla contraste (2.4.11).
- ❌ Touch targets < 44px (2.5.5).
- ⚠️ Sin skip-link, sin roles de landmarks explícitos.
- ✅ `prefers-reduced-motion` respetado.

---

## 11. LISTA PRIORIZADA DE CORRECCIONES

### P0 — Bugs que afectan la marca y el producto
1. **Corregir mojibake**: el encoding UTF-8 está doblemente codificado en el SSR del menú. Verificar `res` charset y el `JSON.stringify`/pipeline del render (afecta title, H2, botones, aria-labels, coreano).
2. **Añadir H1 en el menú**: usar el nombre del restaurante como `<h1>` textual (el logo img debe ser decorativo con `aria-hidden`).
3. **Cargar las fuentes reales**: importar **Playfair Display + DM Sans** con `next/font/google` (hoy caen a Georgia/system). Devolvería la identidad tipográfica a toda la app.
4. **Resolver el choque de marca en menús**: mapear `--kitcho-orange*` derivadas al color configurado por el restaurante (hover, focus, shadow, eyebrow, badges) o aplicar `color-scheme` completo basado en `primaryColor`.
5. **Revisar descripciones vacías y typos del menú**: llenar las 60 descripciones, corregir "Carpacho"→"Carpaccio", "Clasicos"→"Clásicos", "principales"→"Principales", quitar espacios finales.

### P1 — SEO crítico (menú = la página que Google debe indexar)
6. **Datos estructurados JSON-LD**: `Restaurant` + `Menu` + `MenuSection`/`MenuItem` con `offers.price` y `currencies` por menú y plato.
7. **og:image real**: subir la imagen del restaurante a una URL pública (CDN/Supabase Storage) en lugar de base64; añadir `og:url`, `og:type`, `og:site_name`, `og:locale`, `twitter:site`.
8. **Meta description única por restaurante** generada desde `restaurantName + tagline + ciudad`, no una plantilla genérica.
9. **Convertir "Ver sección" / "Ver Menú Completo" en `<a href="#seccion">`** (además de `<button>`) para que el crawler recorra la carta.
10. **Canonical + hreflang** por idioma (6) en el menú; `canonical` en landing.
11. **robots.txt y sitemap.xml** dinámicos (sitemap con todos los `/menu/{slug}` y sus 6 idiomas).

### P2 — UX/Accesibilidad
12. **Subir contraste de CTAs**: en la landing, usar naranja dark `#c2410c` para fondo de btn-primary (ratio 4.82:1 con blanco) o texto charcoal sobre naranja claro; en el menú, verde `#00800f` solo sobre blanco y un verde más claro (`#00a313`) sobre fondos oscuros.
13. **Touch targets ≥44px**: idiomas (min-h-8→min-h-11), tabs, toggle tema, y dots del carrusel (min 44x44 con área invisible de toque).
14. **Añadir búsqueda/filtro en el menú** (72 platos sin buscador) y estado vacío.
15. **Añadir CTA comercial al menú**: botón "Reservar mesa" / teléfono / WhatsApp / redes (configurables por el restaurante).
16. **Focus visible accesible**: reemplazar el anillo naranja 30% por un outline 3:1+ y `aria-current` en dots.
17. **Añadir CTAs de soporte en landing** (email, contacto) y footer legal (términos/privacidad).

### P3 — Performance
18. **Sacar las imágenes del HTML**: usar URLs de Supabase Storage con width/height, `loading="lazy"` y preconnect; recortar el payload RSC (392 KB de HTML).
19. **Reducir JS de la landing** (658 KB): eliminar GSAP/supabase de la landing si no se usan, o aplicar `experimental.optimizePackageImports`.
20. **Añadir skeleton/loading** para navegación client-side y pausa del carrusel al hover.

---

## 12. RESUMEN DE PUNTUACIÓN

| Área | Puntuación | Nota |
|---|---|---|
| Humanización de textos (landing) | 9/10 | Copy excelente; falta prueba social |
| CTAs (landing) | 8/10 | Buenos; contraste falla; falta scroll-margin |
| Jerarquía visual (landing) | 6/10 | Buena, pero tipografía nunca se carga |
| Responsive | 8/10 | Landing excelente; menú solo `sm:` |
| Animaciones | 8/10 | Con propósito, reducidas-motion respetadas; faltan skeletons |
| Contraste WCAG | 4/10 | CTAs primarios y textos del menú fallan AA |
| SEO on-page | 3/10 | Sin OG real, sin JSON-LD, sin H1, sin canonical, soft-404 |
| SEO técnico | 2/10 | Sin robots.txt, sin sitemap, JS pesado, imágenes base64 |
| UX menú | 5/10 | Funcional pero sin búsqueda, sin CTA comercial, touch targets malos |
| Marca / identidad | 4/10 | Choque naranja/verde, mojibake, tipografía fallida |
| **Global** | **5.5/10** | **Potencial alto; bloqueado por bugs de encoding, SEO técnico y contraste** |
