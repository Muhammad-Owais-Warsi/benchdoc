'use strict';

/**
 * GitHub-style alerts:
 * > [!NOTE]
 * > [!TIP]
 * > [!IMPORTANT]
 * > [!WARNING]
 * > [!CAUTION]
 *
 * Mapped to note / tip / important / warning / fail boxes.
 */

const TYPES = {
  NOTE: { className: 'alert-note', label: 'Note' },
  TIP: { className: 'alert-tip', label: 'Tip' },
  IMPORTANT: { className: 'alert-important', label: 'Important' },
  WARNING: { className: 'alert-warning', label: 'Warning' },
  CAUTION: { className: 'alert-fail', label: 'Caution' },
  RESULT: { className: 'alert-result', label: 'Result' },
  FAIL: { className: 'alert-fail', label: 'Fail' },
};

function plugin(md) {
  md.core.ruler.after('block', 'github_alerts', (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type !== 'blockquote_open') continue;

      // Find first paragraph inline inside this blockquote
      let j = i + 1;
      while (j < tokens.length && tokens[j].type !== 'blockquote_close') {
        if (
          tokens[j].type === 'inline' &&
          tokens[j - 1] &&
          tokens[j - 1].type === 'paragraph_open'
        ) {
          break;
        }
        j++;
      }
      if (j >= tokens.length || tokens[j].type !== 'inline') continue;

      const inline = tokens[j];
      const match = inline.content.match(/^\[!([A-Za-z]+)\]\s*(?:\r?\n)?/);
      if (!match) continue;

      const key = match[1].toUpperCase();
      const info = TYPES[key];
      if (!info) continue;

      t.attrJoin('class', `alert ${info.className}`);
      t.attrSet('data-alert', key.toLowerCase());

      // Strip marker from content
      inline.content = inline.content.slice(match[0].length);
      if (inline.children && inline.children.length) {
        // Rebuild children from remaining content
        const remaining = inline.content;
        inline.children = [];
        if (remaining) {
          state.md.inline.parse(remaining, state.md, state.env, inline.children);
        }
      }

      // Inject a title token before the first paragraph
      const titleOpen = new state.Token('html_block', '', 0);
      titleOpen.content = `<div class="alert-title">${info.label}</div>`;
      tokens.splice(i + 1, 0, titleOpen);
    }
  });
}

module.exports = plugin;
