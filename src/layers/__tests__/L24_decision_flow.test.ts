import { describe, expect, it } from "vitest";

import type { InformationalFluidSnapshot } from "../L23_informational_fluid";
import type { FlowContext } from "../L24_decision";
import { WaveChoiceEngine, type WaveContext, type WaveOption } from "../L24_wave_choice_engine";
import type { LuckVector } from "../L24_trajectory_harmonizer";

const baseContext: WaveContext = {
  goalDescription: "explore vs protect",
  timestamp: Date.now(),
};

const luck: LuckVector = {
  focusTags: [],
  riskAppetite: 0.5,
  changeDrive: 0.5,
};

const fluid: InformationalFluidSnapshot = {
  regions: {},
  lastGlobalUpdate: Date.now(),
  flowState: "normal",
};

const options: WaveOption[] = [
  {
    id: "safe",
    label: "Stay grounded",
    predictedGain: 0.35,
    predictedRisk: 0.15,
    timeHorizonMs: 1_000,
    expansionScore: 0.2,
    safetyBias: 0.8,
  },
  {
    id: "expansion",
    label: "Lean forward",
    predictedGain: 0.82,
    predictedRisk: 0.6,
    timeHorizonMs: 1_000,
    expansionScore: 0.92,
    safetyBias: 0.2,
  },
];

describe("L24 decision flow with physiological context", () => {
  it("prefers safer options when the field is protective", () => {
    const flowContext: FlowContext = {
      informationalField: { viscosity: 0.72, coherence: 0.42, phaseBias: "protective" },
      corePulse: { drift: "stable", overloadLevel: 0.74, readiness: 0.3 },
      breathing: {
        mode: "ground",
        rate: "slow",
        coreCoupling: { level: "protective", stability: 0.45 },
        coreCouplingSnapshot: { mode: "protective", rate: 0.42, stability: 0.45 },
        phase: "exhale",
      },
    };

    const engine = new WaveChoiceEngine();
    const decision = engine.decide(options, baseContext, luck, fluid, flowContext);

    expect(decision.chosen?.id).toBe("safe");
    expect(decision.ranked[0].score.combinedScore).toBeGreaterThan(decision.ranked[1].score.combinedScore);
  });

  it("leans expansive when drift is rising and breathing is coherent", () => {
    const flowContext: FlowContext = {
      informationalField: { viscosity: 0.38, coherence: 0.68, phaseBias: "expansive" },
      corePulse: { drift: "rising", overloadLevel: 0.18, readiness: 0.82 },
      breathing: {
        mode: "expand",
        rate: "medium",
        coreCoupling: { level: "expansive", stability: 0.76 },
        coreCouplingSnapshot: { mode: "expansive", rate: 0.62, stability: 0.76 },
        phase: "inhale",
      },
    };

    const engine = new WaveChoiceEngine();
    const decision = engine.decide(options, baseContext, luck, fluid, flowContext);

    expect(decision.chosen?.id).toBe("expansion");
    expect(decision.ranked[0].score.combinedScore).toBeGreaterThan(decision.ranked[1].score.combinedScore);
  });
});
