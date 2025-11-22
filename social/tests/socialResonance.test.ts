import assert from 'assert';
import { SocialResonanceEngine } from '../socialResonanceEngine';
import { EmotionSnapshot } from '../../emotion/contracts';
import { IntentState } from '../../intent/types';
import { PerceptionSummary } from '../../perception/types';
import { InteroceptionState } from '../../interoception/contracts';
import { MetaState } from '../../meta/types';
import { HomeostasisState } from '../../core/homeostasisManager';

const calmHomeostasis: HomeostasisState = {
  stressScore: 0.2,
  loadLevel: 'low',
  lastDecisionAt: Date.now(),
  recommendations: { increaseTransmutation: false, triggerSleep: false, throttleEdge: false },
};

const calmEmotion: EmotionSnapshot = {
  state: 'calmReady',
  confidence: 0.6,
  contributors: { tension: 0.2, threat: 0.2, opportunity: 0.5, fatigue: 0.2, readiness: 0.8 },
  annotations: [],
  volatility: 0.1,
  lastUpdated: Date.now(),
};

const calmIntent: IntentState = {
  mode: 'CALM',
  decision: {
    allowHeavyTasks: true,
    throttleNonCritical: false,
    preferCache: false,
    forceSleepSoon: false,
    degradedMode: false,
    boostTransmutation: false,
  },
  lastEvaluatedAt: Date.now(),
  context: undefined as any,
  overrideActive: false,
};

const calmPerception: PerceptionSummary = {
  pressure: 0.25,
  threatScore: 0.2,
  opportunityScore: 0.65,
  noiseLevel: 0.1,
  status: 'calm',
  signalsProcessed: 10,
  lastUpdated: Date.now(),
};

const calmInteroception: InteroceptionState['summary'] = {
  fatigue: 0.2,
  tension: 0.25,
  entropyPressure: 0.1,
  readiness: 0.8,
  clarity: 0.9,
  overload: 0.1,
  status: 'stable',
  annotations: [],
  lastUpdated: Date.now(),
};

const calmMeta: MetaState = {
  observations: [],
  summary: {
    coherence: 0.8,
    stressTrend: 'stable',
    adaptationPhase: 'steady-state',
    dominantIntent: 'CALM',
    anomalies: [],
    lastUpdated: Date.now(),
    reflexFrequency: 0,
    replayRelief: 0.4,
  },
};

async function run() {
  const engine = new SocialResonanceEngine({ maxHistory: 3, maxPeers: 3 });

  // Align scenario with a resonant peer and opportunity field
  engine.evaluate({
    homeostasis: calmHomeostasis,
    emotion: calmEmotion,
    intent: calmIntent,
    perception: calmPerception,
    interoception: calmInteroception,
    meta: calmMeta,
    peers: [
      { id: 'ally', alignment: 0.8, syncPotential: 0.9, tension: 0.2 },
      { id: 'noise', alignment: 0.3, syncPotential: 0.3, tension: 0.6 },
    ],
  });

  const alignRecommendation = engine.getState().summary.recommendation;
  assert.strictEqual(alignRecommendation.action, 'align', 'Should prefer aligning with highly resonant peer');
  assert.strictEqual(engine.getState().summary.peerResonance[0].id, 'ally');

  // Overload scenario should suggest shielding/detach
  engine.evaluate({
    homeostasis: { ...calmHomeostasis, stressScore: 0.95, loadLevel: 'critical' },
    emotion: { ...calmEmotion, contributors: { ...calmEmotion.contributors, tension: 0.9, threat: 0.9 } },
    intent: { ...calmIntent, mode: 'CRITICAL' },
    perception: { ...calmPerception, pressure: 0.95, threatScore: 0.95, status: 'critical' },
    interoception: { ...calmInteroception, tension: 0.9, overload: 0.9 },
    meta: calmMeta,
    peers: [{ id: 'ally', alignment: 0.8, syncPotential: 0.9, tension: 0.2 }],
  });

  const overloadRecommendation = engine.getState().summary.recommendation;
  assert.strictEqual(overloadRecommendation.action, 'shield', 'Overloaded field should trigger shielding');
  assert.ok(engine.getState().summary.fieldResonance.status !== 'calm');

  // History should trim to maxHistory
  engine.evaluate({ homeostasis: calmHomeostasis });
  engine.evaluate({ homeostasis: calmHomeostasis });
  assert.ok(engine.getState().history.length <= 3, 'History must be bounded');

  // Low alignment should prefer observation/detach style suggestions
  engine.clear();
  engine.evaluate({
    homeostasis: calmHomeostasis,
    emotion: calmEmotion,
    intent: calmIntent,
    perception: { ...calmPerception, opportunityScore: 0.4, pressure: 0.2 },
    interoception: calmInteroception,
    meta: calmMeta,
    peers: [
      { id: 'outsider', alignment: 0.2, syncPotential: 0.3, tension: 0.4 },
      { id: 'neutral', alignment: 0.35, syncPotential: 0.35, tension: 0.3 },
    ],
  });

  const cautious = engine.getState().summary.recommendation;
  assert.ok(['observe', 'detach'].includes(cautious.action), 'Low alignment should default to observation');

  console.log('social resonance tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
