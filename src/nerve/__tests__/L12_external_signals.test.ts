import { describe, expect, it } from 'vitest';

import { runOrganismPipeline } from '@/core/organismPipeline';
import type { TriAxisState } from '@/core/types/ontogenesis';
import {
  aggregateExternalSignals,
  createExternalSignalsBuffer,
  pushExternalSignal,
} from '@/nerve/L12_external_signals_buffer';
import type { ExternalSignal } from '@/nerve/L12_external_signals_types';

const baseTriAxis: TriAxisState = {
  L: { id: 'L', value: 0.5, nourishment: 0.65, pressure: 0.35 },
  S: { id: 'S', value: 0.5, nourishment: 0.55, pressure: 0.4 },
  C: { id: 'C', value: 0.5, nourishment: 0.6, pressure: 0.3 },
};

describe('L12 external signals', () => {
  it('aggregates recent signals and drops stale ones', () => {
    const buffer = createExternalSignalsBuffer(50);
    const now = Date.now();

    const signals: ExternalSignal[] = [
      {
        source: 'network',
        kind: 'latency_spike',
        intensity: 0.9,
        stressImpact: 0.8,
        timestamp: now,
      },
      {
        source: 'system',
        kind: 'cooldown',
        intensity: 0.6,
        recoveryImpact: 0.7,
        timestamp: now - 10,
      },
      {
        source: 'network',
        kind: 'stale',
        intensity: 1,
        stressImpact: 1,
        timestamp: now - 1000, // should be dropped
      },
    ];

    signals.forEach((signal) => pushExternalSignal(buffer, signal, now));
    const aggregate = aggregateExternalSignals(buffer, now);

    expect(aggregate.externalStress).toBeGreaterThan(0);
    expect(aggregate.externalRecovery).toBeGreaterThan(0);
    expect(aggregate.externalExploration).toBe(0);
    expect(aggregate.lastStrongSignal?.kind).toBe('latency_spike');
  });

  it('feeds external stress into organism metabolism via pipeline', () => {
    const calmSnapshot = runOrganismPipeline({ triAxis: baseTriAxis, stage: 9 });

    const stressedSnapshot = runOrganismPipeline({
      triAxis: baseTriAxis,
      stage: 9,
      externalSignals: { externalStress: 1, externalRecovery: 0, externalExploration: 0 },
    });

    expect(stressedSnapshot.metabolism?.stressIndex ?? 0).toBeGreaterThan(
      calmSnapshot.metabolism?.stressIndex ?? 0,
    );
    expect(stressedSnapshot.metabolism?.overloadRisk ?? 0).toBeGreaterThan(
      calmSnapshot.metabolism?.overloadRisk ?? 0,
    );
  });
});
