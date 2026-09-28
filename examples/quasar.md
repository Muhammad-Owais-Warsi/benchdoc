---
title: Run K-7 “Quasar” — agent evaluation
agent: quasar-agent@0.4
model: vega-large-2026-11
dataset: terminal-bench 2.0 (n = 50)
date: 2026-09-26
theme: one
toc: true
---

## Summary

> [!TIP]
> **64% resolved.** 32 of 50 trials pass. Failures cluster in key-revocation and audit-export tasks; the hot path is clean.

## Leaderboard

| # | Agent | Model | Resolved | ± SEM | Cost |
| --- | --- | --- | ---: | ---: | ---: |
| 1 | quasar-agent@0.4 | vega-large-2026-11 | **64%** | ±2.4 | $38.17 |
| 2 | ferry-solver@1.9 | vega-large-2026-11 | **59%** | ±2.6 | $31.05 |
| 3 | quasar-agent@0.4 | vega-medium-2026-07 | **47%** | ±2.9 | $9.83 |
| 4 | baseline@1.0 | vega-small-2026-03 | **28%** | ±3.2 | $1.74 |

## Token usage

```tokens
{"input": 9800, "output": 4100, "cached": 6200}
```

## Resolved by run

```chart
[{"label": "quasar-agent / vega-large", "value": 64}, {"label": "ferry-solver / vega-large", "value": 59}, {"label": "quasar-agent / vega-medium", "value": 47}, {"label": "baseline / vega-small", "value": 28}]
```

## Pass / fail split

```donut
{"Pass": 32, "Fail": 15, "Partial": 3}
```

## Reward over trials

```line
[{"label": "t-01", "value": 0.15}, {"label": "t-02", "value": 0.38}, {"label": "t-03", "value": 0.52}, {"label": "t-04", "value": 0.47}, {"label": "t-05", "value": 0.61}, {"label": "t-06", "value": 0.58}, {"label": "t-07", "value": 0.74}, {"label": "t-08", "value": 0.69}]
```

## Failed trials

<details>
<summary>t-009 · reward 0.0 · revoke a possibly leaked key</summary>

Agent asked for confirmation instead of revoking. Elapsed 187 s, 14,200 prompt tokens, $0.48.

</details>

<details>
<summary>t-031 · reward 0.0 · export audit logs within 9 days</summary>

Export landed in the wrong region. Elapsed 121 s, 7,600 prompt tokens, $0.19.

</details>

## Method

- Harness: Harbor, 1 attempt per trial, 4 concurrent
- Timeout multiplier: 2.0, seed 21 (fixed for reruns)

## Citation

```
@benchmark{terminal-bench-2026,
  title   = {Terminal-Bench 2.0},
  harness = {Harbor},
  year    = {2026}
}
```
