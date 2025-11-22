# SelfModel / Narrative Engine

The SelfModelEngine aggregates episodes across the organism lifecycle (context → intent → reflex/action → outcome),
turning raw cycles into identity traits and narrative arcs. It keeps a bounded history of episodes, derives long-lived
traits (risk-taking, calm recovery, pattern seeking, social orientation, etc.), and surfaces concise identity summaries
for observability.

## How it works
- Each heartbeat builds an `Episode` from homeostasis, interoception, emotion, perception, plasticity, social resonance,
  intent and reflex state.
- Episodes update traits via gentle decay and contextual adjustments (pressure, healing cycles, exploration wins,
  reflex reliance).
- Repeated patterns become narrative arcs (e.g., **under-pressure-safe-intent**, **healing-stabilizes**), keeping only
  a bounded history.
- The engine exposes snapshots through `/api/system/self` and detailed narrative/episode history via
  `/api/system/self/narrative`.

## Parameters
- `maxHistory` (default: 120): maximum retained episodes/arcs.
- `traitDecay` (default: 0.97): decay factor pulling traits toward their neutral baseline before applying adjustments.

## Example responses
```
GET /api/system/self
{
  "traits": { "calmRecovery": 0.66, "riskTaking": 0.38, ... },
  "identitySummary": "calm, pattern-oriented, under-pressure",
  "last_update": 17321312121
}

GET /api/system/self/narrative
{
  "episodes": [...],
  "arcs": [ { "label": "under-pressure-safe-intent", "occurrences": 3, ... } ],
  "volatility": 0.14
}
```
