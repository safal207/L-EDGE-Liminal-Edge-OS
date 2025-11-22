# Resonance Tuner

The ResonanceTuner is a gentle planner that listens to fuzzy evolution signals, the meta snapshot, origin, and pathway context to suggest how the organism should modulate its "strings." It does not apply changes itself; it only issues a tuning plan with a global mode and concrete actions.

## What it observes
- `FuzzyEvolutionState`: tension, coherence, alignment fuzzy levels and the current string mode.
- `MetaSystemSnapshot`: coherence/tension backdrop and recent intent/field alignment.
- `OriginState` + `PathwayState`: the root vector and current growth trajectory.

## Output
- `ResonanceTuningPlan` with:
  - `mode`: one of `deep_rest | integration | steady_growth | rapid_expansion | careful_exploration`.
  - `actions`: targeted `TuningAction` items (load, field, memory, growth, rest, exploration) with direction and intensity.
  - `summary`: short human text describing the recommended stance.

Use `/api/system/tuning/plan` to inspect the latest plan and surface it in operators' dashboards or downstream decision layers.
