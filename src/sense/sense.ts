import { buildEmotionalGradient } from './emotionalGradient';
import { extractReceptorSignals } from './receptors';
import { estimateLuckResonance } from './luckResonance';
import { detectTemporalDrift } from './temporalDrift';
import { reflectSystem } from './systemReflection';
import type {
  EmotionalGradient,
  LuckResonance,
  SenseInput,
  SenseState,
  SystemReflection,
  TemporalDrift,
} from './types';

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const deriveMood = (gradient: EmotionalGradient, drift: TemporalDrift): string => {
  if (gradient.fatigue > 0.65) {
    return gradient.focus > 0.5 ? 'tired-focus' : 'tired-soft';
  }
  if (gradient.tension > 0.6) {
    return 'tight-guard';
  }
  if (gradient.uplift > 0.65 && gradient.curiosity > 0.55) {
    return drift === 'rising' ? 'soft-rise' : 'bright-curious';
  }
  if (gradient.calm > 0.65 && gradient.groundedness > 0.55) {
    return 'soft-calm';
  }
  return drift === 'oscillating' ? 'wavering-curious' : 'balanced-flow';
};

const deriveReadiness = (
  gradient: EmotionalGradient,
  reflection: SystemReflection,
  luck: LuckResonance,
): SenseState['readiness'] => {
  const readinessScore = clamp(
    gradient.uplift * 0.25 +
      gradient.focus * 0.2 +
      gradient.confidence * 0.2 +
      luck.resonance * 0.2 +
      (1 - reflection.loadLevel) * 0.15 -
      gradient.fatigue * 0.3,
  );

  if (readinessScore > 0.65) return 'high';
  if (readinessScore > 0.35) return 'medium';
  return 'low';
};

const deriveSuggestion = (
  gradient: EmotionalGradient,
  drift: TemporalDrift,
  reflection: SystemReflection,
  luck: LuckResonance,
): SenseState['suggestion'] => {
  if (gradient.fatigue > 0.65 || reflection.suggestedMode === 'ground') {
    return 'grounding';
  }

  if (drift === 'falling' && gradient.tension > 0.5) {
    return 'stabilize';
  }

  if (gradient.uplift > 0.6 && gradient.curiosity > 0.45 && reflection.loadLevel < 0.7) {
    return luck.resonance > 0.7 ? 'open-window' : 'gentle-expansion';
  }

  if (luck.phase === 'opening' && gradient.curiosity > 0.55) {
    return luck.resonance > 0.7 ? 'open-window' : 'gentle-expansion';
  }

  if (reflection.suggestedMode === 'reflect' || gradient.calm > 0.65) {
    return 'deep-reflection';
  }

  return 'gentle-expansion';
};

export class LiminalSense {
  static process(input: SenseInput): SenseState {
    const signals = extractReceptorSignals(input);
    const emotionalGradient = buildEmotionalGradient(input, signals);
    const drift = detectTemporalDrift(input.previousStates, emotionalGradient);
    const luck = estimateLuckResonance(input, emotionalGradient);
    const reflection = reflectSystem(input, emotionalGradient, drift, luck);
    const readiness = deriveReadiness(emotionalGradient, reflection, luck);
    const suggestion = deriveSuggestion(emotionalGradient, drift, reflection, luck);
    const mood = deriveMood(emotionalGradient, drift);

    return {
      mood,
      emotionalGradient,
      drift,
      luck,
      reflection,
      readiness,
      suggestion,
    };
  }
}
