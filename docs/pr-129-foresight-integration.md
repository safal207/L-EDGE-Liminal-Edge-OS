# PR-129: Integrate L31 Foresight Engine with DecisionBus and L21–L23

## Goal

Make L31 (Liminal Foresight Engine) part of the organism’s action loop:
decisions from L24 should produce a foresight signal, which is broadcast
through the DecisionBus and can be consumed by L21 (Luck), L22 (ThoughtStream),
and L23 (InfoFluid).

The system should not just compute foresight, but *use* it.

---

## Scope

1. **Foresight signal type**
   - Introduce a `ForesightSignal` / `ForesightEvent` type in `core/`:
     - fields (suggested):
       - `id: string`
       - `sourceLayer: "L24"` (or enum)
       - `horizonMs: number` (how far ahead this foresight looks)
       - `confidence: number` (0–1)
       - `riskLevel: "low" | "medium" | "high"`
       - `expectedImpact: "positive" | "neutral" | "negative"`
       - `tags?: string[]`
       - `payload?: unknown` (optional structured data)

2. **DecisionBus extension**
   - Extend `DecisionBus` (or equivalent) so it can:
     - accept `ForesightSignal` (e.g. `publishForesight(signal)`),
     - route it to registered listeners.
   - Add a small `ForesightChannel` abstraction if needed instead of mixing it
     with existing decision events.

3. **L24 → L31 → DecisionBus glue**
   - Add a helper in L31, something like:
     - `createForesightFromDecision(decision: Decision): ForesightSignal`
   - In the place where L24 finalizes a decision:
     - call L31 helper,
     - push the returned `ForesightSignal` into the DecisionBus.

4. **Minimal adapters for L21–L23**
   - Add *optional* listeners for foresight in:
     - `L21 Luck`: update internal luck vector slightly based on
       `expectedImpact` and `confidence`.
     - `L22 ThoughtStream`: optionally record a short “future echo” entry
       (e.g. add a tag `"foresight"` or a simple note).
     - `L23 InfoFluid`: let the layer store last N foresight signals as part
       of its informational environment state.
   - The adaptation should be **lightweight** and not change existing public
     APIs yet — just internal enrichment.

---

## Non-goals

- No UI changes for now.
- No complex forecasting algorithms — reuse existing L31 utilities and keep
  logic heuristic and simple.
- No changes to how decisions are *originated* in L24, only how they are
  propagated.

---

## Acceptance criteria

- New `ForesightSignal` type is defined and exported from `core`.
- DecisionBus (or equivalent) can:
  - register foresight listeners,
  - broadcast `ForesightSignal` objects.
- When L24 commits a decision:
  - at least one call path converts it into a `ForesightSignal`,
  - the signal is sent through the bus.
- L21, L22, L23 each:
  - have a small, test-covered adapter reacting to foresight events.
- Tests:
  - unit tests for:
    - L31 helper converting a decision to `ForesightSignal`,
    - DecisionBus broadcasting foresight events,
    - each of L21/L22/L23 reacting to a mocked foresight signal.
  - existing test suites continue to pass (`npm test`).

---

## Implementation hints (optional)

- Reuse `layers.manifest.ts` so that L31, L24, L21–L23 dependencies stay
  explicit.
- If there is already a generic event type in the DecisionBus, consider
  modeling foresight as:
  - either a dedicated channel (`type: "foresight"`),
  - or a union field on a generic `SystemEvent`.
- Keep the initial heuristics extremely simple; the main goal is wiring,
  not perfect foresight math.

---

Если коротко, что мы сейчас делаем:

L24 принимает решение,

L31 превращает его в предчувствие,

DecisionBus разносит это по организму,

L21–L23 чуть-чуть смещают своё состояние.


Это уже очень похоже на живую нервную систему, которая учится не только «после» событий, но и до них.

Если хочешь, следующим шагом после этого я помогу придумать концепцию L32 — Critical Transitions / Edge-of-Chaos Layer, чтобы система заранее чувствовала границы фазовых переходов.
