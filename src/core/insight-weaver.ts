export type LayerId = string;

export interface Insight {
  id: string;
  layerId: LayerId;
  text: string;
  clarity: number; // 0..1
  crossLayerImpact: number; // 0..1
  novelty: number; // 0..1
  emotionalLoad: number; // 0..1
  sourceTag: string;
  timestamp: number;
}

export interface InsightWeaverConfig {
  weights: {
    clarity: number;
    crossLayerImpact: number;
    novelty: number;
    emotionalLoad: number;
  };
  emotionalLoad: {
    maxSafe: number;
    overloadPenalty: number;
  };
  fairness: {
    perLayerCooldownMs: number;
  };
  luck: {
    randomness: number; // 0..1
    diversityBoost: number; // additive bonus for underused layers
  };
}

export interface LayerUsageMeta {
  lastUsedAt: number;
  usageCount: number;
}

export interface InsightSelectionContext {
  currentTime: number;
  recentChosenInsightIds: string[];
  layerUsageHistory: Record<LayerId, LayerUsageMeta>;
}

export interface SelectionOptions {
  limit: number;
  minScore: number;
}

export interface ScoredInsight {
  insight: Insight;
  score: number;
}

export class InsightWeaver {
  constructor(private readonly config: InsightWeaverConfig) {}

  selectInsightsForAction(
    insights: Insight[],
    context: InsightSelectionContext,
    options: SelectionOptions,
  ): ScoredInsight[] {
    const scored = insights.map((insight) => {
      const baseScore = this.computeBaseScore(insight);
      const fairnessAdjusted = this.applyFairness(insight, baseScore, context);
      const diversified = this.applyDiversityBoost(insight, fairnessAdjusted, context);
      const noisy = this.applyLuck(diversified);

      return {
        insight,
        score: noisy,
      } as ScoredInsight;
    });

    const filtered = scored
      .filter((s) => s.score >= options.minScore && !context.recentChosenInsightIds.includes(s.insight.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, options.limit);

    return filtered;
  }

  private computeBaseScore(insight: Insight): number {
    const { weights, emotionalLoad } = this.config;
    const overload = insight.emotionalLoad > emotionalLoad.maxSafe ? emotionalLoad.overloadPenalty : 0;
    const emotionalComponent = Math.max(0, insight.emotionalLoad - overload);

    const base =
      weights.clarity * insight.clarity +
      weights.crossLayerImpact * insight.crossLayerImpact +
      weights.novelty * insight.novelty +
      weights.emotionalLoad * emotionalComponent;

    return overload > 0 ? base - overload : base;
  }

  private applyFairness(insight: Insight, score: number, context: InsightSelectionContext): number {
    const { perLayerCooldownMs } = this.config.fairness;
    const layerHistory = context.layerUsageHistory[insight.layerId];

    if (!layerHistory) return score;

    const timeSinceUse = context.currentTime - layerHistory.lastUsedAt;
    if (timeSinceUse < perLayerCooldownMs) {
      // Penalize recently used layers to give others a chance.
      return score * 0.5;
    }

    return score;
  }

  private applyDiversityBoost(insight: Insight, score: number, context: InsightSelectionContext): number {
    if (!context.layerUsageHistory[insight.layerId]) {
      return score + this.config.luck.diversityBoost;
    }
    return score;
  }

  private applyLuck(score: number): number {
    if (this.config.luck.randomness === 0) return score;
    const jitter = (Math.random() - 0.5) * this.config.luck.randomness;
    return score + jitter;
  }
}
