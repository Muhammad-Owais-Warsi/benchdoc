'use strict';

/**
 * Expandable table rows. Fenced block:
 *
 *   ```checktable
 *   {"columns": ["Status", "Check"],
 *    "rows": [
 *      {"cells": ["pass", "The code actually builds"],
 *       "fields": {"Applies because": "...", "Verdict": "..."}},
 *      {"cells": ["pass", "Nothing retired is used"]}
 *    ]}
 *   ```
 *
 * Renders a real table. Rows that carry fields expand in place
 * (click, Enter or Space); rows without fields stay static.
 * First-column values pass/fail/warn render as pills. Invalid JSON
 * falls back to a plain code block. No animation.
 */

const STATUS_CLASS = {
  pass: 'pill-pass',
  fail: 'pill-fail',
  warn: 'pill-warn',
  warning: 'pill-warn',
};

function plugin(md) {
  const prev =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const lang = (tokens[idx].info || '').trim().split(/\s+/u)[0].toLowerCase();
    if (lang !== 'checktable') return prev(tokens, idx, options, env, self);

    let data;
    try {
      data = JSON.parse(tokens[idx].content);
    } catch (_) {
      return prev(tokens, idx, options, env, self);
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return prev(tokens, idx, options, env, self);
    }
    const columns = Array.isArray(data.columns)
      ? data.columns.map((c) => String(c))
      : [];
    const rows = (Array.isArray(data.rows) ? data.rows : []).filter(
      (r) => r && typeof r === 'object' && Array.isArray(r.cells),
    );
    if (!columns.length || !rows.length) return prev(tokens, idx, options, env, self);

    const esc = md.utils.escapeHtml;
    const head =
      `<thead><tr>${columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>`;

    const renderCell = (cell, first) => {
      if (!first) return `<td>${esc(String(cell ?? ''))}</td>`;
      const key = String(cell ?? '').toLowerCase();
      if (STATUS_CLASS[key]) {
        return `<td><span class="pill ${STATUS_CLASS[key]}">${esc(String(cell).toUpperCase())}</span></td>`;
      }
      return `<td>${esc(String(cell ?? ''))}</td>`;
    };

    const renderFields = (fields) => {
      if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return '';
      return Object.entries(fields)
        .filter(([, v]) => v !== undefined && v !== null && String(v) !== '')
        .map(
          ([k, v]) =>
            `<div class="check-field"><p class="check-label">${esc(String(k))}</p>` +
            `<p class="check-text">${esc(String(v))}</p></div>`,
        )
        .join('');
    };

    const body = rows
      .map((r) => {
        const cells = r.cells.map((c, i) => renderCell(c, i === 0)).join('');
        const detail = renderFields(r.fields);
        if (!detail) {
          return `<tr>${cells}</tr>`;
        }
        return (
          `<tr class="checktable-row" data-expand tabindex="0" aria-expanded="false">${cells}</tr>` +
          `<tr class="checktable-detail" hidden><td colspan="${columns.length}">${detail}</td></tr>`
        );
      })
      .join('');

    return (
      `<div class="checktable-wrap">` +
      `<table class="checktable">${head}<tbody>${body}</tbody></table>` +
      `</div>`
    );
  };
}

module.exports = plugin;
