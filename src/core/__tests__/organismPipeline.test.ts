import { describe, expect, it } from 'vitest';

import { runOrganismPipeline } from '@/core/organismPipeline';
import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import type { TriAxisState } from '@/core/types/ontogenesis';
import type { L10CrystalSnapshot } from '@/organism/crystal/L10_crystal_types';
import type { MetabolicSnapshot } from '@/organism/metabolism/L9_metabolic_layer';

const baseTriAxis: TriAxisState = {
  L: { id: 'L', value: 0.55, nourishment: 0.68, pressure: 0.32 },
  S: { id: 'S', value: 0.5, nourishment: 0.6, pressure: 0.4 },
  C: { id: 'C', value: 0.45, nourishment: 0.58, pressure: 0.28 },
};

const makeBaseInputs = () => ({
  triAxis: baseTriAxis,
  stage: 7,
  loadIndex: 0.42,
  resonanceQuality: 0.6,
  recentRecoveryIndex: 0.65,
});

describe('runOrganismPipeline', () => {
  it('computes metabolism and crystal snapshots when none are provided', () => {
    const snapshot = runOrganismPipeline(makeBaseInputs());

    expect(snapshot).toBeDefined();
    expect(snapshot.stage).toBe(7);
    expect(typeof snapshot.timestamp).toBe('number');

    expect(snapshot.metabolism).toBeDefined();
    expect(snapshot.metabolism?.stressIndex).toBeGreaterThanOrEqual(0);
    expect(snapshot.metabolism?.stressIndex).toBeLessThanOrEqual(1);

    expect(snapshot.crystal).toBeDefined();
    expect(snapshot.crystal?.overallScore).toBeGreaterThanOrEqual(0);
    expect(snapshot.crystal?.overallScore).toBeLessThanOrEqual(1);

    expect(snapshot.growthMode).toBeDefined();
    expect(snapshot.growthMode?.confidence).toBeGreaterThanOrEqual(0);
    expect(snapshot.growthMode?.confidence).toBeLessThanOrEqual(1);
    expect(snapshot.autopoietic).toBeDefined();
  });

  it('respects provided metabolism and crystal snapshots', () => {
    const customMetabolism: MetabolicSnapshot = {
      mode: 'normal',
      totalEnergy: 0.82,
      totalStress: 0.18,
      totalRecovery: 0.86,
      stressIndex: 0.18,
      recoveryScore: 0.86,
      overloadRisk: 0.03,
      axes: [
        { axisId: 'L', energy: 0.9, stress: 0.1, recovery: 0.9 },
        { axisId: 'S', energy: 0.72, stress: 0.2, recovery: 0.83 },
        { axisId: 'C', energy: 0.8, stress: 0.14, recovery: 0.82 },
      ],
      overloadAxes: [],
      recommendedSlowdown: false,
      recommendedDeepRest: false,
      note: 'manual metabolism override',
    };

    const customCrystal: L10CrystalSnapshot = {
      harmony: { harmonyIndex: 0.52, axisImbalance: { L: 0.1, S: 0.18, C: 0.16 }, metabolicTension: 0.3 },
      growth: { growthMomentum: 0.44, stabilityIndex: 0.58, preferredAdjustments: ['support_L'] },
      overallScore: 0.55,
      note: 'manual crystal snapshot',
    };

    const snapshot = runOrganismPipeline({
      ...makeBaseInputs(),
      metabolism: customMetabolism,
      crystal: customCrystal,
    });

    expect(snapshot.metabolism).toBe(customMetabolism);
    expect(snapshot.crystal).toBe(customCrystal);
    expect(snapshot.metabolism?.note).toBe('manual metabolism override');
    expect(snapshot.crystal?.note).toBe('manual crystal snapshot');
    expect(snapshot.growthMode).toBeDefined();
  });

  it('produces stable shape for downstream consumers', () => {
    const snapshot: OrganismSnapshot = runOrganismPipeline(makeBaseInputs());

    expect(snapshot).toHaveProperty('triAxis.L.value');
    expect(snapshot).toHaveProperty('metabolism.stressIndex');
    expect(snapshot).toHaveProperty('crystal.harmony.harmonyIndex');
    expect(snapshot).toHaveProperty('growthMode.mode');
    expect(snapshot.responseFrame?.intents.length).toBeGreaterThan(0);
    expect(snapshot.autopoietic?.immuneCycle.phase).toBeDefined();
  });
});
