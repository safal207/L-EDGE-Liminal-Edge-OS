import { describe, expect, it } from 'vitest';

import { proposeTemporalSteeringDecision } from './l17-steering';
import type { TemporalState } from './l17-types';

const baseNow = {
  stepIndex: 10,
  timestamp: Date.now(),
  axes: { inner: 0.4, social: 0.4, cosmic: 0.2 },
  phase: 0.5,
  stability: 0.8,
  recoveryTime: 2000,
  tension: 0.3,
  feeling: {
    intensity: 0.2,
    direction: 'toward_fluidity' as const,
    deltaPhase: 0.05,
    rate: 0.00001,
    axisShift: { inner: 0, social: 0, cosmic: 0 },
    phaseBefore: 0.45,
    phaseAfter: 0.5,
  },
};

describe('L17 Temporal Self-Steering', () => {
  it('returns consolidate mode in calm, aligned conditions', () => {
    const state: TemporalState = {
      past: [],
      now: {
        ...baseNow,
        goalProjection: {
          targetAxes: { inner: 0.42, social: 0.42, cosmic: 0.16 },
          horizonSteps: 10,
        },
      },
      future: [],
    };

    const decision = proposeTemporalSteeringDecision(state);
    expect(decision.mode).toBe('consolidate');
    expect(decision.warningLevel).toBe('low');
    expect(decision.safeToAdjust).toBe(true);
  });

  it('returns stabilize mode with high metastability and flags unsafe adjustments', () => {
    const state: TemporalState = {
      past: [],
      now: {
        ...baseNow,
        stability: 0.3,
        recoveryTime: 12000,
        feeling: {
          ...baseNow.feeling,
          intensity: 0.9,
          deltaPhase: 0.7,
        },
        goalProjection: {
          targetAxes: { inner: 0.9, social: 0.1, cosmic: 0 },
          horizonSteps: 3,
        },
      },
      future: [],
    };

    const decision = proposeTemporalSteeringDecision(state);
    expect(decision.mode).toBe('stabilize');
    expect(decision.warningLevel).toBe('high');
    expect(decision.safeToAdjust).toBe(false);
  });
});
