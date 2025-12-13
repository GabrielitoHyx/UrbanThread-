# Diseño — Urban Threads

Resumen de decisiones y recursos usados para el diseño "urbano" del sitio.

- **Objetivo visual:** Estética urbana / callejera inspirada en marcas como Onitsuka Tiger y Timberland: colores sobrios, acentos cálidos (ámbar/amarillo), tipografías contundentes y composición basada en tarjetas (cards). El resultado busca un look moderno, minimal y contundente.

- **Fuentes (Google Fonts):**
  - `Archivo Black` — títulos principales (visual fuerte y contundente).
  - `Righteous` — acentos y subtítulos con carácter local/urbano.
  - `Inter` — texto de párrafo y UI (legibilidad en contenidos largos).

- **Paleta:**
  - Fondo: `#0b0f13` (charcoal profundo)
  - Card: `#0f1720`
  - Texto secundario: `#9aa3ad`
  - Acento principal: `#D9A441` (ámbar / estilo Timberland)
  - Acento secundario: `#C62828` (rojo, referencia Onitsuka)

- **Archivos / imágenes:**
  - Se usan imágenes locales en `imagenes/hombres/*` y `imagenes/generales/*`.
  - Logo principal: `imagenes/generales/logo.jpg` (usado en cabeceras y favicon donde aplica).
  - `threads_h/hombres.html` ahora muestra:
    - Camisetas: `imagenes/hombres/camisetas/playera.jpg`, `playera (2).jpg`, `playera (3).jpg`, `playera (4).jpg`
    - Tenis: `imagenes/hombres/tenis/Onitsuka Tiger.jpg`, `Bapesta OS #3.jpg`, `tenisplateado.webp`
    - Hoodies: `imagenes/hombres/hoodies/*` (varias WhatsApp images)
    - Pantalones: `imagenes/hombres/pantalones/pantalon.webp`
    - Camisetas: nueva sección `threads_h/camisetas/` con un listado `camisetas_h.html` y páginas producto en la misma carpeta (`camiseta-*.html`).
    - Video: se incluye un placeholder para `imagenes/hombres/camisetas/banner.mp4` (pon tu video con ese nombre y se reproducirá automáticamente en la cabecera de `camisetas_h.html`).

- **CSS y técnicas modernas utilizadas:**
  - Variables CSS para mantener la paleta y facilitar cambios.
  - Grid responsive `auto-fit` para las tarjetas de producto.
  - Transiciones y transformaciones en hover para tarjetas atractivas.
  - Diseño móvil-first: ajuste de alturas de imagen y grid en `@media`.
  - Accesibilidad: foco visible en enlaces y contraste mejorado para botones.

- **Dónde editar:**
  - Estilos globales: `styles.css` (archivo añadido en la raíz).
  - Página de hombre: `threads_h/hombres.html` (se actualizaron imágenes y estructura de cabecera).
  - Camisetas: `threads_h/camisetas/camisetas_h.html` y producto en `threads_h/camisetas/camiseta-*.html` (sliders y formulario `product-form` que usa `scripts/cart.js`).

  **Pantalones:**

  - Se añadió la colección de `pantalones` en `threads_h/pantalones/pantalones_h.html` con una cabecera hero de alta presencia, inspirada en estética premium (Chrome Hearts / Jordan): fondo oscuro, alto contraste y un "Limited Drop" badge.

- **Tenis**: nueva sección `threads_h/tenis/tenis_h.html` con fondo beige suave (`--bg-tenis`), tipografía destacada (`Playfair Display` para títulos) y enfoque en la interactividad (favoritos, mini-cart). Las páginas de producto `threads_h/tenis/tenis-*.html` incluyen galería, `product-form`, botón de favoritos y acceso rápido para añadir al mini-cart. Se añadió `threads_h/favoritos.html` para gestionar favoritos y añadirlos al carrito.
  - De las imágenes en `imagenes/hombres/pantalones/` se usaron la mitad como imágenes de producto (p. ej. `pantalon.webp`, `descargar (2).jpg`, `descargar (3).jpg`, y varias `WhatsApp Image ...`) y la otra mitad como recursos de diseño para hero y fondos (`descargar (4).jpg`, otras WhatsApp images).
  - Se añadieron 5 páginas de producto: `threads_h/pantalones/pantalon-1.html` → `pantalon-5.html` (galería, SKU, precio, `.product-form` y botón `Comprar ahora` que abre `mailto:`).
  - Se ajustaron estilos en `styles.css` para asegurar `object-fit:cover`, alturas responsivas y una sección `.pantalones-hero` con overlay para legibilidad en móviles y escritorio.

  Nota: las rutas relativas a `imagenes/` se han normalizado para que apunten a `../../imagenes/hombres/pantalones/...` desde las páginas dentro de `threads_h/pantalones/`.

Si quieres que aplique el mismo estilo y sustituya imágenes en otras páginas (`Mujer.html`, `index.html`, páginas de categorías), lo hago ahora y agrego ejemplos de cards y un sistema de plantilla simple para reusar componentes HTML.
