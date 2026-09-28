'use strict';

/**
 * Minimal YAML-ish frontmatter: `key: value` lines between `---` fences.
 * Enough for title / author / date / theme / toc. No dependency needed.
 */
function parse(source) {
  const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: source };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv || /^\s/.test(line)) continue;
    meta[kv[1]] = unquote(kv[2]);
  }
  return { meta, body: source.slice(m[0].length) };
}

function unquote(v) {
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

module.exports = { parse };
