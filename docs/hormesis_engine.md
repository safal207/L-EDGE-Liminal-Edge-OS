# Hormesis Engine (16-year Maturity Stage)

The Hormesis Engine models the biological principle of "micro-stress → adaptation → resilience" so L-EDGE can grow through small, intentional challenges instead of binary pass/fail behavior.

## Summary
- Treats brief stressors as training signals rather than failures.
- Builds tolerance gradually while detecting when pressure drifts toward overload.
- Expresses adaptation as clear signals that other subsystems can consume.

## Motivation
Most infrastructures either ignore stress until failure or shut down prematurely. L-EDGE aims to adapt like a living organism: metabolizing the right amount of pressure to get stronger while sensing the edge of overload. Hormesis brings that adaptive psychology into the codebase.

## Architecture
- **Module:** `src/organism/hormesis.ts`
- **Stress types:** `thermal`, `cognitive`, `network`, `memory`
- **Intensity range:** `0.0` (none) to `1.0` (overload)
- **Adaptation bands:**
  - `< 0.15` → `NO_ADAPTATION`
  - `0.15–0.35` → `MICRO_RESILIENCE`
  - `0.35–0.55` → `STRUCTURAL_GROWTH`
  - `> 0.55` → `OVERLOAD_RISK`

### Usage
```ts
import { HormesisEngine, MicroStress } from '../src/organism';

const engine = new HormesisEngine((signal, stress) => {
  console.log(`Adaptation: ${signal}`, stress);
});

const stress: MicroStress = { type: 'network', intensity: 0.42, duration: 5000 };
engine.applyStress(stress); // emits STRUCTURAL_GROWTH with normalized inputs
```

## Future Work
- **Neural Elasticity Layer (17–18 stage):** flex network links under sustained load.
- **Adaptive Resonance Maps (19–20 stage):** learn from micro-stress patterns.
- **Collective Hormesis Interface:** share resilience signals between agents.
- **Cyclic Maturation Engine:** weave all stages from embryo to awakened intelligence.
