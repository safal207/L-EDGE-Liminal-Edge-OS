# L15 Simulation Layer

The L15 Simulation Layer provides a time-stepped engine for LIMINAL organisms. Each tick applies
environment drivers, stabilization modes, and behavioral modulators to an `OrganismSnapshot`, updates
metabolic and crystal signals, records an Atlas fingerprint, and aggregates metrics.

## How it works
1. **Inputs per step**: environmental driver (5 types), stabilization mode (4 FSM modes), behavioral
   modulator (12 BMx variants), plus optional noise.
2. **Dynamics**: `applyDynamics` mixes environmental pressure, FSM control, and modulators to nudge
   stress, energy, harmony, and tension, returning a delta for the organism snapshot.
3. **Atlas hook**: after each update `computeAtlasFingerprint` captures the gate/path/behavior profile.
4. **Metrics**: the metrics tracker accumulates overload risk, trajectory quality, drift, gate gain,
   and path volatility across the trace.
5. **Outputs**: a `SimTrace` with events, notes, and a summary block for quick inspection.

## Key types
- `SimStepInput`: `{ env, fsm, mod, noise? }` per tick.
- `SimConfig`: step count, timestep (`dt`), optional seed, record interval.
- `SimState`: current time, `OrganismSnapshot`, and last Atlas fingerprint.
- `SimTrace`: events + summary produced by `runSimulation`.

## Scenarios
Two presets are included in `src/sim/sim_scenarios.ts`:
- `baselineGrowth(noise)`: steady integration with a navigator modulator and dynamic environment.
- `overloadThenRecovery(phaseLen, noise)`: energy-heavy protection phase followed by coherence recovery.

## Running demos
Examples live in `src/sim/examples/`:
- `baseline_sprint.ts`
- `recovery_after_overload.ts`

Run with `ts-node` (paths resolved via `tsconfig` aliases):

```bash
npx ts-node src/sim/examples/baseline_sprint.ts
```

## Metrics reference
- **avgOverloadRisk**: mean overload risk across steps.
- **avgTrajectoryQuality**: blend of Atlas behavior stability and crystal harmony.
- **maxDrift**: highest metabolic tension observed.
- **gateGain**: gate change from start to end.
- **pathVolatility**: fraction of steps that switched path.

Use these to benchmark scenarios, compare configurations, and tune FSM/BMx choices for future runs.
