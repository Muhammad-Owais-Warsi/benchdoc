'use strict';

/**
 * Token-usage bar. Fenced block:
 *
 *   ```tokens
 *   {"input": 12500, "output": 3200, "cached": 8000}
 *   ```
 *
 * Renders a stacked bar (widths = share of total) with a value legend.
 * Hovering a segment names it via a native tooltip. Invalid JSON or an
 * all-zero total falls back to a plain code block.
 */

const SEGMENTS = [
  { key: 'input', label: 'Input', className: 'token-seg-input' },
  { key: 'output', label: 'Output', className: 'token-seg-output' },
  { key: 'cached', label: 'Cached', className: 'token-seg-cached' },
];

function fmt(n) {
  return Number(n).toLocaleString('en-US');
}

function plugin(md) {
  const prev =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const lang = (tokens[idx].info || '').trim().split(/\s+/u)[0].toLowerCase();
    if (lang !== 'tokens') return prev(tokens, idx, options, env, self);

    let data;
    try {
      data = JSON.parse(tokens[idx].content);
    } catch (_) {
      return prev(tokens, idx, options, env, self);
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return prev(tokens, idx, options, env, self);
    }

    const vals = SEGMENTS.map((s) => ({ ...s, value: Number(data[s.key]) || 0 }));
    const total = vals.reduce((a, s) => a + s.value, 0);
    if (total <= 0) return prev(tokens, idx, options, env, self);

    const esc = md.utils.escapeHtml;
    const segs = vals
      .filter((s) => s.value > 0)
      .map((s) => {
        const pct = (s.value / total) * 100;
        return (
          `<div class="token-seg ${s.className}" style="width:${pct.toFixed(2)}%"` +
          ` title="${esc(s.label)}: ${esc(fmt(s.value))} tokens (${pct.toFixed(1)}%)"></div>`
        );
      })
      .join('');
    const legend = vals
      .map(
        (s) =>
          `<li><span class="token-dot ${s.className}"></span>` +
          `<span>${esc(s.label)}</span>` +
          `<span class="token-val">${esc(fmt(s.value))}</span></li>`,
      )
      .join('');
    const aria = vals.map((s) => `${s.label} ${fmt(s.value)}`).join(', ');

    return (
      `<figure class="token-bar" role="img" aria-label="Token usage: ${esc(aria)}">` +
      `<div class="token-track">${segs}</div>` +
      `<ul class="token-legend">${legend}</ul>` +
      `</figure>`
    );
  };
}

module.exports = plugin;
