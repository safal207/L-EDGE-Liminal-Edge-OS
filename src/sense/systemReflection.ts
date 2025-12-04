import type {
  EmotionalGradient,
  LuckResonance,
  SystemReflection,
  TemporalDrift,
} from './types';
import type { CorePulseState } from '../layers/L22_core_pulse/types';

type ReflectionContext = {
  gradient: EmotionalGradient;
  drift: TemporalDrift;
  luck: LuckResonance;
  entropyLevel?: number;
  activeLayers?: string[];
  corePulse?: CorePulseState;
};

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

export const computeSystemReflection = ({
  gradient,
  drift,
  luck,
  entropyLevel,
  activeLayers,
  corePulse,
}: ReflectionContext): SystemReflection => {
  const entropy = entropyLevel ?? 0.5;
  const layerLoad = activeLayers ? Math.min(activeLayers.length / 10, 0.9) : 0.15;
  const loadLevel = clamp(0.5 * entropy + 0.5 * layerLoad);

  const balanceSpread = computeBalanceSpread(gradient);
  const balancePenalty = clamp(balanceSpread * 0.45, 0, 0.5);
  const driftPenalty = drift === 'oscillating' ? 0.15 : drift === 'falling' ? 0.1 : 0;
  const phasePenalty = luck.phase === 'closing' ? 0.1 : 0;
  const driftBonus = drift === 'rising' ? 0.05 : drift === 'stable' ? 0.03 : 0;

  let integrationHealth = clamp(
    1 - balancePenalty - driftPenalty - phasePenalty + driftBonus + luck.resonance * 0.1,
  );

  if (corePulse) {
    const pulseDriftPenalty = corePulse.drift === 'falling' ? 0.06 : corePulse.drift === 'irregular' ? 0.08 : 0;
    const overloadPenalty = (corePulse.overloadLevel ?? 0) * 0.12;
    const readinessBoost = corePulse.readiness * 0.05;
    integrationHealth = clamp(integrationHealth - pulseDriftPenalty - overloadPenalty + readinessBoost);
  }

  let suggestedMode: SystemReflection['suggestedMode'] = 'reflect';
  const tensionFatigue = gradient.tension + gradient.fatigue;
  if (tensionFatigue > 1 || loadLevel > 0.65 || (corePulse?.drift === 'falling' && (corePulse.overloadLevel ?? 0) > 0.4)) {
    suggestedMode = 'ground';
  } else if (gradient.uplift > 0.5 && gradient.curiosity > 0.35 && loadLevel < 0.65) {
    suggestedMode = 'expand';
  }

  return {
    loadLevel,
    integrationHealth,
    suggestedMode,
  };
};
