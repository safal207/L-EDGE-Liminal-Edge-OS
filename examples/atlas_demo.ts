import { computeAtlasFingerprint } from '@/atlas/full_atlas';
import type { OrganismSnapshot } from '@/core/types/organismSnapshot';

const snapshot: OrganismSnapshot = {
  triAxis: {
    L: { id: 'L', value: 0.64, nourishment: 0.7, pressure: 0.35 },
    S: { id: 'S', value: 0.55, nourishment: 0.6, pressure: 0.4 },
    C: { id: 'C', value: 0.5, nourishment: 0.62, pressure: 0.32 },
  },
  stage: 14,
  metabolism: {
    mode: 'normal',
    totalEnergy: 0.62,
    totalStress: 0.38,
    totalRecovery: 0.65,
    stressIndex: 0.38,
    recoveryScore: 0.67,
    overloadRisk: 0.13,
    axes: [],
    overloadAxes: [],
    recommendedSlowdown: false,
    recommendedDeepRest: false,
    note: 'demo metabolism snapshot',
  },
  crystal: {
    harmony: {
      harmonyIndex: 0.66,
      axisImbalance: { L: 0.08, S: 0.12, C: 0.1 },
      metabolicTension: 0.18,
    },
    growth: {
      growthMomentum: 0.64,
      stabilityIndex: 0.58,
      preferredAdjustments: [],
    },
    overallScore: 0.63,
    note: 'demo crystal snapshot',
  },
  growthMode: { mode: 'exploratory', confidence: 0.72, reason: 'balanced_low_stress' },
  timestamp: Date.now(),
};

const result = computeAtlasFingerprint(snapshot);
console.log('\n=== Atlas Fingerprint ===');
console.log(`Gate: ${result.gate.label} (complexity=${result.gate.complexity})`);
console.log(`Path: ${result.path.label} (${result.path.dynamics})`);
console.log(`Behavior pattern: ${result.behavior.pattern.join('')} (stability=${result.behavior.stabilityScore})`);
console.log(`Competence: ${result.competence.label} (cap=${result.competence.capability})`);
console.log(`Decision: ${result.decision.label} (${result.decision.decisionFlow})`);
console.log(`Stabilization: ${result.stabilization.label}`);
console.log(`Modulator: ${result.modulator.label}`);
console.log(`Environment: ${result.environment.label}`);
console.log(`Summary: ${result.summary}`);
