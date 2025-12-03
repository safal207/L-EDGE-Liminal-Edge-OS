# PR-130: Deep foresight loop (L24 → L31 → L21–L23, L25)

## Goal

Turn L31 Foresight Engine into a full foresight circuit that ingests real
`DecisionOutcome` objects from L24, generates a `ForesightSignal`, broadcasts
it via the DecisionBus, tunes L21 (Luck), L22 (ThoughtStream), L23
(InfoFluid), and L25 (CellKernel), and prepares state for the next L24
cycle.

---

## Depth we want

1. **L24 Wave-Choice Engine** finalizes a `DecisionOutcome`.
2. The decision flows into **L31 Foresight Engine**.
3. L31 builds a `ForesightSignal` using:
   - the decision itself,
   - a short history of recent decisions,
   - the current organism snapshot (energy, tension, luck, info field).
4. The signal is broadcast through the **DecisionBus** to:
   - **L21 Luck** — nudges the luck vector,
   - **L22 ThoughtStream** — writes a foresight echo entry,
   - **L23 InfoFluid** — adjusts the informational field,
   - **L25 CellKernel** — tweaks micro energy/tension settings.
5. Updated states form context for the next **L24** cycle, closing the loop
   "Decision → Foresight → Field → Next decision".

---

## Architectural changes

### 1) Expand `ForesightSignal`

```ts
export type ForesightImpactAxis = "risk" | "reward" | "stability" | "exploration";

export interface ForesightSignal {
  id: string;
  sourceDecisionId: string;
  horizonMs: number;              // time horizon of effect
  confidence: number;             // 0..1
  expectedImpact: "positive" | "negative" | "ambivalent";
  axes: Partial<Record<ForesightImpactAxis, number>>; // -1..+1 per axis
  tensionDelta?: number;          // projected change in systemic tension
  energyBudgetHint?: "conserve" | "spend" | "neutral";
  metadata?: Record<string, unknown>;
  createdAt: number;
}
```

### 2) Implement L31 foresight engine

File: `src/layers/L31/foresightEngine.ts`

```ts
import { DecisionOutcome } from "../L24/types";
import { ForesightSignal } from "./types";
import { getRecentDecisions } from "../../core/history";
import { getOrganismSnapshot } from "../../core/organismSnapshot";

export function generateForesightSignal(
  decision: DecisionOutcome
): ForesightSignal {
  const snapshot = getOrganismSnapshot();
  const recent = getRecentDecisions({ limit: 20 });

  // Simple heuristic scaffold with room to grow
  const explorationLevel = computeExploration(recent);
  const riskLevel = computeRisk(decision, snapshot, recent);
  const stabilityLevel = computeStability(snapshot);

  const confidence = clamp01(
    0.4 + 0.3 * Math.abs(riskLevel) + 0.3 * explorationLevel
  );

  return {
    id: `foresight_${Date.now()}`,
    sourceDecisionId: decision.id,
    horizonMs: 5 * 60 * 1000,
    confidence,
    expectedImpact: riskLevel > 0 ? "positive" : "negative",
    axes: {
      risk: riskLevel,
      exploration: explorationLevel,
      stability: stabilityLevel,
    },
    tensionDelta: riskLevel > 0 ? +0.1 : -0.05,
    energyBudgetHint: riskLevel > 0 ? "spend" : "conserve",
    metadata: {
      decisionType: decision.kind,
    },
    createdAt: Date.now(),
  };
}

// Stubs to be filled by Codex
function computeExploration(recent: DecisionOutcome[]): number {
  // measure proportion of "novel" decisions
  return 0;
}

function computeRisk(
  decision: DecisionOutcome,
  snapshot: any,
  recent: DecisionOutcome[]
): number {
  return 0;
}

function computeStability(snapshot: any): number {
  return 0;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
```

### 3) DecisionBus foresight channel

File: `core/DecisionBus.ts`

```ts
type ForesightListener = (signal: ForesightSignal) => void;
const foresightListeners: ForesightListener[] = [];

export const DecisionBus = {
  publishDecision(decision: DecisionOutcome) { /* existing */ },

  publishForesight(signal: ForesightSignal) {
    if (!signal || !signal.id) return;
    for (const listener of foresightListeners) {
      try {
        listener(signal);
      } catch (e) {
        // log but keep organism alive
      }
    }
  },

  onForesight(listener: ForesightListener) {
    foresightListeners.push(listener);
    return () => {
      const i = foresightListeners.indexOf(listener);
      if (i >= 0) foresightListeners.splice(i, 1);
    };
  },
};
```

### 4) Wire L24 to L31 and DecisionBus

After committing a `DecisionOutcome` in L24:

```ts
import { generateForesightSignal } from "../L31/foresight/foresightEngine";
import { DecisionBus } from "../../core/DecisionBus";

export function commitDecision(outcome: DecisionOutcome) {
  DecisionBus.publishDecision(outcome);
  const foresight = generateForesightSignal(outcome);
  DecisionBus.publishForesight(foresight);
  return outcome;
}
```

### 5) Layer reactions (L21, L22, L23, L25)

**L21 Luck** — gently nudge the internal luck vector based on foresight
confidence and expected impact.

**L22 ThoughtStream** — append a `foresight-echo` entry with tone inferred from
expected impact.

**L23 InfoFluid** — adjust info field trend/confidence toward foresight axes and
confidence.

**L25 CellKernel** — tweak `energyBudget` using `energyBudgetHint` and adjust
`tension` via `tensionDelta`.

Each layer registers an `onForesight` listener and keeps changes internal
(without altering public APIs yet).

### 6) Integration test

File: `tests/foresight-loop.integration.test.ts`

Scenario:

1. Initialize organism with baseline state.
2. Run 3–5 decisions through L24 → L31 → DecisionBus.
3. Assert that:
   - luck vector changes from baseline,
   - `ThoughtStream` contains `foresight-echo` entries,
   - `InfoFluid` trend/confidence shift,
   - `CellKernel` energy/tension adjust.

---

## Acceptance criteria

- New `ForesightSignal` fields (axes, confidence, tensionDelta,
  energyBudgetHint, metadata) are implemented and exported.
- `generateForesightSignal` uses recent decisions and organism snapshot via
  simple heuristics.
- `DecisionBus` supports `publishForesight` and `onForesight`.
- L24 emits foresight right after committing a decision.
- L21, L22, L23, L25 each react to foresight with lightweight state updates.
- Integration test above passes; existing `npm test` suite remains green.
- L31 activates only after real L24 decisions, avoiding recursion/loops.
- Deterministic behavior with fixed seed is preserved.

---

## Optional follow-ups

- Add a UI matrix to visualize current foresight signals.
- Let L31 blend L30 insights with L24 history when forming foresight.
