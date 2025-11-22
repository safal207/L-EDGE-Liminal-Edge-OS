# DreamReplay / Experience Replayer

DreamReplayEngine replays significant memory episodes during sleep to integrate patterns back into the organism. It selects stressful or novel snapshots from long-term memory, pushes them through a lightweight transmutation sandbox, and records integration results for homeostasis and reflex layers to observe.

## API
- `runReplayCycle(trigger)` executes a replay burst and returns the latest `ReplayState`.
- `getSummary()` exposes last run metrics (episodes processed, integration score, relief).
- `getEpisodes()` / `getResults()` return the latest batch for inspection.

## Triggers
- Automatically invoked after sleep cycles via `systemContext`.
- Can be manually triggered through `/api/system/replay/trigger` in dev environments.

## Metrics
Replay outcomes contribute to health/homeostasis summaries via:
- `replay.lastRunAt`
- `replay.episodes`
- `replay.avgIntegrationScore`
- `replay.reliefScore`

These signals are intended to influence future transmutation, reflex, and homeostasis behavior.
