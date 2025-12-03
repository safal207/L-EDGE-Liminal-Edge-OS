import { describe, expect, it } from 'vitest';

import { LiminalSense } from '@/sense';
import type { EmotionalGradient, SenseState } from '@/sense';

const makeState = (mood: string, gradient: EmotionalGradient): SenseState => ({
  mood,
  emotionalGradient: gradient,
  drift: 'stable',
  luck: { resonance: 0.4, phase: 'neutral' },
  reflection: { loadLevel: 0.4, integrationHealth: 0.6, suggestedMode: 'reflect' },
  readiness: 'medium',
  suggestion: 'gentle-expansion',
});

describe('LiminalSense.process', () => {
  it('produces a calm reflective state for soft inputs', () => {
    const result = LiminalSense.process({
      userText: 'Thanks for sharing this perspective.',
      timestamp: Date.now(),
      entropyLevel: 0.2,
      activeLayers: ['L20'],
      contextTags: ['reflection'],
    });

    expect(result.mood).toBe('soft-calm');
    expect(result.suggestion).toBe('deep-reflection');
    expect(result.readiness === 'medium' || result.readiness === 'high').toBe(true);
  });

  it('grounds tired inputs with high fatigue', () => {
    const result = LiminalSense.process({
      userText: "I'm exhausted and tired after a long day, need to rest...",
      timestamp: Date.now(),
      entropyLevel: 0.4,
    });

    expect(result.emotionalGradient.fatigue).toBeGreaterThan(0.65);
    expect(result.suggestion).toBe('grounding');
    expect(result.readiness).toBe('low');
  });

  it('opens up for inspired and energetic messages', () => {
    const result = LiminalSense.process({
      userText:
        'Feeling inspired! So many ideas are flowing, I want to build, explore, and share what comes next! What if we link these threads together?',
      timestamp: Date.now(),
      tokensCount: 180,
      entropyLevel: 0.25,
      activeLayers: ['L20', 'L21', 'L30'],
    });

    expect(result.emotionalGradient.uplift).toBeGreaterThan(0.6);
    expect(['gentle-expansion', 'open-window']).toContain(result.suggestion);
    expect(result.luck.phase === 'opening' || result.luck.resonance > 0.5).toBe(true);
  });

  it('detects oscillating drift from alternating histories', () => {
    const previousStates: SenseState[] = [
      makeState('bright', {
        calm: 0.6,
        tension: 0.2,
        curiosity: 0.6,
        fatigue: 0.2,
        uplift: 0.7,
        groundedness: 0.6,
        focus: 0.6,
        confidence: 0.65,
      }),
      makeState('compressed', {
        calm: 0.4,
        tension: 0.5,
        curiosity: 0.2,
        fatigue: 0.6,
        uplift: 0.2,
        groundedness: 0.35,
        focus: 0.35,
        confidence: 0.4,
      }),
    ];

    const result = LiminalSense.process({
      userText: 'Not sure, but maybe there is a path here? Yet I feel a spark.',
      timestamp: Date.now(),
      previousStates,
      entropyLevel: 0.5,
    });

    expect(result.drift).toBe('oscillating');
    expect(result.mood).toBe('wavering-curious');
  });
});
