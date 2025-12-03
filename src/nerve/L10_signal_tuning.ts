import type { OrganismTone } from '@/layers/shared/organismTone';
import type { ExternalSignal } from './L12_external_signals_types';

export interface SignalThresholds {
  noiseGate: number;
  minImportance: number;
}

export const DEFAULT_SIGNAL_THRESHOLDS: SignalThresholds = {
  noiseGate: 0.1,
  minImportance: 0.1,
};

export function adjustSignalThresholds(
  base: SignalThresholds,
  tone: OrganismTone,
): SignalThresholds {
  let noiseGate = base.noiseGate;
  let minImportance = base.minImportance;

  if (tone.fuzzChaos > 0.6) {
    noiseGate *= 1.3;
    minImportance *= 1.1;
  }

  if (tone.isInFlow) {
    noiseGate *= 0.9;
  }

  return { noiseGate, minImportance };
}

export function gateSignals(
  signals: ExternalSignal[],
  baseThresholds: SignalThresholds,
  tone?: OrganismTone,
): ExternalSignal[] {
  const thresholds = tone ? adjustSignalThresholds(baseThresholds, tone) : baseThresholds;

  return signals.filter((signal) => {
    const importance = signal.intensity;
    return signal.intensity >= thresholds.noiseGate && importance >= thresholds.minImportance;
  });
}
