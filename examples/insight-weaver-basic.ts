import { InsightWeaver, type Insight, type InsightWeaverConfig } from "../src/core/insight-weaver";
import type { LayerId } from "../src/core/insight-weaver";

function createDemoInsights(): Insight[] {
  const now = Date.now();

  const layerSelf: LayerId = "L10_SELF_NAVIGATION";
  const layerSocial: LayerId = "L21_SOCIAL_FIELD";
  const layerCosmic: LayerId = "L27_COSMIC_TIMING";

  return [
    {
      id: "i1",
      layerId: layerSelf,
      text: "Сделай один маленький шаг по проекту, а не 10 бесполезных.",
      clarity: 0.9,
      crossLayerImpact: 0.6,
      novelty: 0.5,
      emotionalLoad: 0.4,
      sourceTag: "daily_reflection",
      timestamp: now - 1000,
    },
    {
      id: "i2",
      layerId: layerSocial,
      text: "Попроси обратную связь у одного живого человека по LIMINAL, а не сиди в вакууме.",
      clarity: 0.75,
      crossLayerImpact: 0.9,
      novelty: 0.7,
      emotionalLoad: 0.6,
      sourceTag: "conversation",
      timestamp: now - 500,
    },
    {
      id: "i3",
      layerId: layerCosmic,
      text: "Сегодня хорошее окно, чтобы показать один PR наружу, а не шлифовать вечно.",
      clarity: 0.7,
      crossLayerImpact: 0.8,
      novelty: 0.9,
      emotionalLoad: 0.5,
      sourceTag: "timing_signal",
      timestamp: now - 200,
    },
    {
      id: "i4",
      layerId: layerSelf,
      text: "Ты снова хочешь всё переделать с нуля — проверь, не бежишь ли ты от страха.",
      clarity: 0.8,
      crossLayerImpact: 0.4,
      novelty: 0.4,
      emotionalLoad: 0.9,
      sourceTag: "self_criticism",
      timestamp: now - 50,
    },
  ];
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
    overloadPenalty: 0.3,
  },
  fairness: {
    perLayerCooldownMs: 60_000,
  },
  luck: {
    randomness: 0.05,
    diversityBoost: 0.1,
  },
};

async function main() {
  const weaver = new InsightWeaver(config);

  const insights = createDemoInsights();

  const context = {
    currentTime: Date.now(),
    recentChosenInsightIds: [],
    layerUsageHistory: {},
  } as const;

  const selection = weaver.selectInsightsForAction(insights, context, {
    limit: 2,
    minScore: 0.4,
  });

  console.log("=== Кандидаты ===");
  for (const i of insights) {
    console.log(
      `- [${i.layerId}] ${i.text} (clarity=${i.clarity}, cross=${i.crossLayerImpact}, novelty=${i.novelty}, emo=${i.emotionalLoad})`,
    );
  }

  console.log("\n=== Выбранные инсайды (L30) ===");
  for (const s of selection) {
    console.log(`> [score=${s.score.toFixed(3)}] [layer=${s.insight.layerId}] ${s.insight.text}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
