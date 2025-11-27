import assert from 'assert';
import { GenesisSeeds } from '../genesisSeeds';
import type { GenesisPlan } from '../types';
import type { OriginState } from '../../origin/types';
import type { PathwayState } from '../../pathway/types';
import type { FuzzyEvolutionState } from '../../fuzzyEvolution/types';
import type { ResonanceTuningPlan } from '../../resonanceTuner/types';

type Snapshot = {
  origin: OriginState;
  pathway: PathwayState;
  fuzzy: FuzzyEvolutionState;
  tuning: ResonanceTuningPlan;
};

const buildBase = (): Snapshot => ({
  origin: {
    timestamp: Date.now(),
    rootVector: { meaning: 'seed', direction: 'expansion', tone: 'warm' },
    lineage: { corePrinciples: ['balance'], inheritedPatterns: [], resolvedPatterns: [] },
    intentionCore: { purpose: 'grow', clarity: 0.7 },
    summary: 'rooted',
  },
  pathway: {
    timestamp: Date.now(),
    growthVector: { trajectory: 'expand', pace: 'steady', alignmentScore: 0.6 },
    branches: { active: ['expand'], emerging: [], fading: [] },
    futurePull: { ideas: ['expand', 'stabilize'], intensity: 0.7 },
    summary: 'path',
  },
  fuzzy: {
    timestamp: Date.now(),
    cyclesObserved: 5,
    pressure: {
      tension: { low: 0.4, medium: 0.25, high: 0.35 },
      coherence: { low: 0.2, medium: 0.3, high: 0.5 },
      alignment: { low: 0.2, medium: 0.4, high: 0.4 },
    },
    strings: { globalMode: 'resonant', comment: 'stable' },
    suggestions: [],
    summary: 'fuzzy stable',
  },
  tuning: {
    timestamp: Date.now(),
    mode: 'steady_growth',
    actions: [],
    summary: 'steady',
  },
});

const containsSeed = (plan: GenesisPlan, kind: string): boolean =>
  plan.ready.some((s) => s.kind === kind) || plan.deferred.some((s) => s.kind === kind);

async function run() {
  const seeds = new GenesisSeeds();
  const base = buildBase();

  const plan = seeds.update(base);
  assert.ok(plan.ready.length >= 1, 'steady growth should produce ready seeds');
  assert.ok(containsSeed(plan, 'soma_cell'), 'growth pull should suggest soma cell');

  const restfulPlan = seeds.update({
    ...base,
    tuning: { ...base.tuning, mode: 'deep_rest' },
    fuzzy: {
      ...base.fuzzy,
      pressure: {
        ...base.fuzzy.pressure,
        tension: { low: 0.1, medium: 0.2, high: 0.8 },
        coherence: { low: 0.6, medium: 0.25, high: 0.15 },
        alignment: { low: 0.5, medium: 0.25, high: 0.25 },
      },
    },
  });
  assert.ok(restfulPlan.deferred.length >= restfulPlan.ready.length, 'rest mode defers growth seeds');
  assert.ok(containsSeed(restfulPlan, 'metric_probe'), 'high tension adds metric probe');

  const expansionPlan = seeds.update({
    ...base,
    tuning: { ...base.tuning, mode: 'rapid_expansion' },
    pathway: { ...base.pathway, futurePull: { ideas: base.pathway.futurePull.ideas, intensity: 0.9 } },
  });
  assert.ok(expansionPlan.ready.length > 0, 'rapid expansion yields ready seeds');
  assert.ok(containsSeed(expansionPlan, 'resonance_agent'), 'expansion encourages resonance agent');

  console.log('genesis seeds tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
