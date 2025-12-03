import { beforeEach, describe, expect, it } from "vitest";
import {
  BreathingSnapshot,
  computeFuzzyState,
  computeLuckSynergyScore,
  decidePhase,
  resetBreathingState,
  runBreathingCycle,
} from "../../src/layers/L33_breathing";

describe("L33 breathing fuzzy + synergy layer", () => {
  beforeEach(() => {
    resetBreathingState();
  });

  it("leans to inhale when chaos and growth are both high", () => {
    const metrics = {
      avgSurprise: 0.9,
      avgLearningSignal: 0.8,
      calibrationMismatchRate: 0.25,
      outcomeVolatility: 0.9,
    };

    const fuzzy = computeFuzzyState(metrics);
    const phase = decidePhase(metrics, fuzzy);
    const snapshot = runBreathingCycle(metrics);

    expect(fuzzy.fuzzChaos).toBeGreaterThan(0.6);
    expect(fuzzy.fuzzGrowth).toBeGreaterThan(0.4);
    expect(phase).toBe("inhale");
    expect(snapshot.phase).toBe("inhale");
  });

  it("exhales under stable, low-chaos conditions", () => {
    const metrics = {
      avgSurprise: 0.15,
      avgLearningSignal: 0,
      calibrationMismatchRate: 0.1,
      outcomeVolatility: 0.1,
    };

    const fuzzy = computeFuzzyState(metrics);
    const phase = decidePhase(metrics, fuzzy);
    const snapshot: BreathingSnapshot = runBreathingCycle(metrics);

    expect(fuzzy.fuzzStability).toBeGreaterThan(0.6);
    expect(fuzzy.fuzzChaos).toBeLessThan(0.4);
    expect(phase).toBe("exhale");
    expect(snapshot.phase).toBe("exhale");
  });

  it("boosts the luck-synergy score when flow is positive and surprises are pleasant", () => {
    const metrics = {
      avgSurprise: 0.5,
      avgLearningSignal: 0.4,
      calibrationMismatchRate: 0.1,
      outcomeVolatility: 0.3,
    };

    const fuzzy = computeFuzzyState(metrics);
    const score = computeLuckSynergyScore(metrics, fuzzy);
    const snapshot = runBreathingCycle(metrics);

    expect(score).toBeGreaterThan(0.5);
    expect(snapshot.luckSynergyScore).toBeCloseTo(score, 5);
  });
});
