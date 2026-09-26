---
title: Latency regression — auth service
subtitle: Comparing main vs release/2.4 under sustained load
author: Owais
date: 2026-09-26
template: report
---

## Summary

We re-ran the auth hot path after the token-cache change. Median latency is back under budget; p99 still spikes when Redis is cold.

> [!TIP]
> **Pass.** p50 and p95 are within SLO. Ship the change; keep watching cold-start p99.

> [!WARNING]
> Cold cache after deploys still pushes p99 to **48 ms** for ~90 seconds. Need a warm-up job before cutting traffic.

## Method

- Tool: `hyperfine` + internal loadgen (`authbench`)
- Target: `staging-auth-3`
- Duration: 5 minutes sustained, 200 RPS
- Commit: `a3f91c2` (dirty: no)

```bash
authbench run \
  --target staging-auth-3 \
  --rps 200 \
  --duration 5m \
  --compare main release/2.4
```

## Results

| Metric | main | release/2.4 | Δ |
| --- | ---: | ---: | ---: |
| p50 | 6.2 ms | 4.1 ms | −34% |
| p95 | 18.4 ms | 11.9 ms | −35% |
| p99 | 41.0 ms | 22.7 ms | −45% |
| error rate | 0.02% | 0.01% | −0.01 pp |
| CPU (avg) | 41% | 38% | −3 pp |

<details>
<summary>Raw hyperfine JSON (truncated)</summary>

```json
{
  "results": [
    { "command": "main", "mean": 0.0068, "stddev": 0.0011 },
    { "command": "release/2.4", "mean": 0.0044, "stddev": 0.0007 }
  ]
}
```

</details>

## What changed

1. In-process JWT verify cache (LRU, 10k entries, 60s TTL)
2. Removed a redundant Redis `EXISTS` on every refresh
3. Connection pool raised from 8 → 24

> [!NOTE]
> Numbers above exclude the first 30 seconds after process start.

> [!CAUTION]
> Do **not** enable the cache on multi-tenant pods until key isolation is reviewed — keys currently include only `sub`, not `tenant_id`.

## Follow-ups

- [x] Land cache behind a flag
- [x] Re-run load test on staging
- [ ] Warm-up script before traffic cutover
- [ ] Multi-tenant key review

## Notes

Diff vs last week’s run is mostly the cache; pool size alone was ~8% on p95.
