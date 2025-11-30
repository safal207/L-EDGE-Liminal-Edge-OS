import type { ExternalSignal, ExternalSignalsAggregate } from './L12_external_signals_types';

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

export const aggregateExternalSignals = (
  buffer: ExternalSignalsBuffer,
  now: number = Date.now(),
): ExternalSignalsAggregate => {
  const recentSignals = buffer.signals.filter((signal) => now - signal.timestamp <= buffer.windowMs);

  if (!recentSignals.length) {
    return { externalStress: 0, externalRecovery: 0, externalExploration: 0 };
  }

  const sum = (selector: (s: ExternalSignal) => number | undefined): number => {
    return recentSignals.reduce((acc, signal) => acc + (selector(signal) ?? 0), 0);
  };

  const divisor = recentSignals.length;
  const externalStress = Math.min(1, sum((s) => s.stressImpact) / divisor);
  const externalRecovery = Math.min(1, sum((s) => s.recoveryImpact) / divisor);
  const externalExploration = Math.min(1, sum((s) => s.explorationImpact) / divisor);

  const lastStrongSignal = [...recentSignals].sort((a, b) => b.intensity - a.intensity)[0];

  return {
    externalStress,
    externalRecovery,
    externalExploration,
    lastStrongSignal,
  };
};
