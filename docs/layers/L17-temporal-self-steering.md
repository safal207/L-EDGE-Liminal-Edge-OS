# L17 — Temporal Self-Steering Layer

L17 adds a **temporal self-guidance dimension** on top of the organism’s existing ontogenesis and autopoietic stability stack (L0–L16).

## Core ideas

- The organism maintains a **TemporalState**
  - `T_past`: a bounded history of snapshots (axes, phase, stability, feeling)
  - `T_now`: the current snapshot (tri-axis, phase, stability, tension)
  - `T_future`: goal-oriented projections (optional)
- From this timeline the layer computes:
  - `TemporalMetastabilityIndex (TMI)` — how “in transition” the organism is over time
  - `DriftScore` — how much the trajectory is drifting
  - `GoalAlignmentScore` — how well the current path aligns with intent/goals
- The metrics are folded into a **TimeCrystalVector**
  - proposed `deltaAxes` (inner/social/cosmic adjustments)
  - a `targetPhase` to aim for
  - `confidence` and `horizonSteps` to express guidance strength
- The layer outputs a **TemporalSteeringDecision**
  - `mode`: `stabilize | explore | consolidate`
  - `safeToAdjust`: whether it is safe to apply strong changes now
  - `warningLevel`: `low | medium | high`

> Intuitively: L17 is where the organism says, “I know where I came from, where I am, and where I can go next — without breaking my own integrity.”

## Types (high level)
- **TemporalSnapshot**: single time slice (axes, phase, stability, feeling)
- **TemporalState**: `{ past, now, future, autopoietic }`
- **TemporalMetastabilityIndex**: composite of stability, drift, and transition feeling
- **TimeCrystalVector**: proposed directional change + confidence + horizon
- **TemporalSteeringDecision**: mode + safety + warning level

## How it’s built
1. The pipeline builds a `TemporalSnapshot` from tri-axis, metabolic/autopoietic data, and goal projection.
2. Recent history is attached to form `TemporalState`.
3. Metrics are computed (`TMI`, `drift`, `alignment`).
4. A `TimeCrystalVector` is synthesized and turned into a `TemporalSteeringDecision`.

## Integration points
- **OrganismSnapshot** now carries `temporal.state`, `temporal.timeCrystal`, and `temporal.decision`.
- **OntogenesisVector** stores a compact temporal view (TMI, drift, alignment, mode, warning).
- Debug rendering prints the temporal block alongside L9–L16 metrics.

## Example
```ts
import { buildTemporalState, proposeTemporalSteeringDecision } from '@/core/temporal';

const { state, steering } = buildTemporalState({
  triAxis,
  stage: 17,
  autopoietic,
  metabolism,
  goalProjection: { targetAxes: { inner: 0.5, social: 0.4, cosmic: 0.3 }, horizonSteps: 8 },
  temporalHistory: recentHistory,
});

console.log(steering.mode, steering.warningLevel, steering.vector.tmi.value);
```

L17 does **not** directly change the organism. It provides temporal guidance that other layers (e.g., growth modes, response layer, UI/agents) can read to adapt behavior safely.
