---
title: <benchmark> — <agent> run
agent: my-agent@0.1
model: my-model-2026-01
dataset: my-dataset (n = 20)
date: {{date}}
theme: docs
toc: true
---

## Summary

> [!TIP]
> **Verdict here.** One line: pass or fail, and the one thing that mattered.

## Leaderboard

| # | Agent | Model | Resolved | ± SEM | Cost |
| --- | --- | --- | ---: | ---: | ---: |
| 1 | my-agent@0.1 | my-model-2026-01 | **0%** | ±0.0 | $0.00 |

## Token usage

```tokens
{"input": 0, "output": 0, "cached": 0}
```

## Resolved by run

```chart
[{"label": "my-agent", "value": 0}]
```

## Pass / fail split

```donut
{"Pass": 0, "Fail": 0}
```

## Reward over trials

```line
[{"label": "t-01", "value": 0}, {"label": "t-02", "value": 0}]
```

## Failed trials

<details>
<summary>t-001 · reward 0.0 · what happened</summary>

Elapsed time, tokens, cost, and a one-line cause.

</details>

## Method

- Harness, attempts per trial, concurrency, timeout
- Seed (fix it for reruns)

## Citation

```
@benchmark{my-dataset-2026,
  title   = {My Dataset},
  harness = {my-harness},
  year    = {2026}
}
```
