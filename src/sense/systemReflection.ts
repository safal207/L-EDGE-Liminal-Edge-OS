import type { EmotionalGradient, LuckResonance, SenseInput, SystemReflection, TemporalDrift } from './types';

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const computeBalanceSpread = (gradient: EmotionalGradient): number => {
  const axes = [
    gradient.calm,
    gradient.tension,
    gradient.curiosity,
    gradient.fatigue,
    gradient.uplift,
    gradient.groundedness,
  ];
  return Math.max(...axes) - Math.min(...axes);
};

export const reflectSystem = (
  input: SenseInput,
  gradient: EmotionalGradient,
  drift: TemporalDrift,
  luck: LuckResonance,
): SystemReflection => {
  const entropy = input.entropyLevel ?? 0.5;
  const layerLoad = input.activeLayers ? Math.min(1, input.activeLayers.length / 8) : 0.25;
  const loadLevel = clamp(0.5 * entropy + 0.5 * layerLoad);

  const balance = computeBalanceSpread(gradient);
  const driftBonus = drift === 'stable' ? 0.15 : drift === 'rising' ? 0.05 : -0.05;
  const integrationHealth = clamp(1 - balance * 0.5 + driftBonus + luck.resonance * 0.1);

  let suggestedMode: SystemReflection['suggestedMode'] = 'reflect';
  if (gradient.tension > 0.6 || gradient.fatigue > 0.65) {
    suggestedMode = 'ground';
  } else if (gradient.uplift > 0.6 && gradient.curiosity > 0.5 && loadLevel < 0.6) {
    suggestedMode = 'expand';
  }

  return {
    loadLevel,
    integrationHealth,
    suggestedMode,
  };
};
