'use strict';

/**
 * Build the landing page: src/landing.html + compiled Tailwind CSS +
 * per-theme tweakcn tokens (scoped by [data-theme] so the dropdown
 * can switch themes live) + client script → index.html (single file).
 */

const fs = require('fs');
const path = require('path');
const { loadFonts } = require('../src/render');

const ROOT = path.join(__dirname, '..');
const DIST_CSS = path.join(ROOT, 'dist', 'tailwind.css');
const THEMES_DIR = path.join(ROOT, 'themes');

function main() {
  if (!fs.existsSync(DIST_CSS)) {
    console.error('Compiled Tailwind CSS not found. Run `npm run build:css` first.');
    process.exit(1);
  }
  const compiled = fs.readFileSync(DIST_CSS, 'utf8');

  const names = fs
    .readdirSync(THEMES_DIR)
    .filter((f) => f.endsWith('.css'))
    .map((f) => f.replace(/\.css$/, ''))
    .sort();

  let tokens = '';
  for (const name of names) {
    let css = fs.readFileSync(path.join(THEMES_DIR, `${name}.css`), 'utf8');
    css = css.replace(/\/\*[\s\S]*?\*\//g, ''); // strip comments (may mention .dark)
    css = css
      .split(':root')
      .join(`[data-theme="${name}"]`)
      .split('.dark')
      .join(`[data-theme="${name}"].dark`);
    tokens += css + '\n';
  }

  const js = fs.readFileSync(path.join(ROOT, 'src', 'client.js'), 'utf8');
  const shell = fs.readFileSync(path.join(ROOT, 'src', 'landing.html'), 'utf8');

  const html = shell
    .replace('{{css}}', () => `${loadFonts()}\n${compiled}\n${tokens}`)
    .replace('{{js}}', () => js);

  const out = path.join(ROOT, 'index.html');
  fs.writeFileSync(out, html, 'utf8');
  console.log(`Wrote ${out}`);
}

main();
