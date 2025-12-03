import { describe, expect, it } from 'vitest';

import { computeForesight } from '@/layers/L34_foresight/foresight';
import type { DecisionCandidate } from '@/layers/L_decision/decisionScoring';
import { scoreDecision } from '@/layers/L_decision/decisionScoring';
import type { OrganismTone } from '@/layers/shared/organismTone';
import type { DaySummary } from '@/layers/shared/historyTypes';

const flowLuckyTone: OrganismTone = {
  phase: 'inhale',
  fuzzChaos: 0.25,
  fuzzStability: 0.82,
  fuzzGrowth: 0.86,
  fuzzFatigue: 0.18,
  luckSynergyScore: 0.9,
  isInFlow: true,
  isOverwhelmed: false,
  needsRecovery: false,
};

const tiredOverloadedTone: OrganismTone = {
  phase: 'hold',
  fuzzChaos: 0.78,
  fuzzStability: 0.36,
  fuzzGrowth: 0.28,
  fuzzFatigue: 0.85,
  luckSynergyScore: 0.3,
  isInFlow: false,
  isOverwhelmed: true,
  needsRecovery: true,
};

const highConsolidationTone: OrganismTone = {
  phase: 'hold',
  fuzzChaos: 0.7,
  fuzzStability: 0.4,
  fuzzGrowth: 0.2,
  fuzzFatigue: 0.9,
  luckSynergyScore: 0.35,
  isInFlow: false,
  isOverwhelmed: true,
  needsRecovery: true,
};

const energizedHistory: DaySummary[] = [
  { date: '2024-05-01', learningSignal: 0.72, successRate: 0.68, overloadIndex: 0.25 },
  { date: '2024-05-02', learningSignal: 0.65, successRate: 0.62, overloadIndex: 0.35 },
  { date: '2024-05-03', learningSignal: 0.58, successRate: 0.7, overloadIndex: 0.3 },
];

const fatiguedHistory: DaySummary[] = [
  { date: '2024-05-01', learningSignal: 0.25, successRate: 0.4, overloadIndex: 0.82 },
  { date: '2024-05-02', learningSignal: 0.3, successRate: 0.45, overloadIndex: 0.78 },
  { date: '2024-05-03', learningSignal: 0.28, successRate: 0.35, overloadIndex: 0.8 },
];

const sharedCandidates: DecisionCandidate[] = [
  {
    id: 'safeRefactor',
    description: 'Tidy up systems and repay tech debt',
    baseScore: 0.65,
    riskLevel: 0.2,
    effortCost: 0.35,
    explorationValue: 0.25,
  },
  {
    id: 'boldExperiment',
    description: 'Launch bold experiment with upside',
    baseScore: 0.6,
    riskLevel: 0.65,
    effortCost: 0.55,
    explorationValue: 0.9,
  },
  {
    id: 'socialOutreach',
    description: 'Expand network and partnerships',
    baseScore: 0.58,
    riskLevel: 0.25,
    effortCost: 0.3,
    explorationValue: 0.7,
  },
  {
    id: 'deepRecovery',
    description: 'Shift focus to recovery and stabilization',
    baseScore: 0.5,
    riskLevel: 0.1,
    effortCost: 0.15,
    explorationValue: 0.15,
  },
];

const highCostRiskCandidate: DecisionCandidate = {
  id: 'overextendedLaunch',
  description: 'Push an ambitious launch despite fatigue',
  baseScore: 0.62,
  riskLevel: 0.8,
  effortCost: 0.75,
  explorationValue: 0.6,
};

function scoreById(predictionId: string, scored: ReturnType<typeof computeForesight>): number {
  return scored.scoredDecisions.find((sd) => sd.candidate.id === predictionId)?.luckAdjustedScore ?? 0;
}

describe('L34 foresight layer', () => {
  it('boosts exploration when in flow with open synergy window', () => {
    const flowPrediction = computeForesight({ tone: flowLuckyTone, recentHistory: energizedHistory, candidates: sharedCandidates });
    const fatiguedPrediction = computeForesight({ tone: tiredOverloadedTone, recentHistory: fatiguedHistory, candidates: sharedCandidates });

    const boldFlowScore = scoreById('boldExperiment', flowPrediction);
    const boldFatiguedScore = scoreById('boldExperiment', fatiguedPrediction);

    expect(boldFlowScore).toBeGreaterThan(boldFatiguedScore);
    expect(boldFlowScore - boldFatiguedScore).toBeGreaterThan(0.15);
  });

  it('recommends recovery-first moves when overloaded', () => {
    const fatiguedPrediction = computeForesight({ tone: tiredOverloadedTone, recentHistory: fatiguedHistory, candidates: sharedCandidates });

    const recommendedIds = fatiguedPrediction.recommended.map((r) => r.candidate.id);
    const boldScore = scoreById('boldExperiment', fatiguedPrediction);
    const flowBaseline = scoreById('boldExperiment', computeForesight({ tone: flowLuckyTone, recentHistory: energizedHistory, candidates: sharedCandidates }));

    expect(recommendedIds).toContain('deepRecovery');
    expect(boldScore).toBeLessThan(flowBaseline);
    expect(boldScore).toBeLessThan(0.6);
  });

  it('penalizes risky and costly choices during consolidation phases', () => {
    const consolidationPrediction = computeForesight({
      tone: highConsolidationTone,
      recentHistory: fatiguedHistory,
      candidates: [...sharedCandidates, highCostRiskCandidate],
    });

    const luckVector = consolidationPrediction.luckVector;
    const foresightScore = scoreById('overextendedLaunch', consolidationPrediction);
    const baselineScore = scoreDecision(highCostRiskCandidate, { tone: highConsolidationTone, timeHorizon: 'medium' }).luckAdjustedScore;

    expect(luckVector.consolidationTendency).toBeGreaterThan(0.6);
    expect(foresightScore).toBeLessThan(baselineScore);
  });
});
