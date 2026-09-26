'use strict';

/**
 * Wrap fenced code blocks with a toolbar (lang label + copy button).
 * bash / sh / console / shell / terminal / zsh / powershell get terminal chrome.
 */
const TERMINAL = new Set(['bash', 'sh', 'shell', 'console', 'terminal', 'zsh', 'powershell', 'ps1', 'cmd']);

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
    const isTerminal = TERMINAL.has(lang.toLowerCase());

    const highlighted = fence(tokens, idx, options, env, self);

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
