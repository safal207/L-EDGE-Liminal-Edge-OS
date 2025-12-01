import { describe, it, expect } from "vitest";
import {
  L20_ResonantDecisionOrchestrator,
  buildDecisionInputs,
  buildResonantCandidates,
} from "./index";
import type { ResonanceWeights } from "./ResonantStateTransitionEngine";

const baseInner = {
  time: { agePhase: "L17", tmi: 0.25, drift: 0.2 },
  meaning: { purposeAlignment: 0.72, contentment: 0.64, finiteness: 0.55 },
  phase: { state: "liquid" as const, stability: 0.62 },
};

const baseContext = {
  pressureType: "challenge" as const,
  pressureIntensity: 0.4,
  relevance: 0.7,
};

const baseFlow = {
  fai: 0.66,
  innerAlignment: 0.7,
  socialAlignment: 0.6,
  cosmicAlignment: 0.65,
  luckWindowOpen: true,
  luckWindowStrength: 0.3,
};

describe("L20 Resonant Decision Orchestrator", () => {
  it("builds decision inputs with defaults and clamps values", () => {
    const inputs = buildDecisionInputs(
      { ...baseInner, time: { ...baseInner.time, tmi: 1.4 } },
      baseContext,
      { ...baseFlow, fai: -0.5 }
    );

    expect(inputs.time.tmi).toBeLessThanOrEqual(1);
    expect(inputs.flow.fai).toBeGreaterThanOrEqual(0);
    expect(inputs.context.pressureType).toBe("challenge");
  });

  it("creates fallback candidates when no external list is provided", () => {
    const inputs = buildDecisionInputs(baseInner, baseContext, baseFlow);
    const candidates = buildResonantCandidates(inputs, []);

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((c) => c.id && c.mode)).toBe(true);
  });

  it("scores candidates and returns a resonant decision envelope", () => {
    const weights: ResonanceWeights = { coherence: 0.3, entropyCost: 0.05 };
    const externalCandidates = [
      {
        id: "connect_people",
        mode: "connect" as const,
        intensity: 0.7,
        description: "Усилить связи и обмен информацией.",
        basePriority: 1.1,
      },
      {
        id: "push_project",
        mode: "push" as const,
        intensity: 0.8,
        description: "Продвинуть ключевой проект несмотря на давление.",
      },
    ];

    const { inputs, candidates, decision } = L20_ResonantDecisionOrchestrator(
      baseInner,
      baseContext,
      baseFlow,
      externalCandidates,
      weights
    );

    expect(inputs.meaning.contentment).toBeCloseTo(0.64, 2);
    expect(candidates[0]).toHaveProperty("resonanceScore");
    const best = candidates.reduce((acc, cur) =>
      cur.resonanceScore > acc.resonanceScore ? cur : acc
    );
    expect(decision.chosenCandidateId).toBe(best.id);
    expect(decision.riskBand).toMatch(/low|medium|high/);
  });
});
