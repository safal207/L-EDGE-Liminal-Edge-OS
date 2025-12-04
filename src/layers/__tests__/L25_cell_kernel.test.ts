import { describe, expect, it } from "vitest";

import type { ResourceContext } from "../L25_cell_kernel";
import { computeResourceState } from "../L25_cell_kernel";

describe("L25 cell kernel resource integration", () => {
  it("raises strain and lowers energy under overload and protective pressure", () => {
    const ctx: ResourceContext = {
      corePulse: { overloadLevel: 0.85, readiness: 0.4, drift: "irregular" },
      informationalField: { viscosity: 0.8, coherence: 0.3, phaseBias: "protective" },
      breathing: {
        mode: "ground",
        rate: "fast",
        phase: "inhale",
        coreCoupling: { level: "protective", stability: 0.3 },
      },
      lastDecision: { id: "d1", kind: "test", createdAt: Date.now(), risk: 0.7 },
    };

    const state = computeResourceState(ctx);

    expect(state.strain).toBeGreaterThan(0.6);
    expect(state.energy).toBeLessThan(0.6);
    expect(state.regenerationTendency).toBeLessThanOrEqual(0.5);
  });

  it("leans into regeneration when pulse is calm and breathing is coherent", () => {
    const ctx: ResourceContext = {
      corePulse: { overloadLevel: 0.2, readiness: 0.75, drift: "stable" },
      informationalField: { viscosity: 0.35, coherence: 0.7, phaseBias: "expansive" },
      breathing: {
        mode: "steady",
        rate: "slow",
        phase: "exhale",
        coreCoupling: { level: "coherent", stability: 0.82 },
      },
      lastDecision: { id: "d2", kind: "test", createdAt: Date.now(), risk: 0.1 },
    };

    const state = computeResourceState(ctx);

    expect(state.strain).toBeLessThan(0.4);
    expect(state.regenerationTendency).toBeGreaterThan(0.6);
    expect(state.energy).toBeGreaterThan(0.65);
  });
});
