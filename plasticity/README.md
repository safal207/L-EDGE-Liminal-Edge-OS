# Plasticity / Adaptation Layer

The **PlasticityEngine** observes cross-organ history (homeostasis, reflex, emotion, intent, social resonance) and derives small, clamped adjustments to help the organism learn from prior outcomes without destabilizing its other organs.

## Capabilities
- Capture bounded episodes of context → action → outcome.
- Reduce stress sensitivity when repeated alerts do not improve conditions.
- Reinforce reflex bias when quick actions relieve stress.
- Adjust intent biases toward healing or degraded modes based on observed outcomes.
- Expose adaptation state, suggestions, and history for observability.

## API surfaces
- `/api/system/plasticity` — current adaptation state and suggestions.
- `/api/system/plasticity/history` — recent adaptation episodes (bounded).
- `/api/system/organism` — combined organism snapshot including plasticity.

## Integration points
- Evaluated each heartbeat alongside meta/intent/social layers.
- Provides adapted intent decisions for runtime application.
- Feeds plasticity summaries into the health payload for monitoring.
