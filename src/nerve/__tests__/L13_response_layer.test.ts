import { describe, expect, it } from 'vitest';

import { computeResponseFrame } from '@/nerve/L13_response_layer';
import type { OrganismSnapshot } from '@/core/types/organismSnapshot';

const baseSnapshot: OrganismSnapshot = {
  triAxis: {
    L: { id: 'L', value: 0.5, nourishment: 0.6, pressure: 0.4 },
    S: { id: 'S', value: 0.5, nourishment: 0.6, pressure: 0.4 },
    C: { id: 'C', value: 0.5, nourishment: 0.6, pressure: 0.4 },
  },
  stage: 8,
  timestamp: Date.now(),
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
    harmony: { harmonyIndex: 0.55, axisImbalance: { L: 0.1, S: 0.1, C: 0.1 }, metabolicTension: 0.3 },
    growth: { growthMomentum: 0.5, stabilityIndex: 0.5, preferredAdjustments: [] },
    overallScore: 0.55,
  },
};

describe('computeResponseFrame', () => {
  it('emits throttle intents under overload', () => {
    const frame = computeResponseFrame({
      snapshot: {
        ...baseSnapshot,
        metabolism: { ...baseSnapshot.metabolism!, overloadRisk: 0.92, stressIndex: 0.85 },
      } as any,
      external: { externalStress: 0.75, externalRecovery: 0, externalExploration: 0 },
    });

    const kinds = frame.intents.map((i) => i.kind);
    expect(kinds).toContain('throttle');
    expect(kinds).toContain('pause_non_critical');
  });

  it('opens exploration window when harmony and stability are good', () => {
    const frame = computeResponseFrame({
      snapshot: {
        ...baseSnapshot,
        growthMode: { mode: 'exploratory', confidence: 0.7, reason: 'room_for_exploration' },
        crystal: {
          harmony: { harmonyIndex: 0.72, axisImbalance: { L: 0.1, S: 0.1, C: 0.1 }, metabolicTension: 0.2 },
          growth: { growthMomentum: 0.65, stabilityIndex: 0.62, preferredAdjustments: [] },
          overallScore: 0.7,
        },
        metabolism: { ...baseSnapshot.metabolism!, overloadRisk: 0.25 },
      } as any,
      external: { externalStress: 0.1, externalRecovery: 0.2, externalExploration: 0.6 },
    });

    const kinds = frame.intents.map((i) => i.kind);
    expect(kinds).toContain('open_exploration_window');
  });

  it('falls back to log_and_observe when no strong factors present', () => {
    const frame = computeResponseFrame({ snapshot: baseSnapshot as any });
    const kinds = frame.intents.map((i) => i.kind);
    expect(kinds).toContain('log_and_observe');
    expect(frame.intents.length).toBe(1);
  });
});
