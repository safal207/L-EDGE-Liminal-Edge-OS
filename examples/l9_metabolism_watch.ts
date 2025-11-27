#!/usr/bin/env ts-node
import { printMetabolism } from '@/debug/printMetabolism';
import type { TriAxisState } from '@/core/types/ontogenesis';
import { runL9MetabolicStep } from '@/organism/metabolism/L9_metabolic_layer';

const baseTriAxis: TriAxisState = {
  L: { id: 'L', value: 0.6, nourishment: 0.7, pressure: 0.3 },
  S: { id: 'S', value: 0.5, nourishment: 0.5, pressure: 0.4 },
  C: { id: 'C', value: 0.4, nourishment: 0.6, pressure: 0.2 },
};

interface Scenario {
  name: string;
  loadIndex: number;
  resonanceQuality: number;
  recentRecoveryIndex: number;
  triAxis: TriAxisState;
}

const scenarios: Scenario[] = [
  {
    name: 'Спокойная работа',
    loadIndex: 0.3,
    resonanceQuality: 0.7,
    recentRecoveryIndex: 0.8,
    triAxis: baseTriAxis,
  },
  {
    name: 'Интенсивный спринт',
    loadIndex: 0.8,
    resonanceQuality: 0.6,
    recentRecoveryIndex: 0.4,
    triAxis: {
      L: { id: 'L', value: 0.6, nourishment: 0.6, pressure: 0.7 },
      S: { id: 'S', value: 0.5, nourishment: 0.45, pressure: 0.8 },
      C: { id: 'C', value: 0.4, nourishment: 0.55, pressure: 0.35 },
    },
  },
  {
    name: 'Фаза восстановления',
    loadIndex: 0.2,
    resonanceQuality: 0.8,
    recentRecoveryIndex: 0.9,
    triAxis: {
      L: { id: 'L', value: 0.5, nourishment: 0.8, pressure: 0.2 },
      S: { id: 'S', value: 0.4, nourishment: 0.7, pressure: 0.2 },
      C: { id: 'C', value: 0.5, nourishment: 0.7, pressure: 0.1 },
    },
  },
];

function printScenario(scenario: Scenario) {
  const snapshot = runL9MetabolicStep({
    triAxis: scenario.triAxis,
    loadIndex: scenario.loadIndex,
    resonanceQuality: scenario.resonanceQuality,
    recentRecoveryIndex: scenario.recentRecoveryIndex,
  });

  console.log('\n==============================');
  console.log(`Сценарий: ${scenario.name}`);
  console.log('==============================');
  printMetabolism({
    stressIndex: snapshot.stressIndex,
    recoveryScore: snapshot.recoveryScore,
    overloadRisk: snapshot.overloadRisk,
    mode: snapshot.mode,
    overloadAxes: snapshot.overloadAxes,
    note: snapshot.note,
  });
  console.log(
    `recommendation: slowdown=${snapshot.recommendedSlowdown}, deepRest=${snapshot.recommendedDeepRest}, energy=${snapshot.totalEnergy.toFixed(
      2,
    )}`,
  );
}

function main() {
  console.log('L9 Metabolic Watch — простая диагностика состояния организма\n');
  scenarios.forEach(printScenario);
}

main();
