import assert from 'assert';
import { EmotionEngine } from '../emotionEngine';
import { HomeostasisState } from '../../core/homeostasisManager';
import { InteroceptionState } from '../../interoception/contracts';
import { PerceptionSummary } from '../../perception/types';
import { IntentState } from '../../intent/types';

const baseHomeostasis: HomeostasisState = {
  stressScore: 0.2,
  loadLevel: 'low',
  lastDecisionAt: Date.now(),
  recommendations: { increaseTransmutation: false, triggerSleep: false, throttleEdge: false },
};

const baseInteroception: InteroceptionState = {
  signals: [],
  summary: {
    fatigue: 0.1,
    tension: 0.1,
    entropyPressure: 0.1,
    readiness: 0.9,
    clarity: 0.9,
    overload: 0.05,
    status: 'stable',
    annotations: [],
    lastUpdated: Date.now(),
  },
};

const basePerception: PerceptionSummary = {
  pressure: 0.1,
  threatScore: 0.05,
  opportunityScore: 0.2,
  noiseLevel: 0.1,
  status: 'calm',
  signalsProcessed: 1,
  lastUpdated: Date.now(),
};

const baseIntent: IntentState = {
  mode: 'CALM',
  decision: {
    allowHeavyTasks: true,
    throttleNonCritical: false,
    preferCache: false,
    forceSleepSoon: false,
    degradedMode: false,
  },
  lastEvaluatedAt: Date.now(),
  context: {
    homeostasis: baseHomeostasis,
    reflex: { lastActions: [], lastEvents: [] },
    replay: {
      status: 'idle',
      lastRunAt: 0,
      episodesProcessed: 0,
      avgIntegrationScore: 0,
      reliefScore: 0,
      lastResults: [],
      lastEpisodes: [],
    },
    memory: { shortTerm: [], longTerm: [], lastConsolidatedAt: 0, shortTermLimit: 50, status: 'idle' },
    perception: basePerception,
    interoception: baseInteroception,
  },
  overrideActive: false,
};

async function run() {
  const engine = new EmotionEngine({ maxHistory: 4 });

  const calm = engine.evaluate({
    homeostasis: baseHomeostasis,
    interoception: baseInteroception,
    perception: basePerception,
    intent: baseIntent,
  });
  assert.strictEqual(calm.current.state, 'calmReady');
  assert.ok(calm.current.confidence > 0);

  const threatState = engine.evaluate({
    homeostasis: { ...baseHomeostasis, stressScore: 0.85, loadLevel: 'high' },
    interoception: { ...baseInteroception, summary: { ...baseInteroception.summary, tension: 0.8 } },
    perception: { ...basePerception, threatScore: 0.9, pressure: 0.8, status: 'alert' },
    intent: baseIntent,
    reflex: { lastActions: [], lastEvents: [] },
  });
  assert.ok(['focusThreat', 'alert', 'overloadProtect'].includes(threatState.current.state));

  const opportunity = engine.evaluate({
    homeostasis: { ...baseHomeostasis, stressScore: 0.3 },
    interoception: { ...baseInteroception, summary: { ...baseInteroception.summary, readiness: 0.9, fatigue: 0.1 } },
    perception: { ...basePerception, opportunityScore: 0.9, threatScore: 0.05, status: 'watch' },
    intent: baseIntent,
  });
  assert.ok(['exploreOpportunity', 'expanding'].includes(opportunity.current.state));

  const overload = engine.evaluate({
    homeostasis: { ...baseHomeostasis, stressScore: 0.95, loadLevel: 'critical' },
    interoception: { ...baseInteroception, summary: { ...baseInteroception.summary, fatigue: 0.9, overload: 0.9, tension: 0.85 } },
    perception: { ...basePerception, threatScore: 0.7, pressure: 0.7, status: 'critical' },
    intent: { ...baseIntent, mode: 'DEGRADED' },
  });
  assert.strictEqual(overload.current.state, 'overloadProtect');

  const history = engine.listHistory(10);
  assert.ok(history.length <= 4, 'history should be bounded');
  assert.ok(engine.getState().current.volatility >= 0, 'volatility should be computed');
}

run()
  .then(() => console.log('emotion engine tests passed'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
