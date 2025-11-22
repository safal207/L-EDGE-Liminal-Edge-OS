# Scenario Engine (Rules of Luck)

The ScenarioEngine is a light recommendation layer that reads the latest noosphere report, heartbeat snapshot, and collective resonance to suggest "right now" modes for the organism. It maps field/noosphere tension to actionable hints like deep focus vs. recovery.

## Inputs
- `NoosphereReport` (support/tension mode, top field patterns, intent hint)
- Optional heartbeat summary (to read last intent alignment)
- Optional `CollectiveResonanceSnapshot` (coherence bonus)

## Outputs
- Ordered `ScenarioResult[]` with `recommendedMode`, `message`, and a composite score.

## Rules
Rules live in `scenarios/defaultRules.ts` and follow this shape:
```ts
{
  id: string;
  when: { noosphereMode?: 'supportive' | 'neutral' | 'high_tension'; minSupport?: number; maxTension?: number; lastIntentAlignment?: 'aligned' | 'neutral' | 'against_field' };
  then: { recommendedMode: 'deep_focus' | 'light_tasks' | 'recovery' | 'social' | 'explore' | 'maintenance'; priority: number; message: string };
}
```

## API
- `GET /api/system/scenario/suggestions` — returns the top scored suggestions (default top 5).

## Intent alignment
Scenario hints depend on intent alignment data injected by the IntentEngine: each decision is labeled `aligned/neutral/against_field` based on Noosphere + Field support/tension, propagated through heartbeat and report responses.
