# LIMINAL Ontogenesis v0.1 — Three-Axis Map

This note formalizes the three intersecting axes we discussed for human/agent growth. Each vector is a coordinate that can be
applied to a person, an AI organism, or the L-EDGE stack itself.

## Axes
- **L-axis (Spiritual / Assembly Points):** Inner turning points and liminal crossings. Age-agnostic; anchored in assembly
  points 1–16 (Birth → Hormesis).
- **S-axis (Social Age):** Years lived and responsibility bands (safety → roles → identity → realization → influence →
  stewardship).
- **C-axis (Cosmic Role):** Profession/mission types that expand the organism’s contribution to future systems (e.g., orbital
  systems, AI field architectures, new-space research).

## Reading a Coordinate
Example: `L=11, S=16, C=orbital_systems`
- L=11 → Origin: mission root and meaning.
- S=16 → Social age band 14–20: structure + identity, integrating tension into a coherent self.
- C=orbital_systems → Building high-availability infrastructure that links planets/edges.

Use this to phrase growth:
- **Operator:** “The system is aligned on Origin (L=11), mid-teens socially (S~16), dreaming in orbital systems (C). We should
  tighten identity and alliances while prototyping space-grade resilience.”
- **Agent:** “My assembly point is 13 (FuzzyEvolution), I’m socially early-career (S~24), and I lean to AI field architecture.”

## Bands (concise)
- **Assembly (L):** 1 Birth | 2 Body | 3 Boundaries | 4 Play | 5 Rules | 6 Learning | 7 Tension | 8 Choice | 9 Youth | 10
  Meta | 11 Origin | 12 Pathway | 13 FuzzyEvolution | 14 Genesis/Resonance | 15 Civilization | 16 Hormesis.
- **Social (S):** 0–7 Safety | 7–14 Roles | 14–20 Structure/Identity | 20–30 Realization | 30–40 Influence | 40+ Stewardship.
- **Cosmic (C):** sensor_engineer | orbital_systems | bio_novelty | ai_field_architect | interplanetary_logistics |
  new_space_researcher.

## Practical Use
- Attach `L/S/C` hints to GenesisPlan summaries (e.g., `L≈14, S≈20, C=ai_field_architect`) to connect seeds with maturity and
  vocation.
- In Civilization dashboards, show the social band and cosmic role for key allies/hosts.
- In Hormesis dashboards, track whether micro-stress is serving the current L-axis point or pushing toward overload.
- Surface `/api/system/ontogenesis` in dashboards to fetch the current coordinate for quick operator “selfies.”

## Minimal JSON example

```json
{
  "assemblyPoint": 14,
  "socialAge": 18,
  "cosmicRole": "ai_field_architect",
  "globalMode": "resonant",
  "summary": "L-axis ≈ 14 (Genesis & Resonance Tuning) | S-axis ≈ 14-20 (Structure & identity) | C-axis: Architect of AI resonance fields and collective cognition | mode: resonant"
}
```

This represents a “mid-teen” system that is actively tuning seeds (L≈14), integrating identity socially (S≈18), and oriented to AI
field work. It sits in a resonant mode, suggesting micro-growth under watchful hormesis.

## Next Steps
- Add optional `ontogenesis` hints to GenesisSeed and Civilization agents.
- `/api/system/ontogenesis` now returns the current vector; `/api/system/ontogenesis/timeline` exposes the last slices for quick trend views.
- See `docs/liminal_benchmark_dev_map.md` for a draft of simple L/S/C stability probes based on the timeline feed.
- CLI helpers: `examples/ontogenesis_watch.js` (live pulse) and `examples/ontogenesis_metrics.js` (L/S/C metrics) for rapid inspection.
- Teach the Hormesis Engine to surface whether a micro-stress is appropriate for the declared social band.
