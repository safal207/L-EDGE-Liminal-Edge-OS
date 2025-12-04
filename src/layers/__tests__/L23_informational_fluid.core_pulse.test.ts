import { describe, expect, it } from "vitest";

import { toCorePulseSnapshot } from "../L22_core_pulse_bridge";
import type { CorePulseState } from "../../layers/L22_CorePulse/types";
import { InformationalFluid, type InformationalFluidConfig } from "../L23_informational_fluid";

const baseConfig: InformationalFluidConfig = {
  imprintHalfLifeMs: 1_000,
  phaseSensitivity: 1,
  basePlasticity: 0.5,
  baseInertia: 0.5,
};

function createFluid() {
  return new InformationalFluid(baseConfig);
}

function supportiveImprint(regionId = "alpha", intensity = 0.5) {
  return {
    id: `imp-${Math.random()}`,
    regionId,
    sourceLayer: "L21",
    timestamp: Date.now(),
    tone: "supportive" as const,
    intensity,
    tags: [],
  };
}

describe("L23 informational fluid <> L22 core pulse bridge", () => {
  it("keeps behavior stable when no pulse is provided", () => {
    const fluid = createFluid();
    fluid.applyImprint(supportiveImprint());

    const snapshot = fluid.getSnapshot();
    const region = snapshot.regions.alpha;

    expect(snapshot.flowState).toBe("normal");
    expect(region.pattern.coherence).toBeGreaterThanOrEqual(0);
    expect(region.pattern.coherence).toBeLessThanOrEqual(1);
  });

  it("amplifies flow for rising, high-modulation pulse", () => {
    const fluid = createFluid();
    const pulse: CorePulseState = {
      baseline: { intensity: 0.75, stability: 0.8 },
      current: { intensity: 0.8, variability: 0.12, phase: "rise", overloadRisk: 0.05 },
      modulation: { breathingInfluence: 0.7, luckInfluence: 0.8, emotionalInfluence: 0.65 },
      readiness: 0.85,
      overloadLevel: 0.1,
      drift: "rising",
    };

    const pulseSnapshot = toCorePulseSnapshot(pulse);
    fluid.applyImprint(supportiveImprint(), pulseSnapshot);

    const snapshot = fluid.getSnapshot();
    const region = snapshot.regions.alpha;

    expect(region.pattern.plasticity).toBeGreaterThan(baseConfig.basePlasticity);
    expect(snapshot.flowState).toBe("amplified");
  });

  it("dampens and stabilizes when pulse is falling or irregular", () => {
    const fluid = createFluid();
    const pulse: CorePulseState = {
      baseline: { intensity: 0.4, stability: 0.45 },
      current: { intensity: 0.3, variability: 0.2, phase: "recovery", overloadRisk: 0.1 },
      modulation: { breathingInfluence: 0.1, luckInfluence: 0.05, emotionalInfluence: 0.1 },
      readiness: 0.25,
      overloadLevel: 0.35,
      drift: "irregular",
    };

    const pulseSnapshot = toCorePulseSnapshot(pulse);
    fluid.applyImprint(supportiveImprint(), pulseSnapshot);

    const snapshot = fluid.getSnapshot();
    const region = snapshot.regions.alpha;

    expect(region.pattern.inertia).toBeGreaterThanOrEqual(baseConfig.baseInertia);
    expect(snapshot.flowState === "stalled" || snapshot.flowState === "normal").toBe(true);
  });
});
