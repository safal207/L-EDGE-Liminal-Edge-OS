import { scoreDecision, type DecisionCandidate, type DecisionContext } from '../../src/layers/L_decision/decisionScoring';
import type { OrganismTone } from '../../src/layers/shared/organismTone';

const candidates: DecisionCandidate[] = [
  {
    id: 'safe',
    description: 'Conservative maintenance task',
    baseScore: 0.7,
    riskLevel: 0.1,
    effortCost: 0.3,
    explorationValue: 0.2,
  },
  {
    id: 'risky',
    description: 'Bold launch with upside',
    baseScore: 0.6,
    riskLevel: 0.7,
    effortCost: 0.5,
    explorationValue: 0.6,
  },
  {
    id: 'explore',
    description: 'Lightweight exploratory spike',
    baseScore: 0.5,
    riskLevel: 0.4,
    effortCost: 0.2,
    explorationValue: 0.9,
  },
];

const tones: Record<string, OrganismTone> = {
  flow: {
    phase: 'inhale',
    fuzzChaos: 0.3,
    fuzzStability: 0.7,
    fuzzGrowth: 0.8,
    fuzzFatigue: 0.2,
    luckSynergyScore: 0.8,
    isInFlow: true,
    isOverwhelmed: false,
    needsRecovery: false,
  },
  fatigued: {
    phase: 'hold',
    fuzzChaos: 0.4,
    fuzzStability: 0.4,
    fuzzGrowth: 0.2,
    fuzzFatigue: 0.75,
    luckSynergyScore: 0.3,
    isInFlow: false,
    isOverwhelmed: false,
    needsRecovery: true,
  },
  overwhelmed: {
    phase: 'hold',
    fuzzChaos: 0.85,
    fuzzStability: 0.3,
    fuzzGrowth: 0.25,
    fuzzFatigue: 0.8,
    luckSynergyScore: 0.4,
    isInFlow: false,
    isOverwhelmed: true,
    needsRecovery: true,
  },
};

function renderTable(label: string, ctx: DecisionContext) {
  console.log(`\n=== ${label} ===`);
  candidates.forEach((candidate) => {
    const scored = scoreDecision(candidate, ctx);
    console.log(
      `${candidate.id}: rational=${scored.rationalScore.toFixed(2)}, resonance=${scored.resonanceScore.toFixed(2)}, luckAdjusted=${scored.luckAdjustedScore.toFixed(2)}`,
    );
  });
}

renderTable('Flow mode (high luck)', { tone: tones.flow, timeHorizon: 'short' });
renderTable('Fatigued mode (recovery)', { tone: tones.fatigued, timeHorizon: 'medium' });
renderTable('Overwhelmed mode (safety)', { tone: tones.overwhelmed, timeHorizon: 'short' });
