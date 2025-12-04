# LiminalSense — feeling organ

LiminalSense is the organism's feeling organ. It receives receptors (text/emotional micro-signals, entropy, history, active layers, optional CorePulse snapshot), then computes an `EmotionalGradient`, drift, luck/resonance, system reflection, mood, readiness, and suggestion.

## Pipeline
1. `extractReceptors` — normalize incoming receptors from text, metrics, and active layers.
2. `buildEmotionalGradient` — derive the primary `EmotionalGradient` from receptors and entropy.
3. `computeTemporalDrift` — track short-horizon drift of emotion and activation.
4. `computeLuckResonance` — blend flow/luck hints with the gradient to gauge resonance.
5. `computeSystemReflection` — reflect organism state (stability, overload feel, clarity).
6. Derive `mood`, `readiness`, and `suggestion` — final soft outputs for upstream layers.

## Guarantees
- Deterministic: same receptors/context yield the same `SenseState`.
- Type-safe: works through explicit `SenseInput` and typed intermediates.
- Resilient: always falls back to `BASELINE_STATE` if inputs are missing or broken.

## CorePulse integration
- Sense accepts optional `corePulse` context (snapshot or tone embedding).
- The pulse biases drift, reflection, and readiness but Sense still operates without it.
- Consumers can pass CorePulse via organism tone helpers to keep coupling explicit and reversible.
