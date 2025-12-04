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
});
