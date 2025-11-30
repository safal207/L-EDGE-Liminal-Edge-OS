import { describe, expect, it } from 'vitest';

import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import { runAutopoieticStep } from '@/organism/autopoietic/L16_autopoietic_layer';

const baseSnapshot: OrganismSnapshot = {
  triAxis: {
    L: { id: 'L', value: 0.55, nourishment: 0.6, pressure: 0.35 },
    S: { id: 'S', value: 0.48, nourishment: 0.55, pressure: 0.4 },
    C: { id: 'C', value: 0.52, nourishment: 0.58, pressure: 0.3 },
  },
  stage: 10,
  metabolism: {
    mode: 'normal',
    totalEnergy: 0.6,
    totalStress: 0.4,
    totalRecovery: 0.6,
    stressIndex: 0.4,
    recoveryScore: 0.6,
    overloadRisk: 0.2,
    axes: [],
    overloadAxes: [],
    recommendedSlowdown: false,
    recommendedDeepRest: false,
  },
  crystal: {
    harmony: { harmonyIndex: 0.55, axisImbalance: { L: 0.05, S: 0.08, C: 0.06 }, metabolicTension: 0.25 },
    growth: { growthMomentum: 0.5, stabilityIndex: 0.55, preferredAdjustments: [] },
    overallScore: 0.53,
  },
  timestamp: Date.now(),
};

describe('L16 autopoietic layer', () => {
  it('produces a snapshot with tensegrity and stability data', () => {
    const snapshot = runAutopoieticStep({ snapshot: baseSnapshot });

    expect(snapshot.tensegrityPotential).toBeGreaterThanOrEqual(0);
    expect(snapshot.stability.stabilityIndex).toBeGreaterThanOrEqual(0);
    expect(snapshot.immuneCycle.phase).toBeDefined();
  });

  it('enters an immune cycle when overload rises', () => {
    const overloaded: OrganismSnapshot = {
      ...baseSnapshot,
      metabolism: {
        ...baseSnapshot.metabolism!,
        overloadRisk: 0.85,
        stressIndex: 0.82,
        recoveryScore: 0.35,
      },
    };

    const step = runAutopoieticStep({ snapshot: overloaded, now: Date.now() });
    expect(step.immuneCycle.phase === 'Detecting' || step.immuneCycle.phase === 'Compensating').toBe(true);
  });

  it('applies learning gain after integrating a recovery', () => {
    const detecting = runAutopoieticStep({ snapshot: baseSnapshot, now: Date.now() });
    const integrating = runAutopoieticStep({
      snapshot: {
        ...baseSnapshot,
        metabolism: { ...baseSnapshot.metabolism!, overloadRisk: 0.1, stressIndex: 0.25, recoveryScore: 0.7 },
        crystal: { ...baseSnapshot.crystal!, harmony: { ...baseSnapshot.crystal!.harmony, harmonyIndex: 0.7 } },
      },
      previous: detecting,
      now: Date.now() + 600,
    });

    expect(integrating.stability.learningGain).toBeGreaterThanOrEqual(0);
  });
});
