# .fig tooling

Scripts used to read the Figma `.fig` export without the Figma API.

- `render.mjs` – decodes `canvas.fig` (kiwi format) and renders a node tree to SVG/HTML (glyph outlines from the file, so no fonts needed).
- `shot.mjs` – screenshots the rendered page and its sections (Playwright + Chromium).
- `spec.mjs` – prints a layout/typography/colour spec of the page (`design/spec.txt`).
- `export.mjs` / `webp.mjs` – export web-ready image assets (`design/assets/`).

Usage: unzip the `.fig` into `./fig/` (gives `canvas.fig` + `images/`), `npm i kiwi-schema fzstd pako playwright`, then `node render.mjs && node shot.mjs`.
