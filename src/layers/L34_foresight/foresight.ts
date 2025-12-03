import type { DaySummary } from '@/layers/shared/historyTypes';
import type { OrganismTone } from '@/layers/shared/organismTone';
import { scoreDecision, type DecisionCandidate, type ScoredDecision } from '@/layers/L_decision/decisionScoring';

export interface ForesightInput {
  tone: OrganismTone;
  recentHistory: DaySummary[];
  candidates: DecisionCandidate[];
}

export interface LuckVector {
  expansionTendency: number; // 0..1 — насколько сейчас мир "подыгрывает" расширению
  consolidationTendency: number; // 0..1 — насколько сейчас лучше углубляться, а не расширяться
  synergyWindow: number; // 0..1 — окно синергии (как у Домино: момент для красивого хода)
  overloadRisk: number; // 0..1 — риск перегруза, если слишком дерзко рвануть
}

export interface ForesightPrediction {
  luckVector: LuckVector;
  scoredDecisions: ScoredDecision[];
  recommended: ScoredDecision[];
}

export function buildLuckVector(tone: OrganismTone, recentHistory: DaySummary[]): LuckVector {
  const avgLearning = average(recentHistory.map((h) => h.learningSignal ?? 0));
  const avgWins = average(recentHistory.map((h) => h.successRate ?? 0));
  const avgOverload = average(recentHistory.map((h) => h.overloadIndex ?? 0));

  const expansionTendency = clamp01(0.4 * tone.fuzzGrowth + 0.3 * tone.fuzzStability + 0.3 * avgLearning);

  const consolidationTendency = clamp01(0.5 * tone.fuzzFatigue + 0.3 * avgOverload + 0.2 * (1 - avgLearning));

  const synergyWindow = clamp01(0.5 * tone.luckSynergyScore + 0.3 * avgWins + 0.2 * tone.fuzzStability);

  const overloadRisk = clamp01(0.6 * avgOverload + 0.4 * tone.fuzzChaos);

  return {
    expansionTendency,
    consolidationTendency,
    synergyWindow,
    overloadRisk,
  };
}

export function computeForesight(input: ForesightInput): ForesightPrediction {
  const { tone, recentHistory, candidates } = input;

  const luckVector = buildLuckVector(tone, recentHistory);

  const scored = candidates.map((candidate) => scoreDecision(candidate, { tone, timeHorizon: 'medium' }));

  const adjusted = scored.map((scoredDecision) => {
    const { candidate } = scoredDecision;
    let bonus = 0;

    if (luckVector.synergyWindow > 0.6 && tone.isInFlow) {
      bonus += 0.15 * candidate.explorationValue;
    }

    if (luckVector.consolidationTendency > 0.6) {
      bonus -= 0.2 * candidate.effortCost;
      bonus -= 0.2 * candidate.riskLevel;
    }

    if (luckVector.overloadRisk > 0.7) {
      bonus -= 0.3 * candidate.riskLevel;
    }

    const foresightScore = clamp01(scoredDecision.luckAdjustedScore + bonus);

    return {
      ...scoredDecision,
      luckAdjustedScore: foresightScore,
    };
  });

  const sorted = [...adjusted].sort((a, b) => b.luckAdjustedScore - a.luckAdjustedScore);
  const recommended = sorted.slice(0, Math.min(3, sorted.length));

  return {
    luckVector,
    scoredDecisions: sorted,
    recommended,
  };
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  const total = values.reduce((acc, value) => acc + value, 0);
  return total / values.length;
}
