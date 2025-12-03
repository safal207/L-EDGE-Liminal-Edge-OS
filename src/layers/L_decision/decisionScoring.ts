import type { OrganismTone } from '@/layers/shared/organismTone';

export interface DecisionCandidate {
  id: string;
  description: string;
  baseScore: number; // 0..1
  riskLevel: number; // 0..1
  effortCost: number; // 0..1
  explorationValue: number; // 0..1
}

export interface DecisionContext {
  tone: OrganismTone;
  timeHorizon: 'short' | 'medium' | 'long';
}

export interface ScoredDecision {
  candidate: DecisionCandidate;
  rationalScore: number;
  resonanceScore: number;
  luckAdjustedScore: number;
}

export function scoreDecision(candidate: DecisionCandidate, ctx: DecisionContext): ScoredDecision {
  const { tone } = ctx;
  const { baseScore, riskLevel, effortCost, explorationValue } = candidate;

  const rationalScore = clamp01(0.6 * baseScore - 0.2 * riskLevel - 0.2 * effortCost);

  let resonanceScore = 0;

  if (tone.isInFlow) {
    resonanceScore += 0.3 * explorationValue;
    resonanceScore += 0.2 * tone.fuzzGrowth;
  }

  if (tone.needsRecovery) {
    resonanceScore -= 0.3 * effortCost;
  }

  if (tone.isOverwhelmed) {
    resonanceScore -= 0.4 * riskLevel;
  }

  resonanceScore = clamp01((resonanceScore + 1) / 2);

  const luckFactor = tone.luckSynergyScore;

  let luckAdjustedScore: number;

  if (luckFactor > 0.6 && resonanceScore > 0.5) {
    luckAdjustedScore = clamp01(
      rationalScore * 0.45 + resonanceScore * 0.55 + 0.2 * (luckFactor - 0.6) + 0.1 * explorationValue,
    );
  } else {
    luckAdjustedScore = clamp01(0.7 * rationalScore + 0.3 * resonanceScore);
  }

  return {
    candidate,
    rationalScore,
    resonanceScore,
    luckAdjustedScore,
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
