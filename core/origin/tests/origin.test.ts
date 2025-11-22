import assert from 'assert';
import { OriginNode } from '../origin';
import type { MetaSystemSnapshot } from '../../metaOrchestrator/types';

const baseMetaSnapshot: MetaSystemSnapshot = {
  timestamp: Date.now(),
  organism: { stressLevel: 0.2, stability: 0.7, lastHeartbeatId: 'hb-1' },
  field: { pastEntropy: 0.2, futureConfidence: 0.6, mode: 'supportive' },
  intent: { lastIntentId: 'intent-1', kind: 'CALM', fieldAlignment: 'aligned' },
  resonance: { primaryMode: 'resonant', topMirrorId: 'm1', topSeedId: 's1' },
  meta: { coherence: 0.7, tension: 0.25, comment: 'calm and supported' },
};

const buildSnapshot = (overrides: Partial<MetaSystemSnapshot> = {}): MetaSystemSnapshot => ({
  ...baseMetaSnapshot,
  ...overrides,
  organism: { ...baseMetaSnapshot.organism, ...(overrides.organism ?? {}) },
  field: { ...baseMetaSnapshot.field, ...(overrides.field ?? {}) },
  intent: { ...baseMetaSnapshot.intent, ...(overrides.intent ?? {}) },
  resonance: { ...baseMetaSnapshot.resonance, ...(overrides.resonance ?? {}) },
  meta: { ...baseMetaSnapshot.meta, ...(overrides.meta ?? {}) },
});

async function run() {
  const origin = new OriginNode({
    meaning: 'liminal-root',
    direction: 'orientation',
    corePrinciples: ['balance', 'awareness'],
  });

  const initial = origin.getState();
  assert.strictEqual(initial.rootVector.meaning, 'liminal-root');
  assert.strictEqual(initial.intentionCore.purpose.includes('clarity'), true);

  const supportive = origin.update({ metaSnapshot: baseMetaSnapshot });
  assert.strictEqual(supportive.rootVector.direction, 'expansion');
  assert.strictEqual(supportive.rootVector.tone, 'bright');
  assert.ok(supportive.intentionCore.clarity > 0.6);
  assert.ok(supportive.summary.includes('clarity'));

  const tense = origin.update({
    metaSnapshot: buildSnapshot({
      field: { mode: 'high_tension' },
      meta: { coherence: 0.3, tension: 0.85, comment: 'high tension' },
    }),
  });
  assert.strictEqual(tense.rootVector.direction, 'stabilization');
  assert.strictEqual(tense.rootVector.tone, 'deep');
  assert.ok(tense.intentionCore.clarity < supportive.intentionCore.clarity);

  const repetitions = Array.from({ length: 15 }).map((_, idx) =>
    origin.update({
      metaSnapshot: buildSnapshot({
        meta: { coherence: 0.8, tension: 0.2, comment: `stability ${idx}` },
      }),
    }),
  );
  const last = repetitions[repetitions.length - 1];
  assert.ok(last);
  assert.ok((last.lineage.resolvedPatterns.length ?? 0) <= 12, 'resolved patterns capped');

  console.log('origin node tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
