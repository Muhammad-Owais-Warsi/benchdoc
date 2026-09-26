---
title: Design review — light theme check
subtitle: Checking spacing, type, code, callouts and tables at a glance
author: Owais
date: 2026-09-26
toc: true
---

## Summary

This page exercises every component so we can judge whether the design feels **light**, calm and spacious. Body copy should feel quiet, with plenty of air between sections.

Short paragraph. Then a longer one to check line length and rhythm. The quick brown fox jumps over the lazy dog again and again while we measure how comfortable extended reading feels on a light background with generous line height.

> A plain quote for contrast. It should sit back quietly and not compete with the body text.

## Callouts

> [!NOTE]
> Note — neutral information. Links like [benchdoc](https://example.com) and `inline code` should still read well inside.

> [!TIP]
> Tip — success state. Everything is within budget and easy to scan.

> [!IMPORTANT]
> Important — worth a second look, but not shouting.

> [!WARNING]
> Warning — cold cache still pushes p99 to **48 ms** for ~90 seconds after deploys.

> [!CAUTION]
> Caution — do **not** enable the cache on multi-tenant pods until key isolation is reviewed.

## Code

Inline `authbench --rps 200` should blend in, not jump out.

```bash
authbench run \
  --target staging-auth-3 \
  --rps 200 \
  --duration 5m \
  --compare main release/2.4
```

```python
def p99(latencies):
    """Soft green strings, muted blue keywords."""
    xs = sorted(latencies)
    k = max(0, int(len(xs) * 0.99) - 1)
    return xs[k]  # calm comment
```

```json
{
  "results": [
    { "command": "main", "mean": 0.0068, "stddev": 0.0011 },
    { "command": "release/2.4", "mean": 0.0044, "stddev": 0.0007 }
  ]
}
```

## Results

| Metric | main | release/2.4 | Δ |
| --- | ---: | ---: | ---: |
| p50 | 6.2 ms | 4.1 ms | −34% |
| p95 | 18.4 ms | 11.9 ms | −35% |
| p99 | 41.0 ms | 22.7 ms | −45% |
| error rate | 0.02% | 0.01% | −0.01 pp |
| CPU (avg) | 41% | 38% | −3 pp |

### A smaller heading (h3)

Body under h3 should still have the same relaxed rhythm. Lists should breathe:

- First item with a little more space
- Second item with `code` and a [link](https://example.com)
- Third item

1. Ordered step one
2. Ordered step two
3. Ordered step three

#### Tiny h4 detail

Fine print section, still light.

## Dropdown

<details>
<summary>Raw hyperfine JSON (truncated)</summary>

```json
{ "truncated": true, "reason": "kept short for visual check" }
```

Some text after code inside the dropdown to check inner spacing.

</details>

## Follow-ups

- [x] Land cache behind a flag
- [x] Re-run load test on staging
- [ ] Warm-up script before traffic cutover
- [ ] Multi-tenant key review

---

Footnote test[^1]. Final line to see footer spacing.

[^1]: Footnotes should sit quietly at the bottom, smaller and muted.
