'use strict';

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function plugin(md) {
  const used = Object.create(null);

  md.core.ruler.push('heading_anchors', (state) => {
    // Reset per document
    for (const k of Object.keys(used)) delete used[k];

    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'heading_open') continue;
      const inline = tokens[i + 1];
      if (!inline || inline.type !== 'inline') continue;

      const text = inline.children
        .filter((c) => c.type === 'text' || c.type === 'code_inline')
        .map((c) => c.content)
        .join('');

      let id = slugify(text) || 'section';
      if (used[id]) {
        used[id] += 1;
        id = `${id}-${used[id]}`;
      } else {
        used[id] = 1;
      }

      tokens[i].attrSet('id', id);
    }
  });
}

module.exports = plugin;
