import { getRecentInsights, LiminalInsight } from "./L30_insights";

export type ForesightImpactAxis = "risk" | "reward" | "stability" | "exploration";

export interface DecisionOutcome {
  id: string;
  kind: string;
  domain?: string;
  tags?: string[];
  topicTags?: string[];
  risk?: number;
  reward?: number;
  tension?: number;
  explorationValue?: number;
  createdAt: number;
}

export interface InsightContext {
  relevant: LiminalInsight[];
  positiveScore: number;
  negativeScore: number;
  coherence: number;
}

export interface ForesightSignal {
  id: string;
  sourceDecisionId: string;
  horizonMs: number;
  confidence: number;
  expectedImpact: "positive" | "negative" | "ambivalent";
  axes: Partial<Record<ForesightImpactAxis, number>>;
  tensionDelta?: number;
  energyBudgetHint?: "conserve" | "spend" | "neutral";
  metadata?: Record<string, unknown>;
  createdAt: number;
}

export function buildInsightContextForDecision(
  decision: DecisionOutcome,
  options?: { windowMs?: number },
): InsightContext {
  const tags = extractTagsFromDecision(decision);
  const relevant = getRecentInsights({
    sinceMs: options?.windowMs ?? 30 * 60 * 1000,
    topicTags: tags,
  });

  if (relevant.length === 0) {
    return { relevant: [], positiveScore: 0, negativeScore: 0, coherence: 0 };
  }

  let positiveScore = 0;
  let negativeScore = 0;

  for (const insight of relevant) {
    if (insight.polarity === "positive") {
      positiveScore += insight.strength;
    }

    if (insight.polarity === "negative") {
      negativeScore += insight.strength;
    }
  }

  const total = positiveScore + negativeScore;
  const coherence = total === 0 ? 0 : Math.abs(positiveScore - negativeScore) / total;

  return { relevant, positiveScore, negativeScore, coherence };
}

export function generateForesightSignal(decision: DecisionOutcome): ForesightSignal {
  const tags = extractTagsFromDecision(decision);
  const riskLevel = clampSigned((decision.reward ?? 0) - (decision.risk ?? 0));
  const explorationLevel = clamp01(decision.explorationValue ?? 0.25);
  const stabilityLevel = clampSigned(1 - (decision.tension ?? 0.5));

  const insightContext = buildInsightContextForDecision(decision);
  const insightWeight = Math.min(1, insightContext.positiveScore + insightContext.negativeScore);
  const insightDirection =
    insightContext.positiveScore >= insightContext.negativeScore ? 1 : -1;

  const baseConfidence = clamp01(
    0.25 + 0.35 * Math.abs(riskLevel) + 0.2 * explorationLevel + 0.2 * clamp01(stabilityLevel),
  );

  const insightBoost = 0.2 * insightContext.coherence * insightWeight;
  const insightPenalty = 0.15 * (1 - insightContext.coherence) * insightWeight;

  let confidence = clamp01(baseConfidence + insightBoost - insightPenalty);

  let expectedImpact: ForesightSignal["expectedImpact"] = riskLevel >= 0 ? "positive" : "negative";
  if (insightWeight > 0.2) {
    if (insightContext.coherence < 0.3) {
      expectedImpact = "ambivalent";
    } else {
      expectedImpact = insightDirection > 0 ? "positive" : "negative";
    }
  }

  return {
    id: `foresight_${Date.now()}`,
    sourceDecisionId: decision.id,
    horizonMs: 5 * 60 * 1000,
    confidence,
    expectedImpact,
    axes: {
      risk: riskLevel,
      reward: clampSigned(decision.reward ?? 0),
      stability: clampSigned(stabilityLevel),
      exploration: explorationLevel,
    },
    tensionDelta: riskLevel > 0 ? 0.05 : -0.05,
    energyBudgetHint: riskLevel > 0 ? "spend" : "conserve",
    metadata: {
      decisionKind: decision.kind,
      decisionDomain: decision.domain,
      tags,
      insightTrace: insightContext.relevant.map((insight) => ({
        id: insight.id,
        polarity: insight.polarity,
        strength: insight.strength,
        scope: insight.scope,
      })),
      insightCoherence: insightContext.coherence,
    },
    createdAt: Date.now(),
  };
}

function extractTagsFromDecision(decision: DecisionOutcome): string[] {
  const derived: string[] = [];
  if (decision.domain) {
    derived.push(decision.domain);
  }
  if (decision.kind) {
    derived.push(decision.kind);
  }
  const tags = decision.topicTags ?? decision.tags ?? [];
  return Array.from(new Set([...derived, ...tags]));
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function clampSigned(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < -1) return -1;
  if (value > 1) return 1;
  return value;
}
