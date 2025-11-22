# Pathway (Assembly Point 12)

Pathway extends the Origin layer by describing **how** the organism is currently unfolding. Origin answers "from where?"; Pathway answers "along which route?".

## Purpose
- translate origin intent into a living growth trajectory
- watch the pace of unfolding (slow / steady / fast)
- report alignment between the chosen path and the sensed field/noosphere context
- surface active, emerging, and fading branches of development
- capture the pull of future ideas and scenarios

## State shape
```ts
interface PathwayState {
  timestamp: number;
  growthVector: { trajectory: string; pace: 'slow' | 'steady' | 'fast'; alignmentScore: number; };
  branches: { active: string[]; emerging: string[]; fading: string[]; };
  futurePull: { ideas: string[]; intensity: number; };
  summary: string;
}
```

## Lifecycle placement
Pathway updates every heartbeat after Origin and Meta-Orchestrator snapshots are refreshed. Its summary is injected into the heartbeat/health payloads and exposed via `/api/system/pathway/state`.

## How it derives signals
- **Trajectory**: favors stabilization under high tension, expansion when origin points outward, otherwise consolidates growth.
- **Pace**: slows under high tension, accelerates when coherence is high and tension low.
- **Alignment**: mixes intent alignment, field/noosphere mode, and meta coherence/tension against the origin root vector.
- **Branches**: tracks active intents/trajectories, adds emerging paths when support or resonance is high, and marks fading tracks when they lose momentum.
- **Future pull**: blends origin purpose with meta coherence/tension to estimate forward draw.

## Observation
Use the new endpoint:

- `GET /api/system/pathway/state` — full `PathwayState`

Heartbeat and `/api/system/health` now carry a concise snapshot of pathway trajectory, pace, alignment, and pull intensity.
