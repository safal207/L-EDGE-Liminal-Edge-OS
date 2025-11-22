import assert from 'assert';
import { CollectiveResonanceEngine } from '../collectiveResonanceEngine';
import { CollectiveTemplate } from '../collectiveContracts';
import { SelfModelSummary } from '../../self/contracts';
import { EmotionSnapshot } from '../../emotion/contracts';
import { PerceptionSummary } from '../../perception/types';

const templates: CollectiveTemplate[] = [
  { id: 'mirror-calm', kind: 'mirror', tags: ['calm', 'pattern-seeker'], dominantEmotions: ['calm'] },
  { id: 'echo-risk', kind: 'echo', tags: ['risk-taker'], dominantEmotions: ['alert'] },
  { id: 'seed-social', kind: 'seed', tags: ['social'], dominantEmotions: ['open'] },
];

const calmSelf: SelfModelSummary = {
  traits: {
    riskTaking: 0.2,
    calmRecovery: 0.7,
    patternSeeking: 0.65,
    avoidantUnderLoad: 0.5,
    socialOrientation: 0.55,
    reflexReliance: 0.4,
    exploration: 0.4,
  },
  identitySummary: 'calm pattern-oriented',
  arcCount: 0,
  lastUpdated: Date.now(),
  volatility: 0.12,
};

const alertSelf: SelfModelSummary = {
  ...calmSelf,
  traits: { ...calmSelf.traits, riskTaking: 0.8, calmRecovery: 0.3 },
};

const calmEmotion: EmotionSnapshot = {
  state: 'calmReady',
  confidence: 0.6,
  volatility: 0.1,
  annotations: [],
  contributors: { fatigue: 0.2, tension: 0.2, threat: 0.2, opportunity: 0.6, readiness: 0.8 },
  lastUpdated: Date.now(),
};

const perception: PerceptionSummary = {
  pressure: 0.3,
  threatScore: 0.2,
  opportunityScore: 0.6,
  noiseLevel: 0.1,
  status: 'calm',
  signalsProcessed: 5,
  lastUpdated: Date.now(),
};

async function run() {
  const engine = new CollectiveResonanceEngine(templates, { historyLimit: 4, matchThreshold: 0.2 });

  const snapshot = engine.evaluate({ self: calmSelf, emotion: calmEmotion, perception });
  assert.strictEqual(snapshot.topMirrors[0]?.templateId, 'mirror-calm');
  assert.ok(snapshot.primaryMode !== 'isolated', 'Should not be isolated when a strong mirror exists');

  const historyAfterFirst = engine.listHistory();
  assert.ok(historyAfterFirst.length <= 4, 'History should respect limit');

  engine.evaluate({ self: alertSelf, emotion: { ...calmEmotion, state: 'alert' }, perception });
  engine.evaluate({ self: alertSelf, emotion: { ...calmEmotion, state: 'alert' }, perception });
  const third = engine.evaluate({ self: alertSelf, emotion: { ...calmEmotion, state: 'alert' }, perception });
  assert.strictEqual(third.topEchoes[0]?.templateId, 'echo-risk');

  const mode = third.primaryMode;
  assert.ok(['resonant', 'fragmented', 'isolated'].includes(mode));

  console.log('collective resonance tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
