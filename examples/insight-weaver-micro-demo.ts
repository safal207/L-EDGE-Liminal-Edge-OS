import { InsightWeaver, type Insight, type InsightWeaverConfig, type InsightSelectionContext, type LayerId } from "../src/core/insight-weaver";

interface RawInsight {
  layerId: LayerId;
  text: string;
  clarity: number;
  crossLayerImpact: number;
  novelty: number;
  emotionalLoad: number;
  sourceTag: string;
}

function buildInsights(raw: RawInsight[], now: number): Insight[] {
  return raw.map((item, idx) => ({
    ...item,
    id: `demo-${idx + 1}`,
    timestamp: now - (raw.length - idx) * 500,
  }));
}

const config: InsightWeaverConfig = {
  weights: {
    clarity: 0.4,
    crossLayerImpact: 0.3,
    novelty: 0.2,
    emotionalLoad: 0.1,
  },
  emotionalLoad: {
    maxSafe: 0.8,
    overloadPenalty: 0.25,
  },
  fairness: {
    perLayerCooldownMs: 60_000,
  },
  luck: {
    randomness: 0,
    diversityBoost: 0.1,
  },
};

function scoreBreakdown(insight: Insight, context: InsightSelectionContext) {
  const overloadPenalty = insight.emotionalLoad > config.emotionalLoad.maxSafe ? config.emotionalLoad.overloadPenalty : 0;
  const emotionalComponent = Math.max(0, insight.emotionalLoad - overloadPenalty);

  const baseScore =
    config.weights.clarity * insight.clarity +
    config.weights.crossLayerImpact * insight.crossLayerImpact +
    config.weights.novelty * insight.novelty +
    config.weights.emotionalLoad * emotionalComponent;

  const baseWithPenalty = overloadPenalty > 0 ? baseScore - overloadPenalty : baseScore;

  const layerHistory = context.layerUsageHistory[insight.layerId];
  const isCoolingDown =
    !!layerHistory && context.currentTime - layerHistory.lastUsedAt < config.fairness.perLayerCooldownMs;
  const fairnessFactor = isCoolingDown ? 0.5 : 1;
  const fairnessScore = baseWithPenalty * fairnessFactor;

  const diversityBonus = layerHistory ? 0 : config.luck.diversityBoost;

  return {
    baseWithPenalty,
    emotionalPenalty: overloadPenalty,
    fairnessFactor,
    diversityBonus,
    final: fairnessScore + diversityBonus,
  } as const;
}

async function main() {
  const now = Date.now();
  const raw: RawInsight[] = [
    {
      layerId: "L10_SELF_NAVIGATION",
      text: "Сделай короткий health-чекап по проекту, а не прыгай в 5 задач сразу.",
      clarity: 0.82,
      crossLayerImpact: 0.55,
      novelty: 0.42,
      emotionalLoad: 0.35,
      sourceTag: "journal",
    },
    {
      layerId: "L21_SOCIAL_FIELD",
      text: "Покажи свежий прототип живому человеку и спроси 1–2 конкретных вопроса.",
      clarity: 0.76,
      crossLayerImpact: 0.78,
      novelty: 0.61,
      emotionalLoad: 0.48,
      sourceTag: "conversation",
    },
    {
      layerId: "L10_SELF_NAVIGATION",
      text: "Не распыляйся: выбери одно окно в календаре под deep-work и защити его.",
      clarity: 0.7,
      crossLayerImpact: 0.63,
      novelty: 0.35,
      emotionalLoad: 0.6,
      sourceTag: "planning_note",
    },
    {
      layerId: "L27_COSMIC_TIMING",
      text: "Сегодня тихий фон — хорошее окно, чтобы опубликовать короткий devlog.",
      clarity: 0.68,
      crossLayerImpact: 0.72,
      novelty: 0.77,
      emotionalLoad: 0.4,
      sourceTag: "timing_signal",
    },
  ];

  const insights = buildInsights(raw, now);

  const context: InsightSelectionContext = {
    currentTime: now,
    recentChosenInsightIds: [],
    layerUsageHistory: {
      L10_SELF_NAVIGATION: {
        lastUsedAt: now - 20_000,
        usageCount: 4,
      },
      L21_SOCIAL_FIELD: {
        lastUsedAt: now - 120_000,
        usageCount: 2,
      },
    },
  };

  const weaver = new InsightWeaver(config);
  const selection = weaver.selectInsightsForAction(insights, context, {
    limit: 2,
    minScore: 0.35,
  });

  console.log("=== Входные инсайты ===");
  for (const insight of insights) {
    console.log(`- [${insight.layerId}] ${insight.text}`);
  }

  console.log("\n=== Обоснование (скоринг L30) ===");
  for (const insight of insights) {
    const breakdown = scoreBreakdown(insight, context);
    console.log(
      `- [${insight.layerId}] base=${breakdown.baseWithPenalty.toFixed(3)}, fairness×${breakdown.fairnessFactor}, ` +
        `diversity=+${breakdown.diversityBonus.toFixed(2)} → score=${breakdown.final.toFixed(3)}`,
    );
  }

  console.log("\n=== Выбранные инсайты (1–2 штуки) ===");
  for (const scored of selection) {
    const breakdown = scoreBreakdown(scored.insight, context);
    console.log(
      `> [score=${scored.score.toFixed(3)}] [${scored.insight.layerId}] ${scored.insight.text}\n  ` +
        `fairness×${breakdown.fairnessFactor}, diversity=+${breakdown.diversityBonus.toFixed(2)}, ` +
        `${breakdown.emotionalPenalty > 0 ? `overload -${breakdown.emotionalPenalty}` : "soft load"}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
