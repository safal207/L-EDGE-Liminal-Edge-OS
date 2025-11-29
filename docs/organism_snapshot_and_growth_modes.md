# Organism Snapshot & Growth Modes (L9–L11)

This document describes the unified organism snapshot emitted by the heartbeat
pipeline and the L11 Growth Modes layer that interprets the snapshot into a
concise growth posture.

## Overview
- **OrganismSnapshot** is the consolidated state for the living system. It keeps
  the current tri-axis levels (L/S/C), metabolic supervision (L9), crystal growth
  signals (L10), the resolved growth mode (L11), and the autopoietic multiframe
  state (L16).
- **Growth Modes (L11)** read the snapshot and pick a lightweight development
  posture (gentle/intensive/therapeutic/stabilizing/exploratory/frozen) with
  confidence and recommendations for orchestration.

## Snapshot structure
- `triAxis` — `TriAxisState` (L/S/C): value, nourishment, pressure per axis.
- `stage` — numeric assembly point / maturity marker.
- `orientation` — optional orientation snapshot (L0 family).
- `observer` — optional crystal observer snapshot (L8).
- `metabolism` — L9 metabolic snapshot with `stressIndex`, `recoveryScore`,
  `overloadRisk`, `mode`, `overloadAxes`.
- `crystal` — L10 crystal snapshot with `harmonyIndex`, `growthMomentum`,
  `stabilityIndex`, `overallScore`, and `preferredAdjustments`.
- `growthMode` — L11 growth mode snapshot (see below).
- `autopoietic` — L16 multiframe/immune snapshot with `tensegrityPotential`,
  immune cycle phase, and stability metrics.
- `timestamp` — epoch ms when the snapshot was produced.

## Growth Modes (L11)
Available modes:
- **gentle** — balanced, low stress; ok to proceed with normal tasks.
- **intensive** — high growth capacity; system can push harder.
- **therapeutic** — needs recovery; reduce load and prioritize repair.
- **stabilizing** — hold stability; throttle risky moves and short tasks.
- **exploratory** — healthy and curious; allow experiments and async work.
- **frozen** — overload or chaos; pause non-critical tasks and cool down.

Each mode includes:
- `confidence` (0..1) — how confident the layer is in the chosen mode.
- `reason` — one of: `balanced_low_stress`, `high_growth_capacity`,
  `needs_deep_recovery`, `stability_priority`, `room_for_exploration`,
  `overload_or_chaos`.
- `recommendations` — optional flags for orchestration:
  - `throttle` / `pauseNonCritical`
  - `preferAsync` / `preferShortTasks`
  - `allowExploration`

## Using in code
```ts
import { runOrganismPipeline } from '@/core/organismPipeline';
import { renderOrganismSnapshot } from '@/debug/renderOrganismSnapshot';

const snapshot = runOrganismPipeline({
  triAxis,
  stage: 10,
  loadIndex: 0.45,
  resonanceQuality: 0.62,
  recentRecoveryIndex: 0.7,
});

console.log(snapshot.growthMode);
renderOrganismSnapshot(snapshot); // colorized console output for L9–L11
```

## Use cases
- **Load adaptation:** throttle or pause non-critical tasks when `frozen` or
  `therapeutic`.
- **Experiment windows:** allow exploration when `exploratory` with high
  confidence.
- **Health checks:** monitor `stressIndex`, `overloadRisk`, and `harmonyIndex`
  trends together with the growth mode to spot chronic overloads.
- **External orchestration:** use recommendations to steer scheduling (async,
  short tasks, or recovery-first).
