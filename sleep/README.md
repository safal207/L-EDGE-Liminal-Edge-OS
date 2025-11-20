# Sleep Cycle Layer

Sleep consolidates memory, clears noise and simulates dream scenarios before the context is injected back into Edge. The cycle can be triggered manually (API) or automatically by the scheduler.

## Files
- `sleepCycle.ts` — high-level cycle orchestrator with metrics.
- `consolidation.ts` — deterministic consolidation heuristics.
- `dreamSandbox.ts` — runs speculative dream iterations.
- `scheduler.ts` — tiny interval scheduler for auto-sleep.
- `tests/sleepCycle.test.ts` — covers consolidation + dream iteration behaviour.

## Next steps
- Replace the scheduler with a circadian rhythm clock tied to operator intents.
- Persist sleep reports into LiminalBD for SOMA dream alignment.
- Build dream playback endpoint for LRI.
