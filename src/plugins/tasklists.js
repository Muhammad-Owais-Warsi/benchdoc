'use strict';

/**
 * GFM task lists: - [ ] and - [x]
 */
function plugin(md) {
  md.core.ruler.after('inline', 'task_lists', (state) => {
    const tokens = state.tokens;
    for (let i = 2; i < tokens.length; i++) {
      if (tokens[i].type !== 'inline') continue;
      if (tokens[i - 1].type !== 'paragraph_open') continue;
      if (tokens[i - 2].type !== 'list_item_open') continue;

      const content = tokens[i].content;
      const m = content.match(/^\[([ xX])\]\s+/);
      if (!m) continue;

      const checked = m[1].toLowerCase() === 'x';
      tokens[i - 2].attrJoin('class', 'task-list-item');
      if (checked) tokens[i - 2].attrJoin('class', 'is-checked');

      // Mark parent ul
      for (let k = i - 3; k >= 0; k--) {
        if (tokens[k].type === 'bullet_list_open') {
          tokens[k].attrJoin('class', 'task-list');
          break;
        }
        if (tokens[k].type === 'bullet_list_close') break;
      }

      const checkbox = new state.Token('html_inline', '', 0);
      checkbox.content =
        `<input class="task-list-checkbox" type="checkbox" disabled${checked ? ' checked' : ''} /> `;

      tokens[i].content = content.slice(m[0].length);
      if (tokens[i].children && tokens[i].children.length) {
        const first = tokens[i].children[0];
        if (first.type === 'text') {
          first.content = first.content.replace(/^\[([ xX])\]\s+/, '');
        }
        tokens[i].children.unshift(checkbox);
      } else {
        tokens[i].children = [checkbox];
      }
    }
  });
}

module.exports = plugin;
