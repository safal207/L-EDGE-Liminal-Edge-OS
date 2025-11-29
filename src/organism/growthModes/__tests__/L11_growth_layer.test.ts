import { describe, expect, it } from 'vitest';

import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import { decideGrowthMode } from '@/organism/growthModes/L11_growth_layer';

const baseSnapshot: OrganismSnapshot = {
  triAxis: {
    L: { id: 'L', value: 0.5, nourishment: 0.6, pressure: 0.3 },
    S: { id: 'S', value: 0.5, nourishment: 0.6, pressure: 0.3 },
    C: { id: 'C', value: 0.5, nourishment: 0.6, pressure: 0.3 },
  },
  stage: 10,
  timestamp: Date.now(),
};

describe('decideGrowthMode', () => {
  it('returns frozen when overload risk is critical or harmony is very low', () => {
    const snapshot: OrganismSnapshot = {
      ...baseSnapshot,
      metabolism: {
        mode: 'overload',
        totalEnergy: 0.4,
        totalStress: 0.9,
        totalRecovery: 0.2,
        stressIndex: 0.9,
        recoveryScore: 0.2,
        overloadRisk: 0.88,
        axes: [],
        overloadAxes: ['L', 'S'],
        recommendedSlowdown: true,
        recommendedDeepRest: true,
      },
      crystal: {
        harmony: { harmonyIndex: 0.25, axisImbalance: { L: 0.4, S: 0.3, C: 0.2 }, metabolicTension: 0.5 },
        growth: { growthMomentum: 0.1, stabilityIndex: 0.2, preferredAdjustments: [] },
        overallScore: 0.2,
      },
    };

    const mode = decideGrowthMode(snapshot);

    expect(mode.mode).toBe('frozen');
    expect(mode.reason).toBe('overload_or_chaos');
    expect(mode.confidence).toBeGreaterThan(0);
  });

  it('prefers exploratory when harmony and growth are high with low stress', () => {
    const snapshot: OrganismSnapshot = {
      ...baseSnapshot,
      metabolism: {
        mode: 'normal',
        totalEnergy: 0.8,
        totalStress: 0.25,
        totalRecovery: 0.8,
        stressIndex: 0.25,
        recoveryScore: 0.78,
        overloadRisk: 0.18,
        axes: [],
        overloadAxes: [],
        recommendedSlowdown: false,
        recommendedDeepRest: false,
      },
      crystal: {
        harmony: { harmonyIndex: 0.82, axisImbalance: { L: 0.05, S: 0.1, C: 0.08 }, metabolicTension: 0.1 },
        growth: { growthMomentum: 0.72, stabilityIndex: 0.7, preferredAdjustments: [] },
        overallScore: 0.76,
      },
    };

    const mode = decideGrowthMode(snapshot);

    expect(mode.mode === 'exploratory' || mode.mode === 'intensive').toBe(true);
    expect(mode.confidence).toBeGreaterThan(0.4);
  });

  it('selects therapeutic when recovery is weak under load', () => {
    const snapshot: OrganismSnapshot = {
      ...baseSnapshot,
      metabolism: {
        mode: 'recovery',
        totalEnergy: 0.5,
        totalStress: 0.7,
        totalRecovery: 0.2,
        stressIndex: 0.7,
        recoveryScore: 0.3,
        overloadRisk: 0.55,
        axes: [],
        overloadAxes: ['S'],
        recommendedSlowdown: true,
        recommendedDeepRest: true,
      },
      crystal: {
        harmony: { harmonyIndex: 0.45, axisImbalance: { L: 0.2, S: 0.2, C: 0.2 }, metabolicTension: 0.4 },
        growth: { growthMomentum: 0.35, stabilityIndex: 0.4, preferredAdjustments: [] },
        overallScore: 0.4,
      },
    };

    const mode = decideGrowthMode(snapshot);

    expect(mode.mode === 'therapeutic' || mode.mode === 'stabilizing').toBe(true);
    expect(mode.reason === 'needs_deep_recovery' || mode.reason === 'stability_priority').toBe(true);
  });
});
