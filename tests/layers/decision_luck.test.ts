import { describe, expect, it } from 'vitest';

import { scoreDecision, type DecisionCandidate } from '@/layers/L_decision/decisionScoring';
import type { OrganismTone } from '@/layers/shared/organismTone';

const flowTone: OrganismTone = {
  phase: 'inhale',
  fuzzChaos: 0.35,
  fuzzStability: 0.75,
  fuzzGrowth: 0.85,
  fuzzFatigue: 0.2,
  luckSynergyScore: 0.82,
  isInFlow: true,
  isOverwhelmed: false,
  needsRecovery: false,
};

const recoveryTone: OrganismTone = {
  phase: 'hold',
  fuzzChaos: 0.55,
  fuzzStability: 0.45,
  fuzzGrowth: 0.25,
  fuzzFatigue: 0.8,
  luckSynergyScore: 0.25,
  isInFlow: false,
  isOverwhelmed: false,
  needsRecovery: true,
};

const overwhelmedTone: OrganismTone = {
  phase: 'hold',
  fuzzChaos: 0.85,
  fuzzStability: 0.35,
  fuzzGrowth: 0.2,
  fuzzFatigue: 0.78,
  luckSynergyScore: 0.3,
  isInFlow: false,
  isOverwhelmed: true,
  needsRecovery: true,
};

const safeTask: DecisionCandidate = {
  id: 'safe',
  description: 'Routine maintenance',
  baseScore: 0.7,
  riskLevel: 0.15,
  effortCost: 0.3,
  explorationValue: 0.2,
};

const boldExploration: DecisionCandidate = {
  id: 'bold',
  description: 'Risky but enlightening spike',
  baseScore: 0.55,
  riskLevel: 0.65,
  effortCost: 0.4,
  explorationValue: 0.85,
};

describe('luck-aware decision scoring', () => {
  it('elevates bold exploration when in flow with high luck', () => {
    const ctx = { tone: flowTone, timeHorizon: 'short' } as const;

    const safeScore = scoreDecision(safeTask, ctx);
    const boldScore = scoreDecision(boldExploration, ctx);

    expect(boldScore.luckAdjustedScore).toBeGreaterThan(safeScore.luckAdjustedScore);
    expect(boldScore.resonanceScore).toBeGreaterThan(0.5);
  });

  it('suppresses risky choices when fatigued or overwhelmed', () => {
    const recoveryCtx = { tone: recoveryTone, timeHorizon: 'medium' } as const;
    const overwhelmedCtx = { tone: overwhelmedTone, timeHorizon: 'short' } as const;

    const recoveryScore = scoreDecision(boldExploration, recoveryCtx);
    const overwhelmedScore = scoreDecision(boldExploration, overwhelmedCtx);

    expect(recoveryScore.luckAdjustedScore).toBeLessThan(0.6);
    expect(overwhelmedScore.luckAdjustedScore).toBeLessThan(recoveryScore.luckAdjustedScore);
  });
});
