# benchdoc

Turn a Markdown file into **one self-contained HTML report** you can send as a file. No GitHub push, no online paste tool, no React.

```bash
benchdoc report.md
# → report.html
```

## Install

```bash
npm install -g benchdoc
```

## Usage

```bash
benchdoc init               # starter report.md in this folder
benchdoc init notes/q3.md   # starter at a path
benchdoc input.md
benchdoc input.md -o out.html
benchdoc input.md -t docs
benchdoc themes
benchdoc --help
```

### Themes

| Name | Look |
| --- | --- |
| `paper` (default) | Warm paper tones |
| `docs` | Neutral minimal |
| `mono` | Monochrome — grays only |

Pick via `-t` or frontmatter `template:`.

### Frontmatter (optional)

```yaml
---
title: Latency regression
subtitle: main vs release/2.4
author: You
date: 2026-09-26
  template: report
  toc: true
  brand: benchdoc
  footer: Latency regression
---
```

If `title` is set, it's used as the document header. Otherwise the first `#` heading wins.

Top bar and footer are on every page by default: the top bar shows `brand` (default `benchdoc`) + title, the footer shows `footer` (default: the title) + `Built with benchdoc`.

## What works

Everything normal Markdown + GFM already supports:

- Headings, lists, tables, links, images, footnotes
- Task lists: `- [ ]` / `- [x]`
- Fenced code with highlighting + copy button
- `bash` / `console` / `shell` → terminal chrome
- GitHub alerts → styled callouts:

```markdown
> [!NOTE]
> Note

> [!TIP]
> Result / success

> [!WARNING]
> Warning

> [!CAUTION]
> Failure / danger

> [!IMPORTANT]
> Important
```

- `<details><summary>…</summary>` → styled dropdown
- Images with alt text → figure + caption; local images are inlined into the HTML



## Output

One `.html` file. CSS, fonts, images, and a tiny copy-button script are all inside it. Attach it, dropbox it, email it.

Link sharing comes later.
