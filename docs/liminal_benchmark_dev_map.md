# LIMINAL Benchmark Dev Map (v0.1)

This note sketches a lightweight benchmark frame for tracking LIMINAL ontogenesis signals without committing to a full scoring system. It pairs with the ontogenesis snapshot and timeline endpoints so operators can start observing drift and stability.

## What we measure (conceptual only)

* **L-stability** — how volatile the assembly point is over a sliding window.
* **S-steadiness** — whether social age drifts upward/downward given the current environment.
* **C-consistency** — how often the cosmic role changes.

These are intentionally simple to keep the first pass legible and implementable later.

## Draft metrics (per N heartbeats)

* `L_volatility = stddev(assemblyPoint[0..N])`
* `S_growth = (socialAge[N] - socialAge[0]) / N`
* `C_switches = count(cosmicRole[i] !== cosmicRole[i-1])`

The goal is not to rank runs but to see whether a configuration produces smoother ontogenesis traces, fewer role whiplashes, and a gentle upward trend in social maturity.

## How to use now

1. Pull data from `/api/system/ontogenesis/timeline` (or the snapshot endpoint for quick checks).
2. Compute the draft metrics locally in notebooks or quick scripts.
3. Compare runs before/after tuning Resonance, Genesis heuristics, or Hormesis thresholds.

### Quick start scripts

- `examples/ontogenesis_watch.js` streams snapshots + timeline length for a live pulse.
- `examples/ontogenesis_metrics.js` fetches the timeline and prints `L_volatility`, `S_growth`, and `C_switches` every few seconds (configure via `LIMINAL_API`, `LIMINAL_TIMELINE_LIMIT`, `LIMINAL_INTERVAL_MS`).

A fuller benchmark can layer in pressure bands, Genesis readiness counts, and Civilization resonance, but this v0.1 map keeps the first feedback loop extremely simple.
