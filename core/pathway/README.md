# Pathway / Assembly Point 12

The Pathway organ translates the Origin signal into a concrete trajectory of growth. It tracks the active and emerging branches of the organism, measures how well the current motion aligns with the core root vector, and summarizes how strongly future-facing ideas are pulling the system forward.

## Responsibilities
- derive a growth trajectory and pace from the current meta snapshot
- score alignment between origin intent and present field/noosphere context
- track active/emerging/fading branches and future pull ideas
- publish a concise summary for observability and downstream engines

## Inputs
- Origin state (root vector, intention core)
- Meta-Orchestrator snapshot (coherence, tension, field and intent alignment signals)

## Outputs
- `PathwayState` with growth vector, branches, future pull, and summary
- exposed through `/api/system/pathway/state` and heartbeat/health payloads

## Notes
Pathway does **not** force the system; it reflects how the organism is currently unfolding and whether that unfolding matches the sensed origin and field conditions.
