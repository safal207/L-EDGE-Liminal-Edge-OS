import { computeAtlasFingerprint } from '@/atlas/full_atlas';
import { decideGrowthMode } from '@/organism/growthModes/L11_growth_layer';
import { runL9MetabolicStep } from '@/organism/metabolism/L9_metabolic_layer';
import { runL10CrystalStep } from '@/organism/crystal/L10_crystal_layer';
import type { TriAxisState } from '@/core/types/ontogenesis';
import { runSimulation } from '../sim_engine';
import { Scenarios } from '../sim_scenarios';
import type { SimState } from '../sim_types';

const buildTriAxis = (): TriAxisState => ({
  L: { id: 'L', value: 0.58, nourishment: 0.7, pressure: 0.32 },
  S: { id: 'S', value: 0.52, nourishment: 0.62, pressure: 0.4 },
  C: { id: 'C', value: 0.48, nourishment: 0.65, pressure: 0.28 },
});

const triAxis = buildTriAxis();
const stage = 6;

const metabolism = runL9MetabolicStep({
  triAxis,
  loadIndex: 0.4,
  resonanceQuality: 0.6,
  recentRecoveryIndex: 0.7,
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
  observerLevel: 0.6,
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

const trace = runSimulation(initial, Scenarios.baselineGrowth(0.3), {
  steps: 60,
  dt: 1,
  seed: 1337,
  recordEvery: 1,
});

console.log('L15 baseline sprint summary');
console.log(JSON.stringify(trace.summary, null, 2));
