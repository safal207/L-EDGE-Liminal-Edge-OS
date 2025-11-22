# Resonant String Tuner (Assembly Point 14 bridge)

The Resonance Tuner listens to fuzzy evolution signals and the broader meta/origin/pathway context to suggest how the organism should tune its "strings." It is a planner, not an enforcer: it proposes a global mode and targeted tuning actions so operators or downstream layers can respond without hard coupling.

## Inputs
- Fuzzy evolution pressure and string mode (tension, coherence, alignment levels).
- Meta snapshot: coherence, tension, intent alignment, field/noosphere stance.
- Origin + Pathway: root meaning/direction and current growth trajectory + future pull.

## Output
- `ResonanceTuningPlan` with:
  - `mode`: `deep_rest | integration | steady_growth | rapid_expansion | careful_exploration`.
  - `actions`: `TuningAction` entries with target, direction, and intensity.
  - `summary`: concise guidance for the current phase.

## Modes
- **deep_rest**: high tension or depleted coherence → reduce load, increase rest.
- **integration**: stabilize and digest change when coherence is fragmented.
- **steady_growth**: resonant or ground state with balanced tension.
- **rapid_expansion**: resonant with strong future pull and manageable tension.
- **careful_exploration**: heterogeneous waves → probe gently with buffers.

## API
- `GET /api/system/tuning/plan` returns the latest tuning plan.

Use the plan to color dashboards, gate heavy tasks, or trigger human-in-the-loop decisions when the system shifts modes.
