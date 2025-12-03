import { beforeEach, describe, expect, it } from "vitest";
import { clearInsights, recordInsight } from "../src/layers/L30_insights";
import {
  DecisionOutcome,
  generateForesightSignal,
} from "../src/layers/L31_foresight_engine";

const baseDecision: DecisionOutcome = {
  id: "decision-1",
  kind: "cooperation",
  domain: "social",
  tags: ["cooperation"],
  risk: 0.2,
  reward: 0.7,
  explorationValue: 0.3,
  createdAt: Date.now(),
};

describe("L31 foresight uses L30 insight context", () => {
  beforeEach(() => {
    clearInsights();
  });

  it("boosts confidence and impact when recent insights are coherent and positive", () => {
    const baseline = generateForesightSignal(baseDecision);

    recordInsight({
      id: "insight-1",
      createdAt: Date.now(),
      sourceLayer: "test",
      polarity: "positive",
      strength: 0.8,
      scope: "social",
      topicTags: ["cooperation"],
      summary: "cooperation feels generative",
    });
    recordInsight({
      id: "insight-2",
      createdAt: Date.now(),
      sourceLayer: "test",
      polarity: "positive",
      strength: 0.7,
      scope: "social",
      topicTags: ["cooperation"],
      summary: "shared effort compounds",
    });
    recordInsight({
      id: "insight-3",
      createdAt: Date.now(),
      sourceLayer: "test",
      polarity: "positive",
      strength: 0.9,
      scope: "system",
      topicTags: ["cooperation"],
      summary: "system wants alignment",
    });

    const withInsights = generateForesightSignal(baseDecision);

    expect(withInsights.confidence).toBeGreaterThan(baseline.confidence);
    expect(withInsights.expectedImpact).toBe("positive");
    expect(
      Array.isArray(withInsights.metadata?.insightTrace) &&
        (withInsights.metadata!.insightTrace as unknown[]).length > 0,
    ).toBe(true);
  });

  it("decreases confidence when insights conflict and marks ambivalence", () => {
    const baseline = generateForesightSignal(baseDecision);

    recordInsight({
      id: "insight-4",
      createdAt: Date.now(),
      sourceLayer: "test",
      polarity: "positive",
      strength: 0.6,
      scope: "social",
      topicTags: ["cooperation"],
      summary: "cooperation opens doors",
    });
    recordInsight({
      id: "insight-5",
      createdAt: Date.now(),
      sourceLayer: "test",
      polarity: "negative",
      strength: 0.6,
      scope: "system",
      topicTags: ["cooperation"],
      summary: "cooperation can overextend",
    });

    const conflicted = generateForesightSignal(baseDecision);

    expect(conflicted.confidence).toBeLessThan(baseline.confidence);
    expect(conflicted.expectedImpact).toBe("ambivalent");
  });
});
