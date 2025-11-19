# Reflex / Nervous System Layer

The ReflexEngine acts as the nervous system of L-EDGE. It watches signals from Homeostasis and other organs and emits rapid, protective actions when stress becomes dangerous.

## How it works
- **Events.** External or internal sources (homeostasis load spikes, runtime failures, circulation overloads) call `ingestEvent` with a `ReflexEvent` describing the signal.
- **Evaluation.** On each heartbeat tick, `evaluate(homeostasisState)` derives quick `ReflexAction` recommendations based on the current stress score.
- **History.** A small ring buffer (default 100) keeps the latest events/actions for observability.

## API surface
- `GET /api/system/reflex` returns the current `ReflexState` (recent events + actions).
- `/api/system/health` includes a short summary of the latest reflex action (severity/reason/count).

## Integration points
- `core/systemContext.ts` wires the ReflexEngine, feeding it homeostasis-derived events and invoking `evaluate` every heartbeat.
- Reflex commands are advisory for now (throttle edge, force sleep, boost transmutation, open degraded mode) and can be hooked into runtime/edge services in later iterations.
