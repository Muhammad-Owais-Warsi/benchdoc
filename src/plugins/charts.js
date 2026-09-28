'use strict';

/**
 * Charts. Fenced blocks, one per type (examples: examples/charts.md):
 *
 *   ```chart  horizontal bars
 *   ```donut  share ring (pass/fail splits)
 *   ```line   single SVG line series
 *
 * Data is either [{"label","value"}] or {"label": value}.
 * Hovering names the datum via a native tooltip. Invalid input falls
 * back to a plain code block. No JS, no animation.
 */

const PALETTE = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];

function parseRows(data) {
  let rows = [];
  if (Array.isArray(data)) {
    rows = data
      .filter((r) => r && typeof r === 'object')
      .map((r) => ({ label: String(r.label ?? ''), value: Number(r.value) }))
      .filter((r) => r.label && Number.isFinite(r.value));
  } else if (data && typeof data === 'object') {
    rows = Object.entries(data)
      .map(([label, value]) => ({ label: String(label), value: Number(value) }))
      .filter((r) => Number.isFinite(r.value));
  }
  return rows;
}

function num(v) {
  return String(parseFloat(Number(v).toFixed(3)));
}

// Nice round axis ticks (1/2/5 × 10^k) so labels read 0/25/50, never -23.5.
function niceTicks(min, max, n = 4) {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const raw = (max - min) / n;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
  const ticks = [];
  const start = Math.ceil(min / step - 1e-9) * step;
  for (let v = start, k = 0; v <= max + step * 1e-9 && k < 12; v = start + ++k * step) {
    ticks.push(+((start + k * step).toFixed(10)));
  }
  return { min, max, step, ticks };
}

function horizontal(md, rows) {
  const esc = md.utils.escapeHtml;
  const max = rows.reduce((a, r) => Math.max(a, r.value), 0);
  const body = rows
    .map((r) => {
      const pct = (r.value / max) * 100;
      const top = r.value === max ? ' chart-top' : '';
      return (
        `<div class="chart-row" title="${esc(r.label)}: ${esc(num(r.value))}">` +
        `<span class="chart-label">${esc(r.label)}</span>` +
        `<span class="chart-track"><span class="chart-fill${top}" style="width:${pct.toFixed(2)}%"></span></span>` +
        `<span class="chart-value">${esc(num(r.value))}</span>` +
        `</div>`
      );
    })
    .join('');
  return `<figure class="chart" role="img" aria-label="Bar chart with ${rows.length} rows">${body}</figure>`;
}

function donut(md, rows) {
  const esc = md.utils.escapeHtml;
  const clean = rows.map((r) => ({ label: r.label, value: Math.max(0, r.value) }));
  const total = clean.reduce((a, r) => a + r.value, 0);
  if (total <= 0) return null;
  let acc = 0;
  const stops = clean
    .map((r, i) => {
      const from = (acc / total) * 100;
      acc += r.value;
      const to = (acc / total) * 100;
      const c = `var(${PALETTE[i % PALETTE.length]})`;
      return `${c} ${from.toFixed(2)}% ${to.toFixed(2)}%`;
    })
    .join(', ');
  const legend = clean
    .map((r, i) => {
      const pct = (r.value / total) * 100;
      return (
        `<li><span class="token-dot" style="background:var(${PALETTE[i % PALETTE.length]})"></span>` +
        `<span>${esc(r.label)}</span>` +
        `<span class="token-val">${esc(num(r.value))} · ${pct.toFixed(1)}%</span></li>`
      );
    })
    .join('');
  const aria = clean.map((r) => `${r.label} ${num(r.value)}`).join(', ');
  return (
    `<figure class="chart donut-wrap" role="img" aria-label="Donut chart: ${esc(aria)}">` +
    `<div class="donut" style="background:conic-gradient(${stops})" title="${esc(aria)}">` +
    `<span class="donut-center">${esc(num(total))}</span></div>` +
    `<ul class="token-legend">${legend}</ul>` +
    `</figure>`
  );
}

function line(md, rows) {
  const esc = md.utils.escapeHtml;
  const W = 600;
  const H = 200;
  const pad = { l: 38, r: 10, t: 12, b: 26 };
  const dom = niceTicks(
    Math.min(...rows.map((r) => r.value)),
    Math.max(...rows.map((r) => r.value)),
    4,
  );
  const X = (i) => pad.l + (rows.length < 2 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (rows.length - 1));
  const Y = (v) => pad.t + (1 - (v - dom.min) / (dom.max - dom.min)) * (H - pad.t - pad.b);
  const f = (v) => num(v);

  let grid = '';
  for (const v of dom.ticks) {
    const y = Y(v).toFixed(1);
    grid +=
      `<line class="line-grid" x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}"/>` +
      `<text class="line-tick" x="${pad.l - 6}" y="${(+y + 3.5).toFixed(1)}" text-anchor="end">${esc(f(v))}</text>`;
  }
  const pts = rows.map((r, i) => `${X(i).toFixed(1)},${Y(r.value).toFixed(1)}`).join(' ');
  const firstX = X(0).toFixed(1);
  const lastX = X(rows.length - 1).toFixed(1);
  const baseY = Y(dom.min).toFixed(1);
  const step = Math.ceil(rows.length / 8);
  let labels = '';
  rows.forEach((r, i) => {
    if (i % step !== 0 && i !== rows.length - 1) return;
    labels += `<text class="line-tick" x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${esc(r.label)}</text>`;
  });
  const dots = rows
    .map(
      (r, i) =>
        `<circle class="line-dot" cx="${X(i).toFixed(1)}" cy="${Y(r.value).toFixed(1)}" r="4">` +
        `<title>${esc(r.label)}: ${esc(f(r.value))}</title></circle>`,
    )
    .join('');

  return (
    `<figure class="chart" role="img" aria-label="Line chart with ${rows.length} points">` +
    `<svg class="line-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">` +
    `${grid}` +
    `<polygon class="line-area" points="${firstX},${baseY} ${pts} ${lastX},${baseY}"/>` +
    `<polyline class="line-series" points="${pts}"/>` +
    `${dots}${labels}` +
    `</svg></figure>`
  );
}

function plugin(md) {
  const prev =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const lang = (tokens[idx].info || '').trim().split(/\s+/u)[0].toLowerCase();
    if (lang !== 'chart' && lang !== 'donut' && lang !== 'line') {
      return prev(tokens, idx, options, env, self);
    }

    let data;
    try {
      data = JSON.parse(tokens[idx].content);
    } catch (_) {
      return prev(tokens, idx, options, env, self);
    }

    const rows = parseRows(data);
    if (!rows.length) return prev(tokens, idx, options, env, self);

    if (lang === 'donut') return donut(md, rows) || prev(tokens, idx, options, env, self);
    if (lang === 'line') return line(md, rows);
    const max = rows.reduce((a, r) => Math.max(a, r.value), 0);
    if (max <= 0) return prev(tokens, idx, options, env, self);
    return horizontal(md, rows);
  };
}

module.exports = plugin;
