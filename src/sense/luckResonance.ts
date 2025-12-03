import type { EmotionalGradient, LuckResonance, TemporalDrift } from './types';

interface LuckContext {
  gradient: EmotionalGradient;
  entropyLevel?: number;
  drift: TemporalDrift;
  activeLayers?: string[];
}

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const activeLayerFactor = (layers?: string[]): number => {
  if (!layers || layers.length === 0) return 0.1;
  const relevantLayers = layers.filter((layer) => layer.match(/L2\d|L3\d/));
  const base = Math.min(layers.length, 8) / 10;
  const relevanceBonus = Math.min(relevantLayers.length, 6) / 15;
  return clamp(0.2 + base + relevanceBonus, 0, 0.6);
};

export const computeLuckResonance = ({
  gradient,
  entropyLevel,
  drift,
  activeLayers,
}: LuckContext): LuckResonance => {
  const entropy = entropyLevel ?? 0.5;
  const alignmentBase = (gradient.uplift + gradient.curiosity + gradient.groundedness) / 3;
  const resilience = (gradient.calm + gradient.confidence) / 2;
  const fatiguePenalty = (gradient.tension + gradient.fatigue) / 2;

  // Start from balanced emotional alignment.
  let resonance = clamp(
    alignmentBase * 0.45 + resilience * 0.2 - fatiguePenalty * 0.25 + (1 - entropy) * 0.15,
  );

  // Entropy adjustments: moderate entropy can spark possibility, excessive entropy reduces coherence.
  if (entropy > 0.75) {
    resonance -= 0.1 + (entropy - 0.75) * 0.25;
  } else if (entropy > 0.45 && entropy < 0.65) {
    resonance += 0.05;
  }

  // Temporal drift influence.
  if (drift === 'rising') resonance += 0.05;
  if (drift === 'falling') resonance -= 0.07;
  if (drift === 'oscillating') resonance -= 0.03;

  // Active layer resonance.
  resonance += activeLayerFactor(activeLayers);

  resonance = clamp(resonance);

  let phase: LuckResonance['phase'] = 'neutral';
  const tensionSafe = gradient.tension < 0.6;
  if (resonance > 0.65 && tensionSafe && (drift === 'rising' || drift === 'stable')) {
    phase = 'opening';
  } else if (resonance < 0.35 || gradient.fatigue > 0.75 || drift === 'falling') {
    phase = 'closing';
  }

  return { resonance, phase };
};
