#!/usr/bin/env node
/* Ensambla dist/index.html a partir de src/shell + src/fragments */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SHELL = join(ROOT, 'src/shell');
const FRAGS = join(ROOT, 'src/fragments');
const OUT = join(ROOT, 'dist/index.html');

const NAV = {
  parts: [
    { key: 'p0', label: 'Antes de empezar', for: '', items: [
      { id: 'intro', num: '', title: 'Introducción', file: '00-introduccion.html' },
      { id: 'como-usar', num: '', title: 'Cómo usar esta guía', file: '01-como-usar.html' },
    ]},
    { key: 'p1', label: 'Parte 1 · Fundamentos', for: 'Para todos', items: [
      { id: 'cap01', num: '1', title: 'Qué es Claude', file: '02-cap01-que-es-claude.html' },
      { id: 'cap02', num: '2', title: 'Primeros pasos con Claude', file: '03-cap02-primeros-pasos.html' },
      { id: 'cap03', num: '3', title: 'Los modelos de Claude', file: '04-cap03-modelos.html' },
      { id: 'cap04', num: '4', title: 'Prompting básico', file: '05-cap04-prompting-basico.html' },
    ]},
    { key: 'p2', label: 'Parte 2 · Claude.ai en profundidad', for: 'Usuarios de la web y móvil', items: [
      { id: 'cap05', num: '5', title: 'La interfaz de Claude.ai', file: '06-cap05-interfaz-claude-ai.html' },
      { id: 'cap06', num: '6', title: 'Proyectos y organización', file: '07-cap06-proyectos.html' },
      { id: 'cap07', num: '7', title: 'Artifacts: crea cosas reales', file: '08-cap07-artifacts.html' },
      { id: 'cap08', num: '8', title: 'Memoria y personalización', file: '09-cap08-memoria.html' },
      { id: 'cap09', num: '9', title: 'Archivos, búsqueda y conversaciones', file: '10-cap09-archivos-busqueda.html' },
      { id: 'cap10', num: '10', title: 'Planes y precios', file: '11-cap10-planes-precios.html' },
    ]},
    { key: 'p3', label: 'Parte 3 · Claude Code', for: 'Desarrolladores y usuarios del CLI', items: [
      { id: 'cap11', num: '11', title: 'Empezar con Claude Code', file: '12-cap11-empezar-claude-code.html' },
      { id: 'cap12', num: '12', title: 'Comandos y flags del CLI', file: '13-cap12-comandos-flags.html' },
      { id: 'cap13', num: '13', title: 'Configuración y settings', file: '14-cap13-configuracion.html' },
      { id: 'cap14', num: '14', title: 'CLAUDE.md y memoria del proyecto', file: '15-cap14-claude-md.html' },
      { id: 'cap15', num: '15', title: 'Permisos y seguridad', file: '16-cap15-permisos.html' },
      { id: 'cap16', num: '16', title: 'Skills y slash commands', file: '17-cap16-skills.html' },
      { id: 'cap17', num: '17', title: 'Hooks', file: '18-cap17-hooks.html' },
      { id: 'cap18', num: '18', title: 'MCP servers', file: '19-cap18-mcp.html' },
      { id: 'cap19', num: '19', title: 'Integraciones con IDEs', file: '20-cap19-ides.html' },
      { id: 'cap20', num: '20', title: 'Agentes y subagentes', file: '21-cap20-agentes.html' },
    ]},
    { key: 'p4', label: 'Parte 4 · Avanzado y desarrollador', for: 'API, equipos y enterprise', items: [
      { id: 'cap21', num: '21', title: 'La API de Claude', file: '22-cap21-api.html' },
      { id: 'cap22', num: '22', title: 'Construir con Claude', file: '23-cap22-construir.html' },
      { id: 'cap23', num: '23', title: 'Cowork y automatización', file: '24-cap23-cowork.html' },
      { id: 'cap24', num: '24', title: 'Enterprise y equipos', file: '25-cap24-enterprise.html' },
      { id: 'cap25', num: '25', title: 'Troubleshooting y mejores prácticas', file: '26-cap25-troubleshooting.html' },
    ]},
    { key: 'apx', label: 'Apéndices', for: 'Referencia rápida', items: [
      { id: 'apx-a', num: 'A', title: 'Referencia completa de flags CLI', file: '27-apendice-a-flags.html' },
      { id: 'apx-b', num: 'B', title: 'Referencia completa de settings', file: '28-apendice-b-settings.html' },
      { id: 'apx-c', num: 'C', title: 'Referencia de variables de entorno', file: '29-apendice-c-env.html' },
    ]},
    { key: 'extra', label: 'Material adicional', for: '', items: [
      { id: 'glosario', num: '', title: 'Glosario', file: '30-glosario.html' },
      { id: 'novedades', num: '', title: 'Novedades del mes', file: '31-novedades.html' },
    ]},
  ],
};

let templates = '';
let missing = [];
for (const p of NAV.parts) {
  for (const it of p.items) {
    const f = join(FRAGS, it.file);
    if (!existsSync(f)) { missing.push(it.file); continue; }
    const html = readFileSync(f, 'utf8').trim();
    templates += `<template id="tpl-${it.id}">\n${html}\n</template>\n\n`;
  }
}

if (missing.length) {
  console.error('FALTAN fragmentos:', missing.join(', '));
}

const navJson = JSON.stringify({
  parts: NAV.parts.map(p => ({
    key: p.key, label: p.label, for: p.for,
    items: p.items.map(({ id, num, title }) => ({ id, num, title })),
  })),
});

const css = readFileSync(join(SHELL, 'styles.css'), 'utf8');
const js = readFileSync(join(SHELL, 'app.js'), 'utf8');
const boveda = JSON.stringify(JSON.parse(readFileSync(join(ROOT, 'src/boveda.json'), 'utf8')))
  .replace(/</g, '\\u003c');
let out = readFileSync(join(SHELL, 'template.html'), 'utf8');
out = out.replace('{{CSS}}', () => css)
         .replace('{{JS}}', () => js)
         .replace('{{NAV_JSON}}', () => navJson)
         .replace('{{BOVEDA}}', () => boveda)
         .replace('{{TEMPLATES}}', () => templates);
writeFileSync(OUT, out);
console.log(`OK → ${OUT} (${(out.length / 1024 / 1024).toFixed(2)} MB, ${missing.length} fragmentos faltantes)`);
