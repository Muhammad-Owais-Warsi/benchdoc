#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { render, listTemplates } = require('../src/render');

function usage(code = 0) {
  const out = code === 0 ? console.log : console.error;
  out(`Usage: benchdoc <input.md> [options]

Turn a Markdown file into one self-contained HTML report.

Options:
  -o, --out <file>      Output path (default: <input>.html)
  -t, --template <name> Theme (default: report, see \`benchdoc themes\`)
  -h, --help            Show this help

Commands:
  init [file]           Create a starter Markdown report (default: report.md)
  themes                List available themes

Frontmatter (optional):
  ---
  title: My Report
  author: You
  date: 2026-09-26
  template: report
  toc: true
  brand: benchdoc
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
    else if ((a === '-t' || a === '--template') && argv[i + 1]) args.template = argv[++i];
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
    console.log(listTemplates().join('\n'));
    return;
  }
  if (args._[0] === 'init' && args._.length <= 2) {
    initReport(args._[1]);
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
      template: args.template,
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

function initReport(file) {
  const out = path.resolve(file || 'report.md');
  if (fs.existsSync(out)) {
    console.error(`File already exists: ${out}`);
    process.exit(1);
  }
  const starter = fs
    .readFileSync(path.join(__dirname, '..', 'src', 'starter.md'), 'utf8')
    .split('{{date}}')
    .join(new Date().toISOString().slice(0, 10));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, starter, 'utf8');
  console.log(`Wrote ${out}`);
  const rel = path.relative(process.cwd(), out);
  console.log(`Next: benchdoc ${rel.startsWith('..') ? out : rel} -t docs`);
}

main();
