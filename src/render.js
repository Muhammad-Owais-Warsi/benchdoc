'use strict';

const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const footnote = require('markdown-it-footnote');
const hljs = require('highlight.js');

const alerts = require('./plugins/alerts');
const taskLists = require('./plugins/tasklists');
const anchors = require('./plugins/anchors');
const figures = require('./plugins/figures');
const codeBlocks = require('./plugins/code');
const frontmatter = require('./frontmatter');

const ROOT = path.join(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const DIST_CSS = path.join(ROOT, 'dist', 'tailwind.css');

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

function listTemplates() {
  return fs
    .readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith('.css'))
    .map((f) => f.replace(/\.css$/, ''))
    .sort();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createMarkdown(opts) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
        } catch (_) {
          /* fall through */
        }
      }
      return escapeHtml(code);
    },
  });

  md.use(footnote);
  md.use(alerts);
  md.use(taskLists);
  md.use(anchors);
  md.use(figures, { baseDir: opts.baseDir, embed: opts.embedImages, mime: MIME });
  md.use(codeBlocks);

  return md;
}

function loadCompiledCss() {
  if (!fs.existsSync(DIST_CSS)) {
    throw new Error('Compiled Tailwind CSS not found at dist/tailwind.css. Run `npm run build:css` first.');
  }
  return fs.readFileSync(DIST_CSS, 'utf8');
}

// One font everywhere (Poppins, static latin faces), embedded as
// base64 so pages stay offline single files without the bulk.
function fontFace(family, weight, file, style = 'normal') {
  const data = fs.readFileSync(file).toString('base64');
  return (
    `@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};font-display:swap;` +
    `src:url(data:font/woff2;base64,${data}) format("woff2")}`
  );
}

function loadFonts() {
  const dir = path.join(ROOT, 'node_modules/@fontsource/poppins/files');
  return [
    fontFace('Poppins', 400, path.join(dir, 'poppins-latin-400-normal.woff2')),
    fontFace('Poppins', 500, path.join(dir, 'poppins-latin-500-normal.woff2')),
    fontFace('Poppins', 600, path.join(dir, 'poppins-latin-600-normal.woff2')),
    fontFace('Poppins', 400, path.join(dir, 'poppins-latin-400-italic.woff2'), 'italic'),
  ].join('\n');
}

function buildToc(md, src, env) {
  const tokens = md.parse(src, env);
  const items = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type !== 'heading_open') continue;
    const level = Number(t.tag.slice(1));
    if (level < 2 || level > 3) continue;
    const inline = tokens[i + 1];
    const id = t.attrGet('id');
    const text = inline.children
      .filter((c) => c.type === 'text' || c.type === 'code_inline')
      .map((c) => c.content)
      .join('');
    items.push({ level, id, text });
  }
  if (items.length < 2) return '';
  const li = items
    .map((it) => `<li class="toc-l${it.level}"><a href="#${it.id}">${escapeHtml(it.text)}</a></li>`)
    .join('');
  return `<nav class="toc" aria-label="Contents"><div class="toc-title">Contents</div><ul>${li}</ul></nav>`;
}

/**
 * Render a Markdown string to a complete standalone HTML document.
 * Styling is Tailwind v4 (compiled, inlined) + tweakcn tokens for the
 * chosen template. One Poppins webfont embedded by default
 * (skip with embedFonts:false).
 * @param {string} source Markdown source
 * @param {object} opts
 * @param {string} [opts.baseDir] directory used to resolve relative image paths
 * @param {string} [opts.template] template name (tweakcn token preset in templates/)
 * @param {string} [opts.customCss] extra CSS appended after the template
 * @param {boolean} [opts.embedImages=true] inline local images as data URIs
 * @param {boolean} [opts.embedFonts=true] inline the Poppins webfont
 * @param {boolean} [opts.toc] force TOC on/off (default: template decides)
 */
function render(source, opts = {}) {
  const { meta, body } = frontmatter.parse(source);

  const template = String(opts.template || meta.template || 'docs');
  const templateFile = path.join(TEMPLATES_DIR, `${template}.css`);
  if (!fs.existsSync(templateFile)) {
    throw new Error(`Unknown template "${template}". Available: ${listTemplates().join(', ')}`);
  }

  const md = createMarkdown({
    baseDir: opts.baseDir || process.cwd(),
    embedImages: opts.embedImages !== false,
  });

  const env = {};
  const html = md.render(body, env);

  // Title: frontmatter > first H1 > filename
  let title = meta.title || '';
  if (!title) {
    const m = body.match(/^#\s+(.+)$/m);
    if (m) title = m[1].replace(/[*_`]/g, '').trim();
  }
  if (!title) title = opts.fallbackTitle || 'Document';

  // Chrome defaults: brand + footer title come from frontmatter,
  // otherwise fall back to sensible defaults (never empty).
  const brand = meta.brand || 'benchdoc';
  const footerTitle = meta.footer || title;

  const wantToc =
    typeof opts.toc === 'boolean'
      ? opts.toc
      : meta.toc !== undefined
        ? String(meta.toc) !== 'false'
        : null; // null = template default (CSS decides whether to show)
  const toc = wantToc === false ? '' : buildToc(md, body, env);

  const metaBits = [];
  if (meta.author) metaBits.push(`<span class="meta-author">${escapeHtml(meta.author)}</span>`);
  if (meta.date) metaBits.push(`<time class="meta-date">${escapeHtml(meta.date)}</time>`);
  const hero = meta.title
    ? `<section class="doc-hero"><div class="doc-hero-inner">` +
      (meta.subtitle ? `<p class="doc-kicker">${escapeHtml(meta.subtitle)}</p>` : '') +
      `<h1 class="doc-title">${escapeHtml(meta.title)}</h1>` +
      (metaBits.length ? `<div class="doc-meta">${metaBits.join('<span class="doc-meta-sep">·</span>')}</div>` : '') +
      `</div></section>`
    : '';

  const css = [
    opts.embedFonts !== false ? loadFonts() : '',
    loadCompiledCss(),
    fs.readFileSync(templateFile, 'utf8'),
    opts.customCss || '',
  ].join('\n');

  const js = fs.readFileSync(path.join(__dirname, 'client.js'), 'utf8');

  const shell = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

  return shell
    .split('{{title}}').join(escapeHtml(title))
    .replace('{{template}}', escapeHtml(template))
    .replace('{{hasToc}}', toc ? 'has-toc' : 'no-toc')
    .replace('{{css}}', () => css)
    .replace('{{js}}', () => js)
    .replace('{{toc}}', () => toc)
    .replace('{{hero}}', () => hero)
    .replace('{{body}}', () => html)
    .replace('{{brand}}', () => escapeHtml(brand))
    .replace('{{footerTitle}}', () => escapeHtml(footerTitle));
}

module.exports = { render, listTemplates, loadFonts };
