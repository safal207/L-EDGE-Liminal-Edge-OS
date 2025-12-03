import type { ExternalSignal, ExternalSignalsAggregate } from './L12_external_signals_types';
import type { OrganismTone } from '@/layers/shared/organismTone';
import { DEFAULT_SIGNAL_THRESHOLDS, gateSignals, type SignalThresholds } from './L10_signal_tuning';

export interface ExternalSignalsBuffer {
  signals: ExternalSignal[];
  windowMs: number;
}

export const createExternalSignalsBuffer = (windowMs = 10000): ExternalSignalsBuffer => ({
  signals: [],
  windowMs,
});

export const pushExternalSignal = (
  buffer: ExternalSignalsBuffer,
  signal: ExternalSignal,
  now: number = Date.now(),
): void => {
  buffer.signals.push(signal);
  buffer.signals = buffer.signals.filter((entry) => now - entry.timestamp <= buffer.windowMs);
};

export interface AggregateSignalOptions {
  now?: number;
  tone?: OrganismTone;
  thresholds?: SignalThresholds;
}

export const aggregateExternalSignals = (
  buffer: ExternalSignalsBuffer,
  nowOrOptions?: number | AggregateSignalOptions,
): ExternalSignalsAggregate => {
  const now = typeof nowOrOptions === 'number' ? nowOrOptions : nowOrOptions?.now ?? Date.now();
  const tone = typeof nowOrOptions === 'number' ? undefined : nowOrOptions?.tone;
  const thresholds =
    typeof nowOrOptions === 'number'
      ? DEFAULT_SIGNAL_THRESHOLDS
      : nowOrOptions?.thresholds ?? DEFAULT_SIGNAL_THRESHOLDS;

  const recentSignals = buffer.signals.filter((signal) => now - signal.timestamp <= buffer.windowMs);
  const gatedSignals = tone ? gateSignals(recentSignals, thresholds, tone) : recentSignals;

  if (!gatedSignals.length) {
    return { externalStress: 0, externalRecovery: 0, externalExploration: 0 };
  }

  const sum = (selector: (s: ExternalSignal) => number | undefined): number => {
    return gatedSignals.reduce((acc, signal) => acc + (selector(signal) ?? 0), 0);
  };

  const divisor = gatedSignals.length;
  const externalStress = Math.min(1, sum((s) => s.stressImpact) / divisor);
  const externalRecovery = Math.min(1, sum((s) => s.recoveryImpact) / divisor);
  const externalExploration = Math.min(1, sum((s) => s.explorationImpact) / divisor);

  const lastStrongSignal = [...gatedSignals].sort((a, b) => b.intensity - a.intensity)[0];

  return {
    externalStress,
    externalRecovery,
    externalExploration,
    lastStrongSignal,
  };
};
