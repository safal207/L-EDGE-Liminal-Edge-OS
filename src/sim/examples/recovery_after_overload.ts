import { computeAtlasFingerprint } from '@/atlas/full_atlas';
import { decideGrowthMode } from '@/organism/growthModes/L11_growth_layer';
import { runL9MetabolicStep } from '@/organism/metabolism/L9_metabolic_layer';
import { runL10CrystalStep } from '@/organism/crystal/L10_crystal_layer';
import type { TriAxisState } from '@/core/types/ontogenesis';
import { runSimulation } from '../sim_engine';
import { Scenarios } from '../sim_scenarios';
import type { SimState } from '../sim_types';

const buildTriAxis = (): TriAxisState => ({
  L: { id: 'L', value: 0.46, nourishment: 0.58, pressure: 0.6 },
  S: { id: 'S', value: 0.52, nourishment: 0.55, pressure: 0.62 },
  C: { id: 'C', value: 0.44, nourishment: 0.6, pressure: 0.55 },
});

const triAxis = buildTriAxis();
const stage = 7;

const metabolism = runL9MetabolicStep({
  triAxis,
  loadIndex: 0.78,
  resonanceQuality: 0.55,
  recentRecoveryIndex: 0.35,
});

const crystal = runL10CrystalStep({
  triAxis,
  stage,
  metabolism: {
    stressIndex: metabolism.stressIndex,
    recoveryScore: metabolism.recoveryScore,
    overloadRisk: metabolism.overloadRisk,
    mode: metabolism.mode,
  },
  observerLevel: 0.45,
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
const initial: SimState = { t: 0, snapshot, atlas };

const trace = runSimulation(initial, Scenarios.overloadThenRecovery(30, 0.6), {
  steps: 90,
  dt: 1,
  seed: 99,
  recordEvery: 1,
});

console.log('L15 recovery after overload summary');
console.log(JSON.stringify(trace.summary, null, 2));
