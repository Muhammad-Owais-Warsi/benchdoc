#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { render, listThemes } = require('../src/render');

function usage(code = 0) {
  const out = code === 0 ? console.log : console.error;
  out(`Usage: benchdoc <input.md> [options]

Turn a Markdown file into one self-contained HTML report.

Options:
  -o, --out <file>      Output path (default: <input>.html)
  -t, --theme <name>   Theme (default: one, see 'benchdoc themes')
  --no-fonts            Skip embedded webfonts (use system fonts)
  -h, --help            Show this help

Commands:
  init [kind] [file]  Create a starter report (kinds: report, bench, compare; default file: <kind>.md)
  themes                List available themes

Frontmatter (optional):
  ---
  title: My Report
  author: You
  date: 2026-09-26
  theme: one
  toc: true
  footer: My Report
  ---
`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') args.help = true;
    else if ((a === '-o' || a === '--out') && argv[i + 1]) args.out = argv[++i];
    else if ((a === '-t' || a === '--theme' || a === '--template') && argv[i + 1]) args.theme = argv[++i];
    else if (a === '--no-fonts') args.embedFonts = false;
    else if (a.startsWith('-')) {
      console.error(`Unknown option: ${a}`);
      usage(1);
    } else args._.push(a);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args._[0] === 'themes' && args._.length === 1) {
    console.log(listThemes().join('\n'));
    return;
  }
  if (args._[0] === 'init' && args._.length <= 3) {
    initReport(args._[1], args._[2]);
    return;
  }
  if (args.help || args._.length === 0) usage(args.help ? 0 : 1);
  if (args._.length > 1) {
    console.error(`Too many arguments: ${args._.join(' ')}`);
    usage(1);
  }

  const input = path.resolve(args._[0]);
  if (!fs.existsSync(input)) {
    console.error(`File not found: ${input}`);
    process.exit(1);
  }

  const out =
    args.out != null
      ? path.resolve(args.out)
      : path.join(path.dirname(input), path.basename(input, path.extname(input)) + '.html');

  const source = fs.readFileSync(input, 'utf8');
  let html;
  try {
    html = render(source, {
      baseDir: path.dirname(input),
      theme: args.theme,
      embedFonts: args.embedFonts !== false,
      fallbackTitle: path.basename(input, path.extname(input)),
    });
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, 'utf8');
  console.log(`Wrote ${out}`);
}

const STARTERS_DIR = path.join(__dirname, '..', 'src', 'starters');

function listStarters() {
  return fs
    .readdirSync(STARTERS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
}

function initReport(kindOrFile, file) {
  const kinds = listStarters();
  let kind = 'report';
  if (kindOrFile) {
    if (kinds.includes(kindOrFile)) {
      kind = kindOrFile;
    } else if (file) {
      console.error(`Unknown starter "${kindOrFile}". Available: ${kinds.join(', ')}`);
      process.exit(1);
    } else {
      file = kindOrFile;
    }
  }
  const out = path.resolve(file || `${kind}.md`);
  if (fs.existsSync(out)) {
    console.error(`File already exists: ${out}`);
    process.exit(1);
  }
  const starter = fs
    .readFileSync(path.join(STARTERS_DIR, `${kind}.md`), 'utf8')
    .split('{{date}}')
    .join(new Date().toISOString().slice(0, 10));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, starter, 'utf8');
  console.log(`Wrote ${out} (${kind} starter)`);
  const rel = path.relative(process.cwd(), out);
  console.log(`Next: benchdoc ${rel.startsWith('..') ? out : rel}`);
}

main();
