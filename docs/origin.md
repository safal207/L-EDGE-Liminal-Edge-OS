# Origin / Point of Assembly №11

Origin is the root-oriented layer that asks **“where did this organism come from and why is it growing this way?”**. It follows the Meta-Orchestrator (point 10) and anchors the system in a source vector.

## What Origin tracks
- **Root vector:** meaning, growth direction, tone of the trajectory.
- **Lineage:** core principles the organism carries forward, inherited patterns, and recently resolved patterns.
- **Intention core:** a purpose statement with a clarity score derived from meta coherence/tension.
- **Summary:** a short human-readable string describing the current stance of the root.

## Integration
- Updated alongside the Meta-Orchestrator each heartbeat using the latest `MetaSystemSnapshot`.
- Exposed via `/api/system/origin/state` for observers.
- Stored in `systemContext.origin` so other layers can read the present root stance.

## Why it matters
Without Origin, the organism can observe itself but lacks a declared provenance. Origin provides the sense of **source and direction**, which stabilizes higher-order layers (future evolution, narrative) and keeps adaptations tethered to foundational principles.
