'use strict';

/**
 * Shared helper: read every theme token file and scope it so multiple
 * themes can coexist in one page behind [data-theme="name"].
 * Used by render.js (reports get a live theme switcher) and
 * bin/landing.js (landing page dropdown).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const THEMES_DIR = path.join(ROOT, 'themes');

function listThemes() {
  return fs
    .readdirSync(THEMES_DIR)
    .filter((f) => f.endsWith('.css'))
    .map((f) => f.replace(/\.css$/, ''))
    .sort();
}

function scopedThemeTokens() {
  let out = '';
  for (const name of listThemes()) {
    let css = fs.readFileSync(path.join(THEMES_DIR, `${name}.css`), 'utf8');
    css = css.replace(/\/\*[\s\S]*?\*\//g, ''); // strip comments (may mention .dark)
    css = css
      .split(':root')
      .join(`[data-theme="${name}"]`)
      .split('.dark')
      .join(`[data-theme="${name}"].dark`);
    out += css + '\n';
  }
  return out;
}

function themeOptions(selected) {
  return listThemes()
    .map((n) => `<option value="${n}"${n === selected ? ' selected' : ''}>${n[0].toUpperCase()}${n.slice(1)}</option>`)
    .join('');
}

module.exports = { listThemes, scopedThemeTokens, themeOptions, THEMES_DIR };
