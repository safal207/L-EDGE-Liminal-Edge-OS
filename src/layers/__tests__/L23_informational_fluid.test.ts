import { describe, expect, it } from "vitest";

import { computeInformationalField, type InformationalFluidContext } from "../L23_informational_fluid";

const protectiveContext: InformationalFluidContext = {
  corePulse: {
    drift: "stable",
    overloadLevel: 0.78,
    readiness: 0.32,
  },
  breathing: {
    mode: "ground",
    rate: "slow",
    coreCoupling: { level: "protective", stability: 0.42 },
    coreCouplingSnapshot: { mode: "protective", rate: 0.4, stability: 0.42 },
    phase: "exhale",
  },
};

const expansiveContext: InformationalFluidContext = {
  corePulse: {
    drift: "rising",
    overloadLevel: 0.12,
    readiness: 0.82,
  },
  breathing: {
    mode: "expand",
    rate: "medium",
    coreCoupling: { level: "expansive", stability: 0.74 },
    coreCouplingSnapshot: { mode: "expansive", rate: 0.6, stability: 0.74 },
    phase: "inhale",
  },
};

describe("L23 informational field computation", () => {
  it("tilts toward protection under overload and protective breathing", () => {
    const state = computeInformationalField(protectiveContext);

    expect(state.viscosity).toBeGreaterThan(0.6);
    expect(state.coherence).toBeLessThanOrEqual(0.5);
    expect(state.phaseBias).toBe("protective");
  });

  it("leans expansive when drift is rising and breathing is coherent", () => {
    const state = computeInformationalField(expansiveContext);

    expect(state.viscosity).toBeLessThan(0.5);
    expect(state.coherence).toBeGreaterThanOrEqual(0.6);
    expect(state.phaseBias).toBe("expansive");
  });
});
