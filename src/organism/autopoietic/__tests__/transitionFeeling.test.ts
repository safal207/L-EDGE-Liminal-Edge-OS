// src/core/autopoiesis/transitionFeeling.test.ts

import { describe, it, expect } from "vitest";
import { computeTransitionFeeling } from "../transitionFeeling";

describe("computeTransitionFeeling", () => {
  it("detects a strong fast transition toward chaos", () => {
    const feeling = computeTransitionFeeling({
      phaseBefore: 0.2,
      phaseAfter: 0.9,
      deltaTimeMs: 1000,
      axisBefore: { inner: 0.3, social: 0.3, cosmic: 0.4 },
      axisAfter: { inner: 0.2, social: 0.4, cosmic: 0.8 },
    });

    expect(feeling.direction).toBe("toward_chaos");
    expect(feeling.intensity).toBeGreaterThan(0.5);
    expect(feeling.deltaPhase).toBeCloseTo(0.7, 2);
  });

  it("detects a mild slow transition toward fluidity", () => {
    const feeling = computeTransitionFeeling({
      phaseBefore: 0.45,
      phaseAfter: 0.55,
      deltaTimeMs: 5000,
      axisBefore: { inner: 0.4, social: 0.4, cosmic: 0.2 },
      axisAfter: { inner: 0.42, social: 0.43, cosmic: 0.25 },
    });

    expect(feeling.direction).toBe("toward_fluidity");
    expect(feeling.intensity).toBeLessThan(0.5);
    expect(Math.abs(feeling.deltaPhase)).toBeCloseTo(0.1, 2);
  });
});
