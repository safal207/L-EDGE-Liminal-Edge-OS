import assert from 'assert';
import { PlasticityEngine } from '../plasticityEngine';
import { HomeostasisState } from '../../core/homeostasisManager';
import { ReflexState } from '../../reflex/types';
import { IntentState } from '../../intent/types';
import { EmotionState } from '../../emotion/contracts';

const baseHomeostasis: HomeostasisState = {
  stressScore: 0.3,
  loadLevel: 'low',
  lastDecisionAt: Date.now(),
  recommendations: { increaseTransmutation: false, triggerSleep: false, throttleEdge: false },
};

const calmEmotion: EmotionState = {
  current: {
    state: 'calmReady',
    confidence: 0.6,
    volatility: 0.1,
    annotations: [],
    contributors: { tension: 0.1, opportunity: 0.2, threat: 0.05, fatigue: 0.05, readiness: 0.85 },
    lastUpdated: Date.now(),
  },
  history: [],
};

const baseIntent: IntentState = {
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
    perception: undefined,
    interoception: undefined,
  },
  overrideActive: false,
};

const baseReflex: ReflexState = { lastEvents: [], lastActions: [] };

async function run() {
  const engine = new PlasticityEngine({ maxHistory: 5 });

  // prime context
  engine.evaluate({ homeostasis: baseHomeostasis, reflex: baseReflex, intent: baseIntent, emotion: calmEmotion });

  // high stress persisting should reduce sensitivity
  const stressed: HomeostasisState = { ...baseHomeostasis, stressScore: 0.9, loadLevel: 'high' };
  engine.evaluate({ homeostasis: stressed, reflex: baseReflex, intent: { ...baseIntent, mode: 'FOCUSED' }, emotion: calmEmotion });
  const stubbornState = engine.evaluate({ homeostasis: stressed, reflex: baseReflex, intent: { ...baseIntent, mode: 'FOCUSED' }, emotion: calmEmotion });
  assert.ok(stubbornState.suggestions.stressSensitivity < 1, 'stress sensitivity should decrease under persistent stress');

  // reflex improvement should reinforce bias
  const reflexive: ReflexState = { lastEvents: [], lastActions: [{ id: 'r', ts: Date.now(), severity: 'warning', reason: 'test', commands: {} }] };
  const relieved: HomeostasisState = { ...stressed, stressScore: 0.5, loadLevel: 'normal' };
  const reinforced = engine.evaluate({ homeostasis: relieved, reflex: reflexive, intent: { ...baseIntent, mode: 'HEALING' }, emotion: calmEmotion });
  assert.ok(reinforced.suggestions.reflexPriorityBias > 0, 'reflex bias should increase after helpful reflex');

  // adaptation should be bounded and safe
  for (let i = 0; i < 10; i++) {
    engine.evaluate({
      homeostasis: { ...relieved, stressScore: 0.95, loadLevel: 'critical' },
      reflex: baseReflex,
      intent: { ...baseIntent, mode: 'DEGRADED' },
      emotion: calmEmotion,
    });
  }
  const state = engine.getState();
  assert.ok(state.suggestions.stressSensitivity >= 0.7 && state.suggestions.stressSensitivity <= 1.25, 'stress sensitivity clamped');
  assert.ok(state.episodes.length <= 5, 'history is bounded');

  const adaptedDecision = engine.adaptIntentDecision(baseIntent.decision);
  assert.ok(adaptedDecision.decision.throttleNonCritical !== undefined, 'adapted decision returned');

  console.log('plasticity engine tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
