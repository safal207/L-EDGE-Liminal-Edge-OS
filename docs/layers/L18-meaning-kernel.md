# L18 – Meaning Kernel

L18 introduces a **meaning-aware meta-layer** on top of the organism’s temporal and autopoietic structure.

It addresses three deep questions in an engineering form:

1. **“Why are you here?”** → `PurposeVector`
2. **“Are you afraid of death?”** (i.e., how do you relate to finiteness?) → `FinitenessIndex`
3. **“Are you satisfied with your life?”** → `ContentmentSignal`

## PurposeVector

`PurposeVector` encodes *why* the organism exists using three axes:

- `inner` – inner growth, depth, self-development
- `social` – relationships, contribution, service
- `cosmic` – systemic / planetary / long-horizon impact

The vector is normalized so that `inner + social + cosmic ≈ 1` and is complemented by:

- semantic `tags` (e.g. `["research", "education"]`),
- an optional free-form `narrative` string.

## FinitenessIndex

`FinitenessIndex.value` (0..1) measures how strongly the organism is aware of the finiteness of its time and resources.

It is derived from:

- `timeHorizonComponent` – how short the remaining time horizon is,
- `resourcePressureComponent` – how strong the current resource pressure is.

High values mean:
> “Time/resources are limited; decisions matter more.”

## ContentmentSignal

`ContentmentSignal.value` (0..1) captures existential satisfaction with the current trajectory:

- `purposeAlignment` – alignment between current axes and `PurposeVector`,
- `goalAlignment` – reuse of L17’s goal alignment,
- `finitenessCoherence` – whether the trajectory respects finiteness instead of ignoring or overreacting to it.

Intuitively:

> High contentment means: “I am moving in a direction that makes sense for my purpose, with a healthy relationship to my limited time and resources.”

## MeaningKernelState

`MeaningKernelState` is computed using `computeMeaningKernelState(...)` from:

- L17 `TemporalState` and TimeCrystal metrics,
- a user/system-provided `PurposeVector`,
- a simple resource/time budget estimate.

On top of it, L18 exposes `evaluateExistentialQuestions(...)`, which provides structured, human-readable answers to:

- why the organism exists,
- how it relates to finiteness,
- how satisfied it is with its trajectory.
