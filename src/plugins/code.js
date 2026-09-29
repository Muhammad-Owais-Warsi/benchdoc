'use strict';

/**
 * Wrap fenced code blocks with a toolbar (lang label + copy button).
 * bash / sh / console / shell / terminal / zsh / powershell get terminal chrome.
 */
const TERMINAL = new Set(['bash', 'sh', 'shell', 'console', 'terminal', 'zsh', 'powershell', 'ps1', 'cmd']);

// Fence languages owned by other plugins (see tokens.js, charts.js).
const DATA_LANGS = new Set(['tokens', 'chart', 'donut', 'line', 'cards', 'checktable']);

function plugin(md) {
  const fence =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const info = (token.info || '').trim();
    const lang = info.split(/\s+/u)[0] || '';

    const highlighted = fence(tokens, idx, options, env, self);

    // Data fences that rendered into components stay toolbar-free.
    // Their fallbacks (bad/empty data) get the normal code chrome + label.
    if (DATA_LANGS.has(lang.toLowerCase())) {
      if (
        highlighted.includes('token-bar') ||
        highlighted.includes('<figure class="chart') ||
        highlighted.includes('cards-grid') ||
        highlighted.includes('checktable')
      ) {
        return highlighted;
      }
    }

    const isTerminal = TERMINAL.has(lang.toLowerCase());

    // fence already returns <pre><code>...</code></pre>
    const label = lang || 'code';
    const kind = isTerminal ? 'terminal' : 'code';

    return (
      `<div class="code-block ${kind}" data-lang="${md.utils.escapeHtml(label)}">` +
      `<div class="code-header">` +
      `<span class="code-lang">${md.utils.escapeHtml(label)}</span>` +
      `<button type="button" class="code-copy" data-copy aria-label="Copy">Copy</button>` +
      `</div>` +
      highlighted +
      `</div>`
    );
  };
}

module.exports = plugin;
