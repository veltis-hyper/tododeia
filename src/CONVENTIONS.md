# Convenciones de conversión — Claude de Cero a Cien (web)

Cada archivo de `src/txt/*.txt` (salida de pdftotext -layout) se convierte a UN fragmento HTML en `src/fragments/<mismo-nombre>.html`.

## Regla de oro
**FIDELIDAD TOTAL**: todo el contenido del txt debe aparecer en el fragmento. No resumir, no omitir párrafos, listas, tablas, ejemplos ni notas. Sí se corrige la presentación (ver limpieza).

## Limpieza obligatoria (artefactos del PDF)
- Eliminar los pies de página repetidos: líneas tipo `123   @soyenriquerocha` (número de página + handle).
- Re-unir párrafos partidos por saltos de página o de línea (el texto corre continuo).
- Conservar acentos y corregir los que el PDF perdió solo si es evidente (p. ej. «Guia» en portada → «Guía»).
- Eliminar líneas en blanco redundantes.

## Estructura del fragmento
```html
<article class="chapter" data-id="cap14" data-title="CLAUDE.md y Memoria del Proyecto" data-part="3">
  <header class="ch-head">
    <p class="ch-kicker">Parte 3 · Claude Code · Capítulo 14</p>
    <h1>CLAUDE.md y Memoria del Proyecto</h1>
    <p class="ch-lede">[primer párrafo introductorio del capítulo, si existe]</p>
  </header>
  ... contenido ...
</article>
```
- `data-id`: `intro`, `como-usar`, `cap01`…`cap25`, `apx-a`, `apx-b`, `apx-c`, `glosario`, `novedades`.
- Para intro/apéndices/glosario/novedades el kicker es «Introducción», «Apéndice A», «Material adicional», etc.

## Jerarquía
- `<h1>`: título del capítulo (solo uno).
- `<h2 id="slug">`: secciones principales del capítulo (cada h2 lleva id en kebab-case, únicos dentro del capítulo, prefijados con el data-id: `id="cap14-que-es-claude-md"`). El índice lateral "En este capítulo" se genera de los h2.
- `<h3>`: subsecciones.

## Componentes
- **Párrafos**: `<p>`. Negritas del original → `<strong>`. Términos técnicos sueltos (comandos, flags, rutas, nombres de archivo) → `<code>`.
- **Listas**: `<ul>`/`<ol>` reales. Las listas con término + descripción («Curiosos — Quieres…») → `<ul class="deflist">` con `<li><strong>Término</strong> — descripción</li>`.
- **Tablas**: el texto alineado con columnas del pdftotext se reconstruye como `<table>` real con `<thead>` y `<tbody>`. Envolver en `<div class="table-wrap">`.
- **Código/comandos**: bloques de comandos, JSON, YAML, código → `<pre><code class="lang-bash|json|python|js|text">…</code></pre>`. Escapar `<`, `>`, `&`. El botón de copiar lo inyecta el runtime, no lo escribas.
- **Callouts**: notas, advertencias, tips del texto (líneas tipo «Nota:», «Importante:», «Ojo:», «Tip:», «Cuidado:») →
  `<div class="callout note|warn|tip"><p class="callout-label">Nota</p><p>…</p></div>`
- **Pasos numerados** (instrucciones paso a paso) → `<ol class="steps">`.
- **Resumen de capítulo** (si el capítulo cierra con recapitulación / «En resumen» / «Lo esencial») → envolver en `<section class="recap">` manteniendo su h2.
- **Glosario**: usar `<dl class="glossary"><dt>Término</dt><dd>Definición</dd>…</dl>`, agrupado por letra con `<h2>` por letra si el original agrupa así.
- **Apéndices de referencia** (tablas largas de flags/settings/env): tablas reales; si el apéndice tiene grupos, un `<h2>` por grupo. NO usar acordeones que oculten contenido.

## Prohibido
- Emojis decorativos que no estén en el original.
- Inventar contenido, ejemplos o secciones.
- Atributos de estilo inline (`style="…"`).
- Omitir cualquier fila de tabla, flag, setting o entrada de glosario.

## Validación antes de terminar
1. Recorre el txt de arriba a abajo comparando: cada sección del txt tiene su equivalente en el fragmento.
2. El HTML está bien formado (etiquetas cerradas, entidades escapadas dentro de `<code>`).
3. Solo hay un `<h1>` y todos los `<h2>` tienen `id` único con prefijo del capítulo.
