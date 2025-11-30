import { describe, expect, it } from 'vitest';
import { computeAtlasFingerprint } from '@/atlas/full_atlas';
import type { OrganismSnapshot } from '@/core/types/organismSnapshot';

const baseSnapshot: OrganismSnapshot = {
  triAxis: {
    L: { id: 'L', value: 0.58, nourishment: 0.66, pressure: 0.34 },
    S: { id: 'S', value: 0.52, nourishment: 0.6, pressure: 0.36 },
    C: { id: 'C', value: 0.48, nourishment: 0.62, pressure: 0.32 },
  },
  stage: 14,
  metabolism: {
    mode: 'normal',
    totalEnergy: 0.6,
    totalStress: 0.4,
    totalRecovery: 0.62,
    stressIndex: 0.4,
    recoveryScore: 0.62,
    overloadRisk: 0.15,
    axes: [],
    overloadAxes: [],
    recommendedSlowdown: false,
    recommendedDeepRest: false,
  },
  crystal: {
    harmony: { harmonyIndex: 0.62, axisImbalance: { L: 0.08, S: 0.1, C: 0.11 }, metabolicTension: 0.2 },
    growth: { growthMomentum: 0.6, stabilityIndex: 0.55, preferredAdjustments: [] },
    overallScore: 0.6,
  },
  growthMode: { mode: 'gentle', confidence: 0.68, reason: 'balanced_low_stress' },
  timestamp: Date.now(),
};

describe('computeAtlasFingerprint', () => {
  it('returns a full atlas selection with summary text', () => {
    const result = computeAtlasFingerprint(baseSnapshot);

    expect(result.gate.label).toBeDefined();
    expect(result.path.dynamics).toMatch(/linear|nonlinear|chaotic|adaptive/);
    expect(result.behavior.pattern).toHaveLength(6);
    expect(result.summary.length).toBeGreaterThan(10);
  });

  it('reacts to higher stress with a higher gate/path index', () => {
    const stressedSnapshot: OrganismSnapshot = {
      ...baseSnapshot,
      metabolism: {
        ...baseSnapshot.metabolism!,
        stressIndex: 0.85,
        overloadRisk: 0.82,
      },
    };

    const calm = computeAtlasFingerprint(baseSnapshot);
    const stressed = computeAtlasFingerprint(stressedSnapshot);

    expect(stressed.gate.id).toBeGreaterThanOrEqual(calm.gate.id);
  });
});
