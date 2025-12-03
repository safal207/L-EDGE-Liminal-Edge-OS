import { beforeEach, describe, expect, it } from "vitest";
import { clearInsights, getRecentInsights } from "../src/layers/L30_insights";
import {
  DecisionOutcome,
  ForesightSignal,
  clearForesightRegistry,
  recordForesightSignal,
  getForesightConfidenceScale,
  resetForesightCalibration,
} from "../src/layers/L31_foresight_engine";
import {
  clearRealizedOutcomes,
  registerRealizedOutcome,
} from "../src/core/outcomeRegistry";
import {
  clearRetrospectives,
  getLuckCalibrationBias,
  resetLuckCalibration,
  runRetrospectiveForDecision,
} from "../src/layers/L32_retrospective";

describe("L32 retrospective calibration", () => {
  const decision: DecisionOutcome = {
    id: "decision-retro",
    kind: "test",
    domain: "calibration",
    tags: ["calibration"],
    risk: 0.3,
    reward: 0.7,
    tension: 0.4,
    createdAt: Date.now(),
  };

  beforeEach(() => {
    clearInsights();
    clearRealizedOutcomes();
    clearRetrospectives();
    clearForesightRegistry();
    resetLuckCalibration();
    resetForesightCalibration();
  });

  it("downscales foresight and luck bias when forecasts are overconfident", () => {
    const foresight: ForesightSignal = makeForesight(decision.id, 0.9, "positive");
    recordForesightSignal(foresight);

    registerRealizedOutcome({
      id: "outcome-negative",
      decisionId: decision.id,
      occurredAt: Date.now(),
      successScore: 0.2,
      valence: "negative",
      predictability: 0.8,
    });

    const record = runRetrospectiveForDecision(decision);

    expect(record?.matchQuality).toBe("overconfident");
    expect(getForesightConfidenceScale()).toBeLessThan(1);
    expect(getLuckCalibrationBias()).toBeLessThan(0);
    expect(
      getRecentInsights().some((insight) =>
        insight.topicTags.includes("calibration"),
      ),
    ).toBe(true);
  });

  it("boosts confidence scale and luck bias when foresight was underconfident", () => {
    const foresight: ForesightSignal = makeForesight(decision.id, 0.3, "positive");
    recordForesightSignal(foresight);

    registerRealizedOutcome({
      id: "outcome-positive",
      decisionId: decision.id,
      occurredAt: Date.now(),
      successScore: 0.9,
      valence: "positive",
      predictability: 0.6,
    });

    const record = runRetrospectiveForDecision(decision);

    expect(record?.matchQuality).toBe("underconfident");
    expect(getForesightConfidenceScale()).toBeGreaterThan(1);
    expect(getLuckCalibrationBias()).toBeGreaterThan(0);
  });
});

function makeForesight(
  decisionId: string,
  confidence: number,
  expectedImpact: ForesightSignal["expectedImpact"],
): ForesightSignal {
  const now = Date.now();
  return {
    id: `foresight_${now}_${confidence}`,
    sourceDecisionId: decisionId,
    horizonMs: 5 * 60 * 1000,
    confidence,
    expectedImpact,
    axes: {},
    createdAt: now,
  };
}
