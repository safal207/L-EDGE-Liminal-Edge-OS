# L13 Response Layer (Nerve Output)

The L13 Response Layer converts the current organism state plus recent external signals into structured **action intents**. These intents are protocol-agnostic hints that other systems (LTP, schedulers, orchestration layers) can read to decide how aggressively to act, when to slow down, and when to open exploration windows.

## Core types

- `ActionScope` – target domain for an intent: `system`, `network`, `storage`, `llm_runtime`, `ui`, or `scheduling`.
- `ActionKind` – the recommended behavior such as `throttle`, `pause_non_critical`, `open_exploration_window`, `stabilize`, or `log_and_observe`.
- `ActionUrgency` / `ActionStrength` – how quickly and how forcefully to apply the hint.
- `ActionIntent` – a single intent with `confidence`, `reasonKey`, optional `params`, and `ttlMs` for freshness.
- `ResponseFrame` – the full L13 snapshot for a heartbeat: stage, growth mode, overload and harmony signals, plus the list of intents.

## How it works

1. `computeResponseFrame` reads an `OrganismSnapshot` (tri-axis, L9 metabolism, L10 crystal, L11 growth mode) plus optional aggregated external signals (L12).
2. It derives intents such as:
   - **Overload** → `throttle` + `pause_non_critical`
   - **Therapeutic** → `enter_recovery_mode`
   - **Exploratory window** → `open_exploration_window`
   - **Stabilizing** → `stabilize`
   - **Neutral** → `log_and_observe`
3. The frame is stored in `SystemContext.lastResponseFrame` and can be attached to ontogenesis timelines for observability.

## Consuming intents

External systems **do not execute L13 directly**. They read `ResponseFrame.intents` and map them to their own actions. Example:

- Scheduler pauses non-critical jobs when `pause_non_critical` appears.
- Network layer reduces noisy traffic on `throttle` with high urgency.
- LLM runtime opens a small experiment window when `open_exploration_window` arrives with high confidence.

### Consumer playbook (practical snippets)

Below are condensed patterns you can lift into real services. Each consumer listens to `lastResponseFrame` and reacts in its own domain without hard-coding transport logic.

**Scheduler / orchestrator** — respect recovery and stabilization hints:

```ts
function tickScheduler(context: SystemContext) {
  const frame = context.lastResponseFrame;
  if (!frame) return;

  for (const intent of frame.intents) {
    if (intent.scope !== "scheduling") continue;

    if (intent.kind === "enter_recovery_mode" && intent.confidence > 0.7) {
      scheduler.setMode("recovery");
      scheduler.pauseNonEssentialJobs();
    }

    if (intent.kind === "stabilize" && intent.strength !== "hint") {
      scheduler.reduceParallelism(0.5);
    }
  }
}
```

**Network / transport** — quiet noisy channels during overload:

```ts
function applyNetworkIntents(ctx: SystemContext, net: NetworkClient) {
  const frame = ctx.lastResponseFrame;
  if (!frame) return;

  for (const intent of frame.intents) {
    if (intent.scope !== "network") continue;

    if (intent.kind === "pause_non_critical" && intent.urgency !== "low") {
      net.pauseChannel("telemetry");
      net.pauseChannel("debug_logs");
    }

    if (intent.kind === "throttle") {
      const factor = Number(intent.params?.["max_load_factor"] ?? 0.7);
      net.setMaxThroughputFraction(factor);
    }
  }
}
```

**LLM runtime / agent core** — open and close exploratory windows safely:

```ts
function updateExplorationMode(ctx: SystemContext, runtime: LlmRuntime) {
  const frame = ctx.lastResponseFrame;
  if (!frame) return;

  let open = false;
  let close = false;

  for (const intent of frame.intents) {
    if (intent.scope !== "llm_runtime") continue;
    if (intent.kind === "open_exploration_window" && intent.confidence > 0.6) open = true;
    if (intent.kind === "close_exploration_window") close = true;
  }

  if (open) {
    const maxExp = frame.intents.find((i) => i.kind === "open_exploration_window")?.params?.["max_parallel_experiments"] ?? 1;
    runtime.enableExploration({ maxParallel: Number(maxExp) });
  } else if (close) {
    runtime.disableExploration();
  }
}
```

**UI / operator surface** — soften UX under load, highlight insights when stable:

```ts
function adaptUi(frame: ResponseFrame, ui: LiminalUI) {
  const overloadIntent = frame.intents.find((i) => i.reasonKey === "overload_risk");
  if (overloadIntent) {
    ui.enableFocusMode();
    ui.showGentleBanner("System under load — soft mode on");
    return;
  }

  const growthIntent = frame.intents.find((i) => i.reasonKey === "good_growth_window");
  if (growthIntent) {
    ui.disableFocusMode();
    ui.highlightInsightsPanel();
    return;
  }

  ui.setDefaultLayout();
}
```

Use these as starting points; each service maps the abstract intent into its own controls (scheduling knobs, transport throttles, runtime toggles, or UI modes).

## Example JSON

```json
{
  "timestamp": 1732710480000,
  "stage": 10,
  "growthMode": "exploratory",
  "overloadRisk": 0.18,
  "harmonyIndex": 0.72,
  "intents": [
    {
      "id": "intent-1",
      "scope": "llm_runtime",
      "kind": "open_exploration_window",
      "urgency": "normal",
      "strength": "soft_recommendation",
      "confidence": 0.78,
      "reasonKey": "good_growth_window",
      "params": { "max_parallel_experiments": 3 },
      "ttlMs": 20000
    }
  ]
}
```

## Integration notes

- L13 is **transport-agnostic**: no direct LTP dependency. Any protocol can read the intents.
- External signals (L12) modulate the choices but never override existing organism logic.
- Keep intents small, high-signal, and short-lived; downstream systems should honor `ttlMs` or refresh each heartbeat.
