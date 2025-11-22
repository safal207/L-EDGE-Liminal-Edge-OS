# Origin Node

The Origin layer captures the organism's sense of provenance and direction. It is a passive, observing node that keeps a small state describing why and where the organism is growing.

## Responsibilities
- Hold a semantic root vector (meaning, direction, tone).
- Track lineage: core principles, inherited patterns, resolved patterns.
- Maintain an intention core with a purpose statement and rolling clarity score.
- Produce a short human-readable summary derived from recent meta snapshots.

## Updating
`OriginNode.update` ingests the latest `MetaSystemSnapshot` to:
- choose a direction (expansion, stabilization, integration, orientation) based on field mode, intent alignment, and tension,
- derive tone from coherence/tension balance,
- refresh clarity using meta coherence and tension,
- append a resolved pattern when tension is low and coherence rises.

Origin does not change other organs; it simply records the current “why” of the organism so higher layers can anchor to a consistent root.
