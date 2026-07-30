# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Claude de Cero a Cien" — an interactive Spanish-language guide to Claude, built as a **single self-contained HTML file** (`dist/index.html`). The source book is a PDF; its `pdftotext -layout` output lives in `src/txt/`, and each txt file is hand-converted to an HTML fragment in `src/fragments/`. No package.json, no dependencies, no git — just Node.

## Build

```bash
node build.mjs
```

Assembles `dist/index.html` by inlining `src/shell/styles.css` and `src/shell/app.js` into `src/shell/template.html` and embedding every fragment as a `<template id="tpl-{id}">`. It warns (but doesn't fail) if fragments are missing. There are no tests or linters; to verify, rebuild and open `dist/index.html` in a browser.

**Never edit `dist/index.html` directly** — it's generated.

## Architecture

- **`build.mjs`** — build script AND the single source of truth for navigation. The `NAV` constant maps every chapter (id, number, title, fragment file) into parts. Adding/renaming a chapter means editing `NAV` here plus creating the fragment.
- **`src/shell/`** — the SPA runtime: `template.html` (page skeleton with `{{CSS}}`/`{{JS}}`/`{{NAV_JSON}}`/`{{TEMPLATES}}` placeholders), `styles.css`, `app.js`.
- **`src/fragments/NN-*.html`** — one `<article class="chapter">` per chapter. This is where content edits happen.
- **`src/txt/NN-*.txt`** — raw PDF text extraction, same basename as its fragment. Read-only reference; fragments must faithfully contain all of its content.

`app.js` is a vanilla-JS runtime (no framework): hash router (`#/capNN`, section deep-links via `?s=slug`), reading-progress tracking in localStorage (`done`/`skip` per chapter), a client-side search index built from the embedded templates, per-chapter "En este capítulo" nav generated from `h2[id]` elements, and copy buttons injected into every `<pre>`.

## Writing fragments

**Read `src/CONVENTIONS.md` before creating or editing any fragment** — it defines the required structure and is authoritative. Key rules:

- Total fidelity to the source txt: never summarize or omit paragraphs, table rows, flags, or glossary entries. Clean up PDF artifacts (repeated page footers, paragraphs split across pages).
- One `<h1>` per fragment; every `<h2>` needs a unique kebab-case `id` prefixed with the chapter's data-id (e.g. `id="cap14-que-es-claude-md"`) — the side nav and search deep-links depend on this.
- Use the established components: `<div class="callout note|warn|tip">`, `<ul class="deflist">`, `<ol class="steps">`, `<div class="table-wrap"><table>`, `<section class="recap">`, `<dl class="glossary">`, `<pre><code class="lang-…">`.
- Prohibited: inline `style` attributes, decorative emojis not in the original, invented content, accordions that hide reference content. Don't add copy buttons — the runtime injects them.
- Content is in Spanish; keep accents correct.
