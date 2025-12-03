import { computeForesight } from '../../src/layers/L34_foresight/foresight';
import type { DecisionCandidate } from '../../src/layers/L_decision/decisionScoring';
import type { OrganismTone } from '../../src/layers/shared/organismTone';
import type { DaySummary } from '../../src/layers/shared/historyTypes';

const flowLuckyTone: OrganismTone = {
  phase: 'inhale',
  fuzzChaos: 0.25,
  fuzzStability: 0.8,
  fuzzGrowth: 0.85,
  fuzzFatigue: 0.2,
  luckSynergyScore: 0.9,
  isInFlow: true,
  isOverwhelmed: false,
  needsRecovery: false,
};

const tiredOverloadedTone: OrganismTone = {
  phase: 'hold',
  fuzzChaos: 0.75,
  fuzzStability: 0.35,
  fuzzGrowth: 0.25,
  fuzzFatigue: 0.82,
  luckSynergyScore: 0.28,
  isInFlow: false,
  isOverwhelmed: true,
  needsRecovery: true,
};

const recentHistory: DaySummary[] = [
  { date: '2024-05-01', learningSignal: 0.72, successRate: 0.68, overloadIndex: 0.25 },
  { date: '2024-05-02', learningSignal: 0.65, successRate: 0.62, overloadIndex: 0.35 },
  { date: '2024-05-03', learningSignal: 0.58, successRate: 0.7, overloadIndex: 0.3 },
];

const tiredHistory: DaySummary[] = [
  { date: '2024-05-01', learningSignal: 0.25, successRate: 0.4, overloadIndex: 0.8 },
  { date: '2024-05-02', learningSignal: 0.3, successRate: 0.45, overloadIndex: 0.75 },
  { date: '2024-05-03', learningSignal: 0.28, successRate: 0.35, overloadIndex: 0.82 },
];

const candidates: DecisionCandidate[] = [
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

function renderScenario(label: string, tone: OrganismTone, history: DaySummary[]) {
  console.log(`\n=== Scenario: ${label} ===`);
  const foresight = computeForesight({ tone, recentHistory: history, candidates });

  const { luckVector } = foresight;
  console.log(
    `LuckVector: { expansion=${luckVector.expansionTendency.toFixed(2)}, consolidation=${luckVector.consolidationTendency.toFixed(2)}, synergyWindow=${luckVector.synergyWindow.toFixed(2)}, overloadRisk=${luckVector.overloadRisk.toFixed(2)} }`,
  );

  console.log('\nTop recommendations:');
  foresight.recommended.forEach((rec, idx) => {
    console.log(`${idx + 1}) ${rec.candidate.id}   luckAdjusted=${rec.luckAdjustedScore.toFixed(2)}`);
  });

  console.log('\nFull table:');
  foresight.scoredDecisions.forEach((sd) => {
    console.log(
      `${sd.candidate.id}: rational=${sd.rationalScore.toFixed(2)}, resonance=${sd.resonanceScore.toFixed(2)}, luckAdjusted=${sd.luckAdjustedScore.toFixed(2)}`,
    );
  });
}

renderScenario('FLOW + LUCK', flowLuckyTone, recentHistory);
renderScenario('TIRED + OVERLOADED', tiredOverloadedTone, tiredHistory);
