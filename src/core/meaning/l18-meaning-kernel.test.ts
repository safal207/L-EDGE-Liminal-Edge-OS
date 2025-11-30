import { describe, it, expect } from "vitest";
import { computeMeaningKernelState } from "./l18-meaning-kernel";
import type { MeaningKernelInput } from "./l18-types";

const baseInput: MeaningKernelInput = {
  temporal: {
    past: [],
    now: {
      stepIndex: 10,
      timestamp: Date.now(),
      axes: { inner: 0.6, social: 0.3, cosmic: 0.1 },
      phase: 0.5,
      stability: 0.8,
      recoveryTime: 2000,
      tension: 0.3,
      feeling: {
        intensity: 0.2,
        direction: "toward_fluidity",
        deltaPhase: 0.05,
        rate: 0.00001,
        axisShift: { inner: 0, social: 0, cosmic: 0 },
        phaseBefore: 0.45,
        phaseAfter: 0.5,
      },
      goalProjection: {
        targetAxes: { inner: 0.7, social: 0.2, cosmic: 0.1 },
        horizonSteps: 10,
      },
    },
    future: [],
  },
  timeCrystal: {
    deltaAxes: { inner: 0.1, social: -0.1, cosmic: 0 },
    targetPhase: 0.5,
    confidence: 0.8,
    horizonSteps: 10,
    tmi: {
      value: 1.0,
      stabilityComponent: 0.3,
      driftComponent: 0.2,
      feelingComponent: 0.3,
    },
    drift: { value: 0.2 },
    alignment: { value: 0.8 },
  },
  purpose: {
    inner: 0.7,
    social: 0.2,
    cosmic: 0.1,
    tags: ["research", "healing"],
    narrative: "To explore and stabilize conscious systems.",
  },
  resourceEstimate: {
    timeBudgetSteps: 80,
    maxTimeBudgetSteps: 100,
    resourceLoad: 0.5,
  },
};

describe("L18 Meaning Kernel", () => {
  it("computes a coherent meaning kernel state", () => {
    const mk = computeMeaningKernelState(baseInput);

    expect(mk.purpose.inner + mk.purpose.social + mk.purpose.cosmic).toBeCloseTo(
      1,
      3
    );
    expect(mk.finiteness.value).toBeGreaterThanOrEqual(0);
    expect(mk.finiteness.value).toBeLessThanOrEqual(1);

    expect(mk.contentment.value).toBeGreaterThanOrEqual(0);
    expect(mk.contentment.value).toBeLessThanOrEqual(1);
  });

  it("reflects low contentment when axes are far from purpose", () => {
    const input: MeaningKernelInput = {
      ...baseInput,
      temporal: {
        ...baseInput.temporal,
        now: {
          ...baseInput.temporal.now!,
          axes: { inner: 0.0, social: 1.0, cosmic: 0.0 }, // сильно не туда
        },
      },
    };

    const mk = computeMeaningKernelState(input);

    expect(mk.contentment.value).toBeLessThan(0.5);
    expect(mk.contentment.purposeAlignment).toBeLessThan(0.5);
  });
});
