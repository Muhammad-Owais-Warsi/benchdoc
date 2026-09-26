'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Images become <figure> with caption from alt text.
 * Local images can be inlined as data URIs so the HTML is self-contained.
 */
function plugin(md, opts = {}) {
  const baseDir = opts.baseDir || process.cwd();
  const embed = opts.embed !== false;
  const mime = opts.mime || {};

  const defaultRender =
    md.renderer.rules.image ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    let src = token.attrGet('src') || '';
    const alt = token.content || token.attrGet('alt') || '';
    const title = token.attrGet('title') || '';

    // Embed local files
    if (embed && src && !/^([a-z]+:)?\/\//i.test(src) && !src.startsWith('data:')) {
      const filePath = path.resolve(baseDir, src);
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const type = mime[ext];
          if (type) {
            const buf = fs.readFileSync(filePath);
            src = `data:${type};base64,${buf.toString('base64')}`;
            token.attrSet('src', src);
          }
        }
      } catch (_) {
        /* leave original src */
      }
    }

    const img = defaultRender(tokens, idx, options, env, self);

    // Only wrap in figure when there is a caption (alt or title)
    const caption = alt || title;
    if (!caption) return img;

    const esc = md.utils.escapeHtml(caption);
    return `<figure class="figure">${img}<figcaption>${esc}</figcaption></figure>`;
  };
}

module.exports = plugin;
