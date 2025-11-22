# FuzzyEvolutionNode

The fuzzy evolution layer treats the organism as a set of vibrating strings instead of rigid thresholds. It translates meta/origin/pathway context into soft pressure bands and string modes (ground, resonant, chaotic, damped) with human-friendly hints.

## Concepts
- **FuzzyLevel** — low/medium/high membership values for tension, coherence, and alignment.
- **StringMode** — qualitative vibration mode derived from fuzzy pressure.
- **Suggestions** — gentle recommendations for smoothing chaos, re-energizing damped states, or keeping resonance stable.

## API
- `update({ meta, origin, pathway })` — ingest the latest snapshots and recompute fuzzy pressure, string mode, and suggestions.
- `getState()` — return the latest `FuzzyEvolutionState`, including summary and bounded history counters.

## Integration
- Called each heartbeat after Meta-Orchestrator, Origin, and Pathway updates.
- Exposed through `/api/system/evolution/fuzzy` and included in health/organism payloads for observability.
