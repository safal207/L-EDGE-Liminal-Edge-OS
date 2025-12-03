export type InsightPolarity = "positive" | "negative" | "neutral";
export type InsightScope = "self" | "social" | "system" | "cosmic";

export interface LiminalInsight {
  id: string;
  createdAt: number;
  sourceLayer: string;
  polarity: InsightPolarity;
  strength: number; // 0..1
  scope: InsightScope;
  topicTags: string[];
  summary: string;
}

const INSIGHT_BUFFER_LIMIT = 128;
const recentInsights: LiminalInsight[] = [];

export function recordInsight(insight: LiminalInsight): void {
  recentInsights.push(insight);
  if (recentInsights.length > INSIGHT_BUFFER_LIMIT) {
    recentInsights.shift();
  }
}

export function getRecentInsights(opts?: {
  sinceMs?: number;
  topicTags?: string[];
}): LiminalInsight[] {
  const now = Date.now();
  return recentInsights.filter((insight) => {
    if (opts?.sinceMs && insight.createdAt < now - opts.sinceMs) {
      return false;
    }

    if (opts?.topicTags && opts.topicTags.length > 0) {
      return insight.topicTags.some((tag) => opts.topicTags!.includes(tag));
    }

    return true;
  });
}

export function clearInsights(): void {
  recentInsights.length = 0;
}
