import assert from 'assert';
import { ResonanceTuner } from '../resonanceTuner';
import type { FuzzyEvolutionState } from '../../fuzzyEvolution/types';
import type { MetaSystemSnapshot } from '../../metaOrchestrator/types';
import type { OriginState } from '../../origin/types';
import type { PathwayState } from '../../pathway/types';

const baseFuzzy: FuzzyEvolutionState = {
  timestamp: Date.now(),
  cyclesObserved: 10,
  pressure: {
    tension: { low: 0.6, medium: 0.25, high: 0.15 },
    coherence: { low: 0.1, medium: 0.3, high: 0.6 },
    alignment: { low: 0.1, medium: 0.4, high: 0.5 },
  },
  strings: { globalMode: 'resonant', comment: 'resonant' },
  suggestions: [],
  summary: 'base',
};

const meta: MetaSystemSnapshot = {
  timestamp: Date.now(),
  organism: { stressLevel: 0.3, stability: 0.7, lastHeartbeatId: 'h-1' },
  field: { pastEntropy: 0.3, futureConfidence: 0.6, mode: 'supportive' },
  intent: { lastIntentId: 'i-1', kind: 'steady', fieldAlignment: 'aligned' },
  resonance: { primaryMode: 'resonant', topMirrorId: 'm1', topSeedId: 's1' },
  meta: { coherence: 0.7, tension: 0.3, comment: 'stable' },
};

const origin: OriginState = {
  timestamp: Date.now(),
  rootVector: { meaning: 'seed', direction: 'expansion', tone: 'warm' },
  lineage: { corePrinciples: ['balance'], inheritedPatterns: [], resolvedPatterns: [] },
  intentionCore: { purpose: 'grow toward clarity', clarity: 0.6 },
  summary: 'rooted',
};

const pathway: PathwayState = {
  timestamp: Date.now(),
  growthVector: { trajectory: 'expand', pace: 'steady', alignmentScore: 0.6 },
  branches: { active: ['expand'], emerging: [], fading: [] },
  futurePull: { ideas: ['clarity'], intensity: 0.5 },
  summary: 'path',
};

const buildFuzzy = (overrides: Partial<FuzzyEvolutionState>): FuzzyEvolutionState => ({
  ...baseFuzzy,
  ...overrides,
  pressure: { ...baseFuzzy.pressure, ...(overrides.pressure ?? {}) },
  strings: { ...baseFuzzy.strings, ...(overrides.strings ?? {}) },
});

async function run() {
  const tuner = new ResonanceTuner({ idPrefix: 'test' });

  const calmPlan = tuner.update({ fuzzy: baseFuzzy, meta, origin, pathway });
  assert.strictEqual(calmPlan.mode, 'steady_growth');
  assert.ok(calmPlan.actions.length >= 1);

  const expansionPlan = tuner.update({
    fuzzy: buildFuzzy({ strings: { globalMode: 'resonant', comment: 'resonant' } }),
    meta,
    origin,
    pathway: { ...pathway, futurePull: { ideas: pathway.futurePull.ideas, intensity: 0.8 } },
  });
  assert.strictEqual(expansionPlan.mode, 'rapid_expansion');
  assert.ok(expansionPlan.actions.some((a) => a.target === 'growth' && a.direction === 'increase'));

  const chaoticPlan = tuner.update({
    fuzzy: buildFuzzy({
      pressure: {
        ...baseFuzzy.pressure,
        tension: { low: 0.05, medium: 0.2, high: 0.9 },
        coherence: { low: 0.7, medium: 0.2, high: 0.1 },
      },
      strings: { globalMode: 'chaotic', comment: 'chaotic' },
    }),
    meta,
    origin,
    pathway,
  });
  assert.ok(['deep_rest', 'integration'].includes(chaoticPlan.mode));
  assert.ok(chaoticPlan.actions.some((a) => a.target === 'load' && a.direction === 'decrease'));

  const stablePlan = tuner.update({
    fuzzy: buildFuzzy({
      pressure: {
        ...baseFuzzy.pressure,
        tension: { low: 0.75, medium: 0.2, high: 0.05 },
        coherence: { low: 0.05, medium: 0.3, high: 0.7 },
      },
      strings: { globalMode: 'ground', comment: 'ground' },
    }),
    meta,
    origin,
    pathway,
  });
  assert.ok(stablePlan.actions.some((a) => a.target === 'rest' || a.target === 'growth'));

  console.log('resonance tuner tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
