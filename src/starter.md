---
title: My report
subtitle: One line describing what this covers
author: You
date: {{date}}
template: report
toc: true
brand: benchdoc
footer: My report
---

## Summary

Start here. Delete everything you don't need — headings, callouts,
code, tables, dropdowns and tasks below all work out of the box.

> [!NOTE]
> Quiet notices. Also try [!TIP], [!IMPORTANT], [!WARNING] and [!CAUTION].

## Code

Inline `code` blends in. Fenced blocks get a copy button:

```bash
benchdoc report.md -t docs
```

## Results

| Metric | Before | After |
| --- | ---: | ---: |
| p95 | 18.4 ms | 11.9 ms |

<details>
<summary>Extra detail goes here</summary>

Hidden until opened. Good for raw logs.

</details>

## Follow-ups

- [x] Done thing
- [ ] Next thing

---

Footnote test[^1].

[^1]: Footnotes sit quietly at the bottom.
