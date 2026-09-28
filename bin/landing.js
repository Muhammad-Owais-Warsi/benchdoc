'use strict';

/**
 * Build the landing page: src/landing.html + compiled Tailwind CSS +
 * per-theme tweakcn tokens (scoped by [data-theme] so the dropdown
 * can switch themes live) + client script → index.html (single file).
 */

const fs = require('fs');
const path = require('path');
const { loadFonts } = require('../src/render');
const { listThemes, scopedThemeTokens, themeOptions } = require('../src/theme-tokens');

const ROOT = path.join(__dirname, '..');
const DIST_CSS = path.join(ROOT, 'dist', 'tailwind.css');

function main() {
  if (!fs.existsSync(DIST_CSS)) {
    console.error('Compiled Tailwind CSS not found. Run `npm run build:css` first.');
    process.exit(1);
  }
  const compiled = fs.readFileSync(DIST_CSS, 'utf8');
  const tokens = scopedThemeTokens();

  const js = fs.readFileSync(path.join(ROOT, 'src', 'client.js'), 'utf8');
  const shell = fs.readFileSync(path.join(ROOT, 'src', 'landing.html'), 'utf8');

  const names = listThemes();
  const defaultTheme = names.includes('one') ? 'one' : names[0];
  const html = shell
    .split('{{landingThemeOptions}}')
    .join(themeOptions(defaultTheme))
    .replace('{{css}}', () => `${loadFonts()}\n${compiled}\n${tokens}`)
    .replace('{{js}}', () => js)
    .split('data-theme="one"')
    .join(`data-theme="${defaultTheme}"`);

  const out = path.join(ROOT, 'index.html');
  if (html.includes('{{') || !html.includes('.site-header')) {
    console.error('landing build broken: CSS/JS did not inline. Check src/landing.html placeholders ({{css}}, {{js}}, {{landingThemeOptions}}).');
    process.exit(1);
  }
  fs.writeFileSync(out, html, 'utf8');
  console.log(`Wrote ${out}`);
}

main();
