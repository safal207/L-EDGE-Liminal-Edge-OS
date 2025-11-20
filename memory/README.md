# Memory Layer

The Memory layer acts as short-term and long-term memory for the L-EDGE organism. It records signals coming from circulation loops, reflex actions, and sleep cycles, keeps a bounded working set, and consolidates meaningful episodes into longer-lived snapshots during sleep.

## Capabilities
- **Short-term memory**: captures recent `MemoryEvent` items with automatic decay and bounded depth.
- **Long-term memory**: builds aggregated `MemorySnapshot` summaries during consolidation.
- **Consolidation**: triggered by sleep cycles or manual calls to `consolidate`, moving recent events into long-term storage.
- **Recall**: query recent events and consolidated snapshots by source, type, or textual hints via `recall` or HTTP endpoints.

## Endpoints
- `GET /api/system/memory` — combined short/long-term state.
- `GET /api/system/memory/short` — latest short-term events.
- `GET /api/system/memory/long` — consolidated memory snapshots.
- `POST /api/system/memory/recall` — filter memory by criteria like source/type.

## Lifecycle placement
Memory sits after reflex and sleep in the narrative loop:
`Edge → Storage → Resonance → Awareness → Runtime → Perception → Heartbeat → Circulation → Transmutation → Sleep → Homeostasis → Reflex → Memory → (feeds back into Awareness)`.
