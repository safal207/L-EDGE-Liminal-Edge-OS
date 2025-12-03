import type { EmotionalGradient, LuckResonance, SenseInput } from './types';

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export const estimateLuckResonance = (
  input: SenseInput,
  gradient: EmotionalGradient,
): LuckResonance => {
  const entropy = input.entropyLevel ?? 0.5;
  const layerFactor = input.activeLayers ? Math.min(1, input.activeLayers.length / 6) : 0.2;
  const alignment = (gradient.curiosity + gradient.uplift + gradient.groundedness) / 3;
  const fatiguePenalty = (gradient.fatigue + gradient.tension) / 2;

  const resonance = clamp(
    alignment * 0.6 +
      layerFactor * 0.2 +
      (1 - entropy) * 0.2 -
      fatiguePenalty * 0.25,
  );

  let phase: LuckResonance['phase'] = 'neutral';
  if (resonance > 0.65 && entropy < 0.6 && gradient.fatigue < 0.65) {
    phase = 'opening';
  } else if (gradient.fatigue > 0.7 || fatiguePenalty > 0.65) {
    phase = 'closing';
  }

  return { resonance, phase };
};
