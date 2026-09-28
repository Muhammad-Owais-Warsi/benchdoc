'use strict';

/**
 * Build the landing page's live examples: full benchdoc reports
 * rendered into demo/ so visitors can open them. Runs automatically
 * before build:landing (see package.json prebuild hook wiring).
 */

const fs = require('fs');
const path = require('path');
const { render } = require('../src/render');

const ROOT = path.join(__dirname, '..');

const DEMOS = [
  { input: 'examples/quasar.md', out: 'demo/quasar-one.html', theme: 'one' },
  { input: 'examples/quasar.md', out: 'demo/quasar-ayu.html', theme: 'ayu' },
  { input: 'examples/charts.md', out: 'demo/charts-one.html', theme: 'one' },
];

function main() {
  for (const d of DEMOS) {
    const inFile = path.join(ROOT, d.input);
    const outFile = path.join(ROOT, d.out);
    const source = fs.readFileSync(inFile, 'utf8');
    const html = render(source, {
      baseDir: path.dirname(inFile),
      theme: d.theme,
      fallbackTitle: path.basename(inFile, path.extname(inFile)),
    });
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, html, 'utf8');
    console.log(`Wrote ${outFile}`);
  }
}

main();
