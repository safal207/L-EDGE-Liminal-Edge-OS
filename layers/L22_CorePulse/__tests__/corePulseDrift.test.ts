import { describe, expect, test } from "vitest";
import { computeCorePulseDrift, enrichPulseWithDrift } from "../corePulseDrift";
import type { CorePulseState } from "../types";

function buildState(intensity: number, variability = 0.1): CorePulseState {
  return {
    baseline: { intensity: 0.5, stability: 0.7 },
    current: {
      intensity,
      variability,
      phase: "rest",
      overloadRisk: 0.1,
    },
    modulation: {
      breathingInfluence: 0,
      luckInfluence: 0,
      emotionalInfluence: 0,
    },
    readiness: 0.5,
    overloadLevel: 0.1,
  };
}

describe("computeCorePulseDrift", () => {
  test("returns stable when history is insufficient", () => {
    const history = [buildState(0.5)];
    expect(computeCorePulseDrift({ history })).toBe("stable");
  });

  test("detects a rising trend", () => {
    const history = [buildState(0.32), buildState(0.48), buildState(0.66)];
    expect(computeCorePulseDrift({ history })).toBe("rising");
  });

  test("detects a falling trend", () => {
    const history = [buildState(0.72), buildState(0.55), buildState(0.38)];
    expect(computeCorePulseDrift({ history })).toBe("falling");
  });

  test("flags irregular oscillations", () => {
    const history = [
      buildState(0.2),
      buildState(0.8),
      buildState(0.25),
      buildState(0.75),
    ];
    expect(computeCorePulseDrift({ history })).toBe("irregular");
  });

  test("stays stable within a narrow band", () => {
    const history = [buildState(0.5), buildState(0.52), buildState(0.48), buildState(0.51)];
    expect(computeCorePulseDrift({ history })).toBe("stable");
  });
});

describe("enrichPulseWithDrift", () => {
  test("returns the latest state annotated with drift", () => {
    const history = [buildState(0.3), buildState(0.45), buildState(0.62)];
    const enriched = enrichPulseWithDrift(history);
    expect(enriched.drift).toBe("rising");
    expect(enriched.current.intensity).toBe(0.62);
  });
});
