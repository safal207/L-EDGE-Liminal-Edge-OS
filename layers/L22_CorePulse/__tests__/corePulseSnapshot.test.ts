import { describe, expect, it } from "vitest";

import { computeCorePulseSnapshot } from "@/layers/L22_core_pulse";
import type { CorePulseInput } from "../types";

describe("computeCorePulseSnapshot", () => {
  it("returns a stable snapshot for tightly clustered history", () => {
    const history: CorePulseInput[] = [
      { intensity: 0.5, variability: 0.1, phase: "rest" },
      { intensity: 0.52, variability: 0.12, phase: "rise" },
    ];

    const snapshot = computeCorePulseSnapshot(history, {
      intensity: 0.5,
      variability: 0.11,
      phase: "rest",
    });

    expect(snapshot.drift).toBe("stable");
    expect(snapshot.modulation.modulationLevel).toBeCloseTo(0.5, 2);
    expect(snapshot.readiness).toBeGreaterThan(0.4);
  });

  it("detects a rising drift and boosts readiness slightly", () => {
    const history: CorePulseInput[] = [
      { intensity: 0.35, variability: 0.08, phase: "rest" },
      { intensity: 0.45, variability: 0.1, phase: "rise" },
      { intensity: 0.58, variability: 0.12, phase: "peak" },
    ];

    const snapshot = computeCorePulseSnapshot(history, {
      intensity: 0.7,
      variability: 0.14,
      phase: "peak",
    });

    expect(snapshot.drift).toBe("rising");
    expect(snapshot.readiness).toBeGreaterThan(0.55);
    expect(snapshot.modulation.modulationLevel).toBeGreaterThan(0.55);
  });

  it("stabilizes a rising but coherent pulse when breathing is steady", () => {
    const history: CorePulseInput[] = [
      { intensity: 0.46, variability: 0.12, phase: "rest", overloadRisk: 0.35 },
      { intensity: 0.5, variability: 0.15, phase: "rise", overloadRisk: 0.4 },
    ];

    const snapshot = computeCorePulseSnapshot(history, {
      intensity: 0.58,
      variability: 0.18,
      phase: "rise",
      overloadRisk: 0.45,
      breathing: { mode: "coherent", stability: 0.88, rate: 0.55 },
    });

    expect(snapshot.drift).toBe("stable");
    expect(snapshot.overloadLevel).toBeLessThan(0.5);
    expect(["medium", "high"]).toContain(snapshot.readinessBand);
  });

  it("flags irregular drift when breathing is protective but shaky", () => {
    const history: CorePulseInput[] = [
      { intensity: 0.62, variability: 0.22, phase: "peak", overloadRisk: 0.7 },
      { intensity: 0.57, variability: 0.25, phase: "recovery", overloadRisk: 0.75 },
    ];

    const snapshot = computeCorePulseSnapshot(history, {
      intensity: 0.6,
      variability: 0.28,
      phase: "recovery",
      overloadRisk: 0.8,
      breathing: { mode: "protective", stability: 0.4, rate: 0.7 },
    });

    expect(snapshot.drift).toBe("irregular");
    expect(snapshot.overloadLevel).toBeGreaterThan(0.65);
    expect(snapshot.readinessBand).toBe("low");
  });

  it("keeps expansive growth controlled with stable breathing", () => {
    const history: CorePulseInput[] = [
      { intensity: 0.4, variability: 0.12, phase: "rest", overloadRisk: 0.2 },
      { intensity: 0.52, variability: 0.14, phase: "rise", overloadRisk: 0.25 },
      { intensity: 0.6, variability: 0.16, phase: "peak", overloadRisk: 0.3 },
    ];

    const snapshot = computeCorePulseSnapshot(history, {
      intensity: 0.65,
      variability: 0.17,
      phase: "peak",
      overloadRisk: 0.32,
      breathing: { mode: "expansive", stability: 0.74, rate: 0.75 },
    });

    expect(snapshot.drift).toBe("rising");
    expect(snapshot.overloadLevel).toBeLessThan(0.5);
    expect(snapshot.readinessBand === "high" || snapshot.readinessBand === "medium").toBe(true);
  });
});
