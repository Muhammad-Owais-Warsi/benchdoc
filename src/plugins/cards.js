'use strict';

/**
 * Cards. Fenced block with the landing page's card look:
 *
 *   ```cards
 *   [{"title": "One file out", "text": "Everything is inlined."}]
 *   ```
 *
 * Renders a responsive grid of bordered cards (title + text).
 * Invalid JSON or no usable cards falls back to a plain code block.
 * No JS, no animation.
 */

function plugin(md) {
  const prev =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const lang = (tokens[idx].info || '').trim().split(/\s+/u)[0].toLowerCase();
    if (lang !== 'cards') return prev(tokens, idx, options, env, self);

    let data;
    try {
      data = JSON.parse(tokens[idx].content);
    } catch (_) {
      return prev(tokens, idx, options, env, self);
    }
    const cards = (Array.isArray(data) ? data : [])
      .filter((c) => c && typeof c === 'object')
      .map((c) => ({ title: String(c.title ?? ''), text: String(c.text ?? '') }))
      .filter((c) => c.title || c.text);
    if (!cards.length) return prev(tokens, idx, options, env, self);

    const esc = md.utils.escapeHtml;
    const body = cards
      .map(
        (c) =>
          `<div class="rounded-lg border border-border bg-card p-5">` +
          (c.title ? `<p class="mb-1.5 text-sm font-medium">${esc(c.title)}</p>` : '') +
          (c.text ? `<p class="text-sm leading-relaxed text-muted-foreground">${esc(c.text)}</p>` : '') +
          `</div>`,
      )
      .join('');

    return (
      `<div class="cards-grid my-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Cards">` +
      body +
      `</div>`
    );
  };
}

module.exports = plugin;
