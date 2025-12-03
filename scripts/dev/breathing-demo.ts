import {
  BreathingSnapshot,
  RetrospectiveMetrics,
  resetBreathingState,
  runBreathingCycle,
} from "../../src/layers/L33_breathing";

function runDemo() {
  resetBreathingState();

  const scenarios: RetrospectiveMetrics[] = [
    {
      avgSurprise: 0.7,
      avgLearningSignal: 0.6,
      calibrationMismatchRate: 0.2,
      outcomeVolatility: 0.7,
    },
    {
      avgSurprise: 0.2,
      avgLearningSignal: 0.1,
      calibrationMismatchRate: 0.1,
      outcomeVolatility: 0.2,
    },
    {
      avgSurprise: 0.5,
      avgLearningSignal: 0.4,
      calibrationMismatchRate: 0.05,
      outcomeVolatility: 0.3,
    },
    {
      avgSurprise: 0.9,
      avgLearningSignal: -0.2,
      calibrationMismatchRate: 0.35,
      outcomeVolatility: 0.8,
    },
  ];

  for (const metrics of scenarios) {
    const snapshot = runBreathingCycle(metrics);
    logSnapshot(snapshot);
  }
}

function logSnapshot(snapshot: BreathingSnapshot) {
  const {
    cycleIndex,
    phase,
    fuzzChaos,
    fuzzStability,
    fuzzGrowth,
    fuzzFatigue,
    luckSynergyScore,
  } = snapshot;

  const summary = {
    cycle: cycleIndex,
    phase,
    fuzzChaos: fuzzChaos.toFixed(2),
    fuzzStability: fuzzStability.toFixed(2),
    fuzzGrowth: fuzzGrowth.toFixed(2),
    fuzzFatigue: fuzzFatigue.toFixed(2),
    luckSynergyScore: luckSynergyScore.toFixed(2),
  };

  console.log("Breathing snapshot", summary);
}

runDemo();
