import assert from 'assert';
import { fuzzyFromScalar, FuzzyEvolutionNode } from '../fuzzyEvolutionNode';
import type { MetaSystemSnapshot } from '../../metaOrchestrator/types';
import type { OriginState } from '../../origin/types';
import type { PathwayState } from '../../pathway/types';

const metaBase: MetaSystemSnapshot = {
  timestamp: Date.now(),
  organism: { stressLevel: 0.2, stability: 0.8, lastHeartbeatId: 'hb-1' },
  field: { pastEntropy: 0.2, futureConfidence: 0.7, mode: 'supportive' },
  intent: { lastIntentId: 'i-1', kind: 'CALM', fieldAlignment: 'aligned' },
  resonance: { primaryMode: 'resonant', topMirrorId: 'm1', topSeedId: 's1' },
  meta: { coherence: 0.75, tension: 0.25, comment: 'stable' },
};

const originBase: OriginState = {
  timestamp: Date.now(),
  rootVector: { meaning: 'seed', direction: 'expansion', tone: 'warm' },
  lineage: { corePrinciples: ['balance'], inheritedPatterns: ['curiosity'], resolvedPatterns: [] },
  intentionCore: { purpose: 'grow toward clarity', clarity: 0.6 },
  summary: 'rooted',
};

const pathwayBase: PathwayState = {
  timestamp: Date.now(),
  growthVector: { trajectory: 'expand-capillaries', pace: 'steady', alignmentScore: 0.6 },
  branches: { active: ['expand-capillaries'], emerging: [], fading: [] },
  futurePull: { ideas: ['clarity'], intensity: 0.4 },
  summary: 'base',
};

const buildMeta = (overrides: Partial<MetaSystemSnapshot>): MetaSystemSnapshot => ({
  ...metaBase,
  ...overrides,
  meta: { ...metaBase.meta, ...(overrides.meta ?? {}) },
  field: { ...metaBase.field, ...(overrides.field ?? {}) },
  intent: { ...metaBase.intent, ...(overrides.intent ?? {}) },
  resonance: { ...metaBase.resonance, ...(overrides.resonance ?? {}) },
});

async function run() {
  const node = new FuzzyEvolutionNode({ maxHistory: 5 });

  const calmState = node.update({ meta: metaBase, origin: originBase, pathway: pathwayBase });
  assert.ok(['ground', 'resonant', 'chaotic', 'damped'].includes(calmState.strings.globalMode));
  assert.ok(calmState.pressure.coherence.high >= 0);
  assert.ok(calmState.suggestions.length >= 1);

  const chaotic = node.update({
    meta: buildMeta({ meta: { coherence: 0.15, tension: 0.9, comment: 'chaos' } }),
    origin: originBase,
    pathway: { ...pathwayBase, growthVector: { ...pathwayBase.growthVector, alignmentScore: 0.2 } },
  });
  assert.strictEqual(chaotic.strings.globalMode, 'chaotic');
  assert.ok(chaotic.suggestions.some((s) => s.id === 'soften-chaos'));
  assert.ok(chaotic.pressure.tension.high > 0.7);

  const damped = node.update({
    meta: buildMeta({ meta: { coherence: 0.2, tension: 0.1, comment: 'damped' } }),
    origin: originBase,
    pathway: pathwayBase,
  });
  assert.ok(damped.pressure.tension.low >= 0);

  const fuzzy = fuzzyFromScalar(0.1);
  assert.ok(fuzzy.low > fuzzy.high);
  assert.ok(fuzzy.medium >= 0);

  console.log('fuzzy evolution node tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
