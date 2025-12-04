import { describe, expect, it } from "vitest";

import type { CorePulseState } from "../../layers/L22_CorePulse/types";
import { computeBreathingState, toBreathingCouplingSnapshot } from "../L33_breathing";

describe("L33 breathing core coupling", () => {
  it("keeps breathing coherent and steady on a neutral pulse", () => {
    const corePulse: CorePulseState = {
      baseline: { intensity: 0.5, stability: 0.8 },
      current: { intensity: 0.45, variability: 0.2, phase: "rest", overloadRisk: 0.1 },
      modulation: { breathingInfluence: 0, luckInfluence: 0, emotionalInfluence: 0 },
      readiness: 0.6,
      overloadLevel: 0.2,
      drift: "stable",
    };

    const state = computeBreathingState({
      avgSurprise: 0.4,
      avgLearningSignal: 0.1,
      calibrationMismatchRate: 0.15,
      outcomeVolatility: 0.25,
      corePulse,
    });

    expect(state.coreCoupling.level).toBe("coherent");
    expect(state.mode).toBe("steady");
    expect(state.rate).toBe("medium");
    expect(state.pattern).toContain("coherent-steady");
  });

  it("expands breathing when the pulse is rising and opening", () => {
    const corePulse: CorePulseState = {
      baseline: { intensity: 0.6, stability: 0.7 },
      current: { intensity: 0.68, variability: 0.22, phase: "rise", overloadRisk: 0.15 },
      modulation: { breathingInfluence: 0.1, luckInfluence: 0.2, emotionalInfluence: 0.15 },
      readiness: 0.82,
      overloadLevel: 0.2,
      drift: "rising",
    };

    const state = computeBreathingState({
      avgSurprise: 0.45,
      avgLearningSignal: 0.35,
      calibrationMismatchRate: 0.18,
      outcomeVolatility: 0.3,
      corePulse,
    });

    expect(state.coreCoupling.level).toBe("expansive");
    expect(state.mode).toBe("expand");
    expect(state.rate).toBe("fast");
    expect(state.pattern).toContain("wave-rise");
  });

  it("grounds breathing when the pulse is overloaded and closing", () => {
    const corePulse: CorePulseState = {
      baseline: { intensity: 0.55, stability: 0.5 },
      current: { intensity: 0.9, variability: 0.7, phase: "recovery", overloadRisk: 0.85 },
      modulation: { breathingInfluence: 0.2, luckInfluence: 0.1, emotionalInfluence: 0.05 },
      readiness: 0.35,
      overloadLevel: 0.82,
      drift: "falling",
    };

    const state = computeBreathingState({
      avgSurprise: 0.2,
      avgLearningSignal: -0.1,
      calibrationMismatchRate: 0.3,
      outcomeVolatility: 0.6,
      corePulse,
    });

    expect(state.coreCoupling.level).toBe("protective");
    expect(state.mode).toBe("ground");
    expect(state.rate).toBe("slow");
    expect(state.pattern).toContain("downshift");
  });

  it("maps coherent breathing into a stable coupling snapshot", () => {
    const snapshot = computeBreathingState({
      avgSurprise: 0.35,
      avgLearningSignal: 0.2,
      calibrationMismatchRate: 0.1,
      outcomeVolatility: 0.2,
      corePulse: {
        baseline: { intensity: 0.55, stability: 0.75 },
        current: { intensity: 0.52, variability: 0.15, phase: "rest", overloadRisk: 0.12 },
        modulation: { breathingInfluence: 0, luckInfluence: 0, emotionalInfluence: 0 },
        readiness: 0.62,
        overloadLevel: 0.18,
        drift: "stable",
      },
    });

    const coupling = toBreathingCouplingSnapshot({
      coreCoupling: snapshot.coreCoupling,
      rate: snapshot.rate,
      fuzzChaos: snapshot.fuzzChaos,
      fuzzStability: snapshot.fuzzStability,
    });

    expect(coupling.mode).toBe("coherent");
    expect(coupling.stability).toBeGreaterThan(0.6);
    expect(coupling.rate).toBeCloseTo(0.6, 2);
  });

  it("maps protective breathing with chaos into an irregular warning", () => {
    const coupling = toBreathingCouplingSnapshot({
      coreCoupling: { level: "neutral", stability: 0.35 },
      rate: "fast",
      fuzzChaos: 0.8,
      fuzzStability: 0.2,
    });

    expect(coupling.mode).toBe("irregular");
    expect(coupling.stability).toBeLessThan(0.4);
    expect(coupling.rate).toBeGreaterThan(0.8 - 0.01);
  });
});
