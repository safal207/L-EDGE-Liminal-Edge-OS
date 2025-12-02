import { describe, it, expect } from "vitest";
import { InsightWeaver, type Insight, type InsightWeaverConfig } from "../src/core/insight-weaver";
import type { LayerId } from "../src/core/insight-weaver";

const baseConfig: InsightWeaverConfig = {
  weights: {
    clarity: 0.4,
    crossLayerImpact: 0.3,
    novelty: 0.2,
    emotionalLoad: 0.1,
  },
  emotionalLoad: {
    maxSafe: 0.8,
    overloadPenalty: 0.3,
  },
  fairness: {
    perLayerCooldownMs: 60_000,
  },
  luck: {
    randomness: 0,
    diversityBoost: 0,
  },
};

function layer(id: string): LayerId {
  return id as LayerId;
}

function makeInsight(partial: Partial<Insight> & { id: string; text: string }): Insight {
  const now = Date.now();
  return {
    layerId: layer("L_TEST"),
    clarity: 0.5,
    crossLayerImpact: 0.5,
    novelty: 0.5,
    emotionalLoad: 0.5,
    sourceTag: "test",
    timestamp: now,
    ...partial,
  };
}

describe("InsightWeaver (L30) — базовая логика", () => {
  it("отбирает самый сильный инсайд по метрикам", () => {
    const weaver = new InsightWeaver(baseConfig);

    const insights: Insight[] = [
      makeInsight({
        id: "weak",
        text: "Сделай что-нибудь, но непонятно что.",
        clarity: 0.3,
        crossLayerImpact: 0.2,
        novelty: 0.2,
      }),
      makeInsight({
        id: "strong",
        text: "Сделай один конкретный маленький шаг.",
        clarity: 0.9,
        crossLayerImpact: 0.8,
        novelty: 0.7,
      }),
    ];

    const selection = weaver.selectInsightsForAction(
      insights,
      {
        currentTime: Date.now(),
        recentChosenInsightIds: [],
        layerUsageHistory: {},
      },
      {
        limit: 1,
        minScore: 0.1,
      },
    );

    expect(selection).toHaveLength(1);
    expect(selection[0].insight.id).toBe("strong");
  });

  it("снижает приоритет при перегрузе по эмоциям", () => {
    const weaver = new InsightWeaver(baseConfig);

    const insights: Insight[] = [
      makeInsight({
        id: "calm",
        text: "Сделай паузу на 5 минут и подыши.",
        clarity: 0.8,
        crossLayerImpact: 0.6,
        novelty: 0.5,
        emotionalLoad: 0.3,
      }),
      makeInsight({
        id: "overheated",
        text: "Срочно всё брось и сделай революцию.",
        clarity: 0.85,
        crossLayerImpact: 0.7,
        novelty: 0.6,
        emotionalLoad: 0.99,
      }),
    ];

    const selection = weaver.selectInsightsForAction(
      insights,
      {
        currentTime: Date.now(),
        recentChosenInsightIds: [],
        layerUsageHistory: {},
      },
      {
        limit: 1,
        minScore: 0.1,
      },
    );

    expect(selection).toHaveLength(1);
    expect(selection[0].insight.id).toBe("calm");
  });

  it("учитывает fairness: не даёт одному слою спамить", () => {
    const config: InsightWeaverConfig = {
      ...baseConfig,
      fairness: {
        perLayerCooldownMs: 60_000,
      },
    };

    const weaver = new InsightWeaver(config);

    const layerA = layer("L_A");
    const layerB = layer("L_B");

    const insights: Insight[] = [
      makeInsight({
        id: "from_A",
        text: "Инсайд из слоя A.",
        layerId: layerA,
        clarity: 0.9,
        crossLayerImpact: 0.8,
      }),
      makeInsight({
        id: "from_B",
        text: "Инсайд из слоя B.",
        layerId: layerB,
        clarity: 0.85,
        crossLayerImpact: 0.75,
      }),
    ];

    const now = Date.now();

    const firstSelection = weaver.selectInsightsForAction(
      insights,
      {
        currentTime: now,
        recentChosenInsightIds: [],
        layerUsageHistory: {},
      },
      {
        limit: 1,
        minScore: 0.1,
      },
    );

    expect(firstSelection).toHaveLength(1);
    const chosen = firstSelection[0].insight;
    expect(chosen.layerId === layerA || chosen.layerId === layerB).toBe(true);

    const layerUsageHistory = {
      [chosen.layerId]: {
        lastUsedAt: now,
        usageCount: 5,
      },
    };

    const secondSelection = weaver.selectInsightsForAction(
      insights,
      {
        currentTime: now + 1_000,
        recentChosenInsightIds: [chosen.id],
        layerUsageHistory,
      },
      {
        limit: 1,
        minScore: 0.1,
      },
    );

    if (chosen.layerId === layerA) {
      expect(secondSelection[0].insight.layerId).toBe(layerB);
    } else {
      expect(secondSelection[0].insight.layerId).toBe(layerA);
    }
  });

  it("может возвращать пустой список, если нет достойных инсайтов", () => {
    const weaver = new InsightWeaver(baseConfig);

    const insights: Insight[] = [
      makeInsight({
        id: "noise1",
        text: "Шум, без смысла.",
        clarity: 0.1,
        crossLayerImpact: 0.1,
        novelty: 0.1,
      }),
    ];

    const selection = weaver.selectInsightsForAction(
      insights,
      {
        currentTime: Date.now(),
        recentChosenInsightIds: [],
        layerUsageHistory: {},
      },
      {
        limit: 3,
        minScore: 0.5,
      },
    );

    expect(selection).toHaveLength(0);
  });
});
