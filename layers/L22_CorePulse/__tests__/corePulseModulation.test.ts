import { describe, expect, it } from "vitest";
import { computePulseModulation } from "../modulation";
import type { PulseModulationInput } from "../types";

const baseInput: PulseModulationInput = {};

describe("computePulseModulation", () => {
  it("returns neutral modulation for stable drift with calm inputs", () => {
    const result = computePulseModulation("stable", baseInput);
    expect(result.modulationLevel).toBeGreaterThanOrEqual(0.45);
    expect(result.modulationLevel).toBeLessThanOrEqual(0.55);
    expect(result.phaseCoefficient).toBeCloseTo(0, 3);
    expect(result.recommendedRhythm).toBe("neutral");
    expect(result.stabilized).toBe(false);
  });

  it("accelerates with rising drift and uplift", () => {
    const result = computePulseModulation("rising", {
      ...baseInput,
      senseUplift: 0.8,
      luckResonance: 0.6,
      breathingCoherence: 0.7,
    });
    expect(result.modulationLevel).toBeGreaterThan(0.7);
    expect(result.recommendedRhythm).toBe("fast");
    expect(result.stabilized).toBe(true);
    expect(result.phaseCoefficient).toBeGreaterThan(0);
  });

  it("slows with falling drift and tension", () => {
    const result = computePulseModulation("falling", {
      ...baseInput,
      senseTension: 0.7,
      breathingCoherence: 0.6,
    });
    expect(result.modulationLevel).toBeLessThan(0.5);
    expect(result.recommendedRhythm).toBe("slow");
    expect(result.phaseCoefficient).toBeLessThanOrEqual(0);
  });

  it("marks instability under irregular drift with low coherence", () => {
    const result = computePulseModulation("irregular", {
      senseTension: 0.4,
      senseUplift: 0.2,
      breathingCoherence: 0.1,
      foresightPhase: -0.3,
    });
    expect(result.stabilized).toBe(false);
    expect(result.recommendedRhythm).toBe("neutral");
    expect(result.phaseCoefficient).toBeLessThanOrEqual(0);
  });
});
