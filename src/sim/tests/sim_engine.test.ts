import { describe, expect, it } from 'vitest';
import { computeAtlasFingerprint } from '@/atlas/full_atlas';
import { decideGrowthMode } from '@/organism/growthModes/L11_growth_layer';
import { runL10CrystalStep } from '@/organism/crystal/L10_crystal_layer';
import { runL9MetabolicStep } from '@/organism/metabolism/L9_metabolic_layer';
import type { TriAxisState } from '@/core/types/ontogenesis';
import { runSimulation } from '../sim_engine';
import { Scenarios } from '../sim_scenarios';
import type { SimState } from '../sim_types';

const buildTriAxis = (): TriAxisState => ({
  L: { id: 'L', value: 0.55, nourishment: 0.65, pressure: 0.35 },
  S: { id: 'S', value: 0.5, nourishment: 0.6, pressure: 0.4 },
  C: { id: 'C', value: 0.45, nourishment: 0.62, pressure: 0.32 },
});

describe('L15 SimEngine', () => {
  const buildInitialState = (): SimState => {
    const triAxis = buildTriAxis();
    const stage = 5;
    const metabolism = runL9MetabolicStep({ triAxis, loadIndex: 0.45, resonanceQuality: 0.55, recentRecoveryIndex: 0.6 });
    const crystal = runL10CrystalStep({
      triAxis,
      stage,
      metabolism: {
        stressIndex: metabolism.stressIndex,
        recoveryScore: metabolism.recoveryScore,
        overloadRisk: metabolism.overloadRisk,
        mode: metabolism.mode,
      },
      observerLevel: 0.55,
    });

    const snapshot = {
      triAxis,
      stage,
      metabolism,
      crystal,
      growthMode: decideGrowthMode({
        triAxis,
        stage,
        orientation: undefined,
        observer: undefined,
        externalSignals: undefined,
        metabolism,
        crystal,
        timestamp: Date.now(),
      }),
      timestamp: Date.now(),
    };

    const atlas = computeAtlasFingerprint(snapshot);
    return { t: 0, snapshot, atlas };
  };

  it('runs and produces a summary', () => {
    const initial = buildInitialState();
    const trace = runSimulation(initial, Scenarios.baselineGrowth(0.2), { steps: 20, dt: 1, seed: 7 });

    expect(trace.steps.length).toBe(20);
    expect(trace.summary).toHaveProperty('gateGain');
    expect(trace.summary.avgOverloadRisk).toBeGreaterThanOrEqual(0);
  });

  it('reacts to overload phase and recovery phase', () => {
    const initial = buildInitialState();
    const trace = runSimulation(initial, Scenarios.overloadThenRecovery(10, 0.6), { steps: 30, dt: 1, seed: 11 });

    const highStressEvents = trace.steps.filter((step) => step.snapshot.metabolism?.stressIndex && step.snapshot.metabolism.stressIndex > 0.7);
    expect(highStressEvents.length).toBeGreaterThan(0);
    expect(trace.summary.pathVolatility).toBeGreaterThanOrEqual(0);
  });
});
