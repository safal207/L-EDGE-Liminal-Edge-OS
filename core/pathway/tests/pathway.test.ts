import assert from 'assert';
import { PathwayNode } from '../pathway';
import type { OriginState } from '../../origin/types';
import type { MetaSystemSnapshot } from '../../metaOrchestrator/types';

const originState: OriginState = {
  timestamp: Date.now(),
  rootVector: { meaning: 'liminal-seed', direction: 'expansion', tone: 'warm' },
  lineage: { corePrinciples: ['balance'], inheritedPatterns: ['edge-adaptation'], resolvedPatterns: [] },
  intentionCore: { purpose: 'grow toward clarity', clarity: 0.6 },
  summary: 'seed',
};

const baseMeta: MetaSystemSnapshot = {
  timestamp: Date.now(),
  organism: { stressLevel: 0.2, stability: 0.8, lastHeartbeatId: 'hb-1' },
  field: { pastEntropy: 0.2, futureConfidence: 0.6, mode: 'supportive' },
  intent: { lastIntentId: 'i-1', kind: 'CALM', fieldAlignment: 'aligned' },
  resonance: { primaryMode: 'resonant', topMirrorId: 'm1', topSeedId: 's1' },
  meta: { coherence: 0.75, tension: 0.25, comment: 'stable and supported' },
};

const buildMeta = (overrides: Partial<MetaSystemSnapshot> = {}): MetaSystemSnapshot => ({
  ...baseMeta,
  ...overrides,
  field: { ...baseMeta.field, ...(overrides.field ?? {}) },
  intent: { ...baseMeta.intent, ...(overrides.intent ?? {}) },
  resonance: { ...baseMeta.resonance, ...(overrides.resonance ?? {}) },
  meta: { ...baseMeta.meta, ...(overrides.meta ?? {}) },
});

async function run() {
  const pathway = new PathwayNode({ defaultTrajectory: 'orientation' });

  const initial = pathway.getState();
  assert.strictEqual(initial.growthVector.pace, 'steady');
  assert.ok(initial.futurePull.ideas.includes('supportive-growth'));

  const supported = pathway.update({ originState, metaSnapshot: baseMeta });
  assert.strictEqual(supported.growthVector.pace, 'fast');
  assert.ok(supported.growthVector.alignmentScore > 0.6);
  assert.strictEqual(supported.growthVector.trajectory, 'expand-capillaries');
  assert.ok(supported.branches.active.includes(supported.growthVector.trajectory));
  assert.ok(supported.branches.emerging.includes('supportive-paths'));
  assert.ok(supported.futurePull.intensity > initial.futurePull.intensity);

  const tense = pathway.update({
    originState: { ...originState, rootVector: { ...originState.rootVector, direction: 'integration' } },
    metaSnapshot: buildMeta({ meta: { coherence: 0.4, tension: 0.8, comment: 'high tension' }, field: { mode: 'high_tension' } }),
  });
  assert.strictEqual(tense.growthVector.pace, 'slow');
  assert.ok(tense.growthVector.alignmentScore < supported.growthVector.alignmentScore);
  assert.ok(tense.branches.active.includes('stabilize-core'));
  assert.ok(tense.branches.fading.length >= 0);

  console.log('pathway node tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
