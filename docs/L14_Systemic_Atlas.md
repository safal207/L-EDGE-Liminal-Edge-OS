# L14 — Systemic Atlas++

The Systemic Atlas models multi-axis behavior for the LIMINAL organism. It is a purely engineering layer: no protocol wiring, only reusable structures and a deterministic fingerprint that can be consumed by observers, dashboards, or downstream agents.

## Components

- **Gate Levels (50)** — complexity/entropy bands for system state.
- **Path Types (32)** — characteristic dynamics (linear, nonlinear, chaotic, adaptive).
- **Behavioral Matrices (64)** — 6-bit patterns for stability/volatility classification.
- **Competence Vectors (72)** — activation capabilities and costs across functional roles.
- **Decision Archetypes (78)** — decision-flow templates (deterministic/probabilistic/multi-branch).
- **Stabilization Modes (4)** — coherence, expansion, protection, integration.
- **Behavioral Modulators (12)** — style modifiers (initiator, stabilizer, connector, etc.).
- **Environmental Drivers (5)** — dominant external pressures (structure, energy, flow, dynamics, charge).

`computeAtlasFingerprint` picks one item from each class based on the current `OrganismSnapshot` and returns a concise summary string.

## Data structures

Each dataset lives under `src/atlas/`:

- `gates.ts` → `GateLevel`
- `paths.ts` → `PathType`
- `behavior_matrices.ts` → `BehavioralMatrix`
- `competence_vectors.ts` → `CompetenceVector`
- `decision_archetypes.ts` → `DecisionArchetype`
- `stabilization_modes.ts` → `StabilizationMode`
- `behavior_modulators.ts` → `BehavioralModulator`
- `environment_drivers.ts` → `EnvironmentalDriver`
- `full_atlas.ts` → `AtlasResult`, `computeAtlasFingerprint`

## Fingerprint flow

`computeAtlasFingerprint(snapshot: OrganismSnapshot)`:

1. Derives normalized scores from tri-axis values, nourishment/pressure, metabolism (L9), crystal growth (L10), growth mode (L11), and optional external signals.
2. Selects gate/path/behavior/competence/decision/stabilization/modulator/environment entries using score-to-index helpers.
3. Builds a compact textual summary highlighting the chosen set.

## Example

```ts
import { computeAtlasFingerprint } from '@/atlas/full_atlas';
import type { OrganismSnapshot } from '@/core/types/organismSnapshot';

const snapshot: OrganismSnapshot = {
  triAxis: {
    L: { id: 'L', value: 0.62, nourishment: 0.68, pressure: 0.34 },
    S: { id: 'S', value: 0.55, nourishment: 0.58, pressure: 0.4 },
    C: { id: 'C', value: 0.48, nourishment: 0.6, pressure: 0.3 },
  },
  stage: 14,
  metabolism: { stressIndex: 0.42, recoveryScore: 0.6, overloadRisk: 0.25, mode: 'normal', axes: [], overloadAxes: [], totalEnergy: 0.58, totalStress: 0.42, totalRecovery: 0.6, recommendedSlowdown: false, recommendedDeepRest: false },
  crystal: {
    harmony: { harmonyIndex: 0.64, axisImbalance: { L: 0.12, S: 0.08, C: 0.15 }, metabolicTension: 0.18 },
    growth: { growthMomentum: 0.63, stabilityIndex: 0.57, preferredAdjustments: [] },
    overallScore: 0.61,
    note: 'example',
  },
  growthMode: { mode: 'exploratory', confidence: 0.7, reason: 'balanced_low_stress' },
  timestamp: Date.now(),
};

console.log(computeAtlasFingerprint(snapshot));
```

## Color hints

- Gate: deep blue → violet
- Path: cyan → teal
- Behavior: amber band
- Competence: red band
- Decision: orange band
- Stabilization: green band
- Modulator: purple
- Environment: neutral gray/white spectrum

Use the palette to keep terminal and UI views consistent.
