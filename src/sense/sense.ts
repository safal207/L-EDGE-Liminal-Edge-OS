import { buildEmotionalGradient } from './emotionalGradient';
import { computeLuckResonance } from './luckResonance';
import { deriveMoodFromGradient } from './mood';
import { extractReceptorSignals } from './receptors';
import { computeSystemReflection } from './systemReflection';
import { detectTemporalDrift } from './temporalDrift';
import type { SenseInput, SenseState, TemporalDrift } from './types';

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export const BASELINE_STATE: SenseState = {
  mood: 'neutral',
  emotionalGradient: {
    calm: 0.5,
    tension: 0.3,
    curiosity: 0.5,
    fatigue: 0.2,
    uplift: 0.5,
    groundedness: 0.6,
    focus: 0.5,
    confidence: 0.55,
  },
  drift: 'stable',
  luck: {
    resonance: 0.4,
    phase: 'neutral',
  },
  reflection: {
    loadLevel: 0.3,
    integrationHealth: 0.7,
    suggestedMode: 'ground',
  },
  readiness: 'medium',
  suggestion: 'stabilize',
};

const cloneBaseline = (): SenseState => ({
  ...BASELINE_STATE,
  emotionalGradient: { ...BASELINE_STATE.emotionalGradient },
  luck: { ...BASELINE_STATE.luck },
  reflection: { ...BASELINE_STATE.reflection },
});

const isInputValid = (input: SenseInput): boolean => {
  if (!input) return false;
  if (typeof input.timestamp !== 'number' || Number.isNaN(input.timestamp)) return false;
  if (input.userText && typeof input.userText !== 'string') return false;
  if (input.entropyLevel !== undefined && (input.entropyLevel < 0 || input.entropyLevel > 1)) return false;
  return true;
};

const adjustDriftWithCorePulse = (drift: TemporalDrift, corePulse?: SenseInput['corePulse']): TemporalDrift => {
  if (!corePulse) return drift;

  if (corePulse.drift === 'irregular') return 'oscillating';
  if (corePulse.drift === 'falling' && drift === 'rising') return 'stable';
  if (corePulse.drift === 'rising' && drift === 'stable') return 'rising';
  return drift;
};

const deriveReadiness = (
  state: SenseState,
  corePulse?: SenseInput['corePulse'],
): SenseState['readiness'] => {
  const { luck, reflection } = state;
  let readinessScore = clamp(
    luck.resonance * 0.45 + reflection.integrationHealth * 0.4 - reflection.loadLevel * 0.25,
  );

  if (corePulse) {
    readinessScore += (corePulse.readiness - 0.5) * 0.4;
    readinessScore -= (corePulse.overloadLevel ?? 0) * 0.25;
    if (corePulse.drift === 'falling' || corePulse.drift === 'irregular') readinessScore -= 0.05;
    if (corePulse.drift === 'rising') readinessScore += 0.05;
  }

  if (readinessScore > 0.65) return 'high';
  if (readinessScore > 0.35) return 'medium';
  return 'low';
};

const deriveSuggestion = (state: SenseState): SenseState['suggestion'] => {
  const { reflection, luck, drift } = state;
  if (state.mood === 'neutral' && reflection.loadLevel <= 0.4 && luck.resonance <= 0.5) {
    return 'stabilize';
  }
  if (reflection.suggestedMode === 'ground' && reflection.loadLevel < 0.5) return 'stabilize';
  if (reflection.suggestedMode === 'ground' || drift === 'falling') return 'grounding';
  if (reflection.suggestedMode === 'expand') {
    return luck.phase === 'opening' ? 'open-window' : 'gentle-expansion';
  }
  if (reflection.loadLevel > 0.7) return 'stabilize';
  return 'deep-reflection';
};

export class LiminalSense {
  static process(input: SenseInput): SenseState {
    if (!isInputValid(input)) return cloneBaseline();

    const state = cloneBaseline();

    const signals = extractReceptorSignals(input);
    const emotionalGradient = buildEmotionalGradient(signals, input.entropyLevel);
    state.emotionalGradient = emotionalGradient;

    const drift = detectTemporalDrift(input.previousStates, emotionalGradient);
    state.drift = adjustDriftWithCorePulse(drift, input.corePulse);

    const luck = computeLuckResonance({
      gradient: emotionalGradient,
      entropyLevel: input.entropyLevel,
      drift: state.drift,
      activeLayers: input.activeLayers,
    });
    state.luck = luck;

    const reflection = computeSystemReflection({
      gradient: emotionalGradient,
      drift: state.drift,
      luck,
      entropyLevel: input.entropyLevel,
      activeLayers: input.activeLayers,
      corePulse: input.corePulse,
    });
    state.reflection = reflection;

    state.mood = deriveMoodFromGradient(emotionalGradient);
    state.readiness = deriveReadiness(state, input.corePulse);
    state.suggestion = deriveSuggestion(state);

    return state;
  }
}
