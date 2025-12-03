import { beforeEach, describe, expect, it } from "vitest";
import { clearRealizedOutcomes, registerRealizedOutcome } from "../../src/core/outcomeRegistry";
import { createDecision } from "../../src/layers/L24_decision";
import {
  DecisionOutcome,
  ForesightSignal,
  clearForesightRegistry,
  getForesightConfidenceScale,
  recordForesightSignal,
  resetForesightCalibration,
} from "../../src/layers/L31_foresight_engine";
import {
  clearRetrospectiveLog,
  getLuckCalibrationBias,
  resetLuckCalibration,
  runRetrospectiveForDecision,
} from "../../src/layers/L32_retrospective";

const baseDecision: Omit<DecisionOutcome, "id" | "createdAt"> = {
  kind: "test",
  domain: "loop",
  reward: 0.5,
  risk: 0.4,
  tension: 0.4,
  explorationValue: 0.2,
};

describe("foresight → outcome → retrospective loop", () => {
  beforeEach(() => {
    clearRealizedOutcomes();
    clearForesightRegistry();
    resetForesightCalibration();
    resetLuckCalibration();
    clearRetrospectiveLog();
  });

  it("marks overconfident paths and downscales calibration", () => {
    const decision = createDecision({ ...baseDecision, id: "overconfident-decision" });
    const foresight = makeForesight(decision.id, 0.9, "positive");
    recordForesightSignal(foresight);

    registerRealizedOutcome({
      id: "outcome-overconfident",
      decisionId: decision.id,
      occurredAt: Date.now(),
      successScore: 0.3,
      valence: "positive",
      predictability: 0.2,
    });

    const retrospective = runRetrospectiveForDecision(decision);

    expect(retrospective?.matchQuality).toBe("overconfident");
    expect(retrospective?.learningSignal ?? 0).toBeLessThan(0);
    expect(getForesightConfidenceScale()).toBeLessThan(1);
    expect(getLuckCalibrationBias()).toBeLessThan(0);
  });

  it("detects underconfident wins and nudges calibration upward", () => {
    const decision = createDecision({ ...baseDecision, id: "underconfident-decision" });
    const foresight = makeForesight(decision.id, 0.3, "positive");
    recordForesightSignal(foresight);

    registerRealizedOutcome({
      id: "outcome-underconfident",
      decisionId: decision.id,
      occurredAt: Date.now(),
      successScore: 0.9,
      valence: "positive",
      predictability: 0.7,
    });

    const retrospective = runRetrospectiveForDecision(decision);

    expect(retrospective?.matchQuality).toBe("underconfident");
    expect(retrospective?.learningSignal ?? 0).toBeGreaterThan(0);
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
