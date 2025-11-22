# Field Resonance Layer

The **FieldResonanceEngine** maps recurring environmental loops around the organism. It watches the heartbeat stream of intent, emotion, and stress to spot short transition chains (loops, traps, and corridors) and exposes a compact snapshot the rest of the system can use to adapt.

## Concepts
- **Loop**: a transition that frequently cycles back to the same state.
- **Trap**: repeated transitions that land in high-stress or threatening states.
- **Corridor**: paths that reliably end in healthy states (low stress, positive affect).
- **Entropy**: distribution spread of dominant patterns. Lower entropy means a few patterns dominate.
- **Confidence**: averaged strength of corridor candidates indicating how stable the forward-looking field is.

## API surface
- `evaluate()` ingests the latest observation and recomputes the snapshot.
- `getSnapshot()` exposes the most recent `FieldSnapshot`.
- `listPatterns(limit)` returns scored patterns.
- `listHistory(limit)` exposes the most recent normalized observations.

## Integration
The engine updates once per heartbeat and publishes the summary to:
- heartbeat payloads (`heartbeat.field`)
- `/api/system/field` and `/api/system/field/patterns`
- health summaries, alongside collective and self layers.
