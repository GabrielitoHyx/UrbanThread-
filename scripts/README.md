sync-redirects.js — limpieza y redirecciones

Usage:

- Dry run (muestra acciones):

  node sync-redirects.js

- Aplicar cambios (mover archivos y crear redirects):

  node sync-redirects.js --apply

Qué hace:

- Detecta archivos en `threads_h/` que coincidan con patrones (ej. `hoodie-*.html`, `camiseta-*.html`).
- Si el archivo objetivo no existe en la carpeta canónica (ej. `threads_h/hoodies/`), lo mueve ahí y deja detrás un archivo HTML que redirige al nuevo path.
- Si el objetivo ya existe, reemplaza el archivo original con una redirección al archivo canónico.

Seguridad:

- El script es `dry-run` por defecto; usa `--apply` para efectuar cambios.
- Revisa los cambios antes de commitearlos.

Windows / PowerShell:

- Dry run (muestra acciones):

  .\sync-redirects.ps1

- Aplicar cambios (mover archivos y crear redirects):

  .\sync-redirects.ps1 -Apply
