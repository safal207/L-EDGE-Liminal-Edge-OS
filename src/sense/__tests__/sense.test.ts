import { describe, expect, it } from 'vitest';

import { LiminalSense } from '@/sense';
import type { SenseState } from '@/sense';

describe('LiminalSense.process', () => {
  it('returns baseline for minimal input', () => {
    const result = LiminalSense.process({ timestamp: Date.now() });

    expect(result.mood).toBe('neutral');
    expect(result.suggestion).toBe('stabilize');
    expect(result.emotionalGradient.calm).toBeCloseTo(0.5, 1);
  });

  it('grounds a tired and overloaded user', () => {
    const result = LiminalSense.process({
      userText: 'I feel tired, exhausted and on the edge of burnout.',
      timestamp: Date.now(),
      entropyLevel: 0.8,
    });

    expect(result.mood).toBe('overloaded');
    expect(result.emotionalGradient.fatigue).toBeGreaterThan(0.6);
    expect(result.reflection.suggestedMode).toBe('ground');
    expect(result.readiness === 'low' || result.readiness === 'medium').toBe(true);
  });

  it('opens for inspired and focused input', () => {
    const previousStates: SenseState[] = [
      {
        mood: 'curious',
        emotionalGradient: {
          calm: 0.5,
          tension: 0.2,
          curiosity: 0.55,
          fatigue: 0.25,
          uplift: 0.55,
          groundedness: 0.6,
          focus: 0.55,
          confidence: 0.6,
        },
        drift: 'stable',
        luck: { resonance: 0.45, phase: 'neutral' },
        reflection: { loadLevel: 0.3, integrationHealth: 0.7, suggestedMode: 'reflect' },
        readiness: 'medium',
        suggestion: 'gentle-expansion',
      },
    ];

    const result = LiminalSense.process({
      userText: 'Inspired and excited! Let us build, explore, and weave these ideas together.',
      timestamp: Date.now(),
      entropyLevel: 0.5,
      activeLayers: ['L20', 'L22', 'L30'],
      previousStates,
    });

    expect(result.mood === 'soft-rise' || result.mood === 'buoyant').toBe(true);
    expect(result.luck.phase).toBe('opening');
    expect(['gentle-expansion', 'open-window']).toContain(result.suggestion);
  });

  it('detects oscillating histories and suggests reflection', () => {
    const previousStates: SenseState[] = [
      {
        mood: 'bright',
        emotionalGradient: {
          calm: 0.6,
          tension: 0.25,
          curiosity: 0.65,
          fatigue: 0.2,
          uplift: 0.7,
          groundedness: 0.55,
          focus: 0.6,
          confidence: 0.65,
        },
        drift: 'rising',
        luck: { resonance: 0.6, phase: 'opening' },
        reflection: { loadLevel: 0.35, integrationHealth: 0.8, suggestedMode: 'expand' },
        readiness: 'high',
        suggestion: 'open-window',
      },
      {
        mood: 'compressed',
        emotionalGradient: {
          calm: 0.35,
          tension: 0.55,
          curiosity: 0.3,
          fatigue: 0.55,
          uplift: 0.3,
          groundedness: 0.4,
          focus: 0.45,
          confidence: 0.4,
        },
        drift: 'falling',
        luck: { resonance: 0.35, phase: 'closing' },
        reflection: { loadLevel: 0.55, integrationHealth: 0.55, suggestedMode: 'ground' },
        readiness: 'medium',
        suggestion: 'grounding',
      },
    ];

    const result = LiminalSense.process({
      userText: 'Not sure but I sense waves, energetic yet uneasy... maybe.',
      timestamp: Date.now(),
      previousStates,
      entropyLevel: 0.55,
    });

    expect(result.drift).toBe('oscillating');
    expect(result.reflection.integrationHealth).toBeLessThan(0.7);
    expect(['deep-reflection', 'grounding', 'stabilize']).toContain(result.suggestion);
  });
});
