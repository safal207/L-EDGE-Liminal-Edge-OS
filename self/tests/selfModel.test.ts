import assert from 'assert';
import { SelfModelEngine } from '../selfModelEngine';
import { SelfModelContext } from '../contracts';
import { HeartbeatState } from '../../core/types';
import { HomeostasisState } from '../../core/homeostasisManager';
import { IntentState } from '../../intent/types';
import { ReflexState } from '../../reflex/types';
import { EmotionSnapshot } from '../../emotion/contracts';
import { InteroceptionState } from '../../interoception/contracts';
import { SocialResonanceState } from '../../social/contracts';
import { PerceptionSummary } from '../../perception/types';
import { PlasticityState } from '../../plasticity/contracts';

const baseHeartbeat: HeartbeatState = {
  timestamp: new Date().toISOString(),
  edgeStatus: 'ok',
  storageSize: 5,
  resonancePending: 1,
  decisionsGenerated: 0,
  awarenessDecisions: 0,
  runtimeActive: 1,
};

const buildHomeostasis = (stressScore: number): HomeostasisState => ({
  stressScore,
  loadLevel: stressScore > 0.85 ? 'critical' : stressScore > 0.65 ? 'high' : 'normal',
  lastDecisionAt: Date.now(),
  recommendations: { increaseTransmutation: false, triggerSleep: false, throttleEdge: false },
});

const baseInteroception: InteroceptionState = {
  signals: [],
  summary: {
    fatigue: 0.2,
    tension: 0.2,
    entropyPressure: 0.15,
    readiness: 0.7,
    clarity: 0.65,
    overload: 0.1,
    status: 'stable',
    annotations: [],
    lastUpdated: Date.now(),
  },
};

const baseEmotion: EmotionSnapshot = {
  state: 'calmReady',
  confidence: 0.6,
  contributors: { fatigue: 0.2, readiness: 0.7, tension: 0.2, threat: 0.1, opportunity: 0.4 },
  annotations: [],
  volatility: 0.1,
  lastUpdated: Date.now(),
};

const basePerception: PerceptionSummary = {
  pressure: 0.2,
  threatScore: 0.15,
  opportunityScore: 0.4,
  noiseLevel: 0.1,
  status: 'calm',
  lastUpdated: Date.now(),
  signalsProcessed: 1,
};

const baseReflex: ReflexState = { lastActions: [], lastEvents: [] };

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
    homeostasis: buildHomeostasis(0.2),
    reflex: baseReflex,
    replay: {
      status: 'idle',
      lastRunAt: 0,
      episodesProcessed: 0,
      avgIntegrationScore: 0.2,
      reliefScore: 0.1,
      lastResults: [],
      lastEpisodes: [],
    },
    memory: { shortTerm: [], longTerm: [], lastConsolidatedAt: 0, shortTermLimit: 50, status: 'idle' },
  },
  overrideActive: false,
};

const buildContext = (overrides?: Partial<SelfModelContext>): SelfModelContext => ({
  heartbeat: baseHeartbeat,
  homeostasis: overrides?.homeostasis ?? buildHomeostasis(0.3),
  interoception: overrides?.interoception ?? baseInteroception.summary,
  emotion: overrides?.emotion ?? baseEmotion,
  perception: overrides?.perception ?? basePerception,
  plasticity: overrides?.plasticity,
  social: overrides?.social,
  intent: overrides?.intent ?? baseIntent,
  reflex: overrides?.reflex ?? baseReflex,
  meta: overrides?.meta,
});

async function run() {
  const engine = new SelfModelEngine({ maxHistory: 4 });
  const highStressContext = buildContext({ homeostasis: buildHomeostasis(0.86), intent: { ...baseIntent, mode: 'HEALING', decision: { ...baseIntent.decision, throttleNonCritical: true, allowHeavyTasks: false } } });
  engine.evaluate(highStressContext);
  engine.evaluate({ ...highStressContext, homeostasis: buildHomeostasis(0.82) });
  const stateAfterStress = engine.evaluate({ ...highStressContext, homeostasis: buildHomeostasis(0.8) });
  assert(stateAfterStress.traits.avoidantUnderLoad > 0.5, 'avoidantUnderLoad should rise under repeated stress');

  const socialHeavy: SocialResonanceState = {
    summary: {
      selfResonance: { score: 0.4, coherence: 0.3, tension: 0.6, annotations: [] },
      peerResonance: [],
      fieldResonance: { pressure: 0.8, opportunity: 0.2, dissonance: 0.5, status: 'overloaded' },
      recommendation: { action: 'shield', priority: 0.8, reason: 'field overload' },
      lastUpdated: Date.now(),
    },
    peers: [],
    history: [],
  };

  const plasticityLean: PlasticityState = {
    episodes: [],
    suggestions: {
      stressSensitivity: 0.8,
      reflexPriorityBias: 0,
      intentBias: { HEALING: 0.3, FOCUSED: 0, DEGRADED: 0 },
      perceptionNoiseTolerance: 0.2,
      notes: [],
    },
    status: 'learning',
    lastUpdated: Date.now(),
    volatility: 0.1,
  };

  const recovering = engine.evaluate(
    buildContext({
      homeostasis: buildHomeostasis(0.4),
      interoception: { ...baseInteroception.summary, fatigue: 0.7, overload: 0.65 },
      emotion: { ...baseEmotion, state: 'recovering', confidence: 0.7 },
      perception: { ...basePerception, opportunityScore: 0.6 },
      social: socialHeavy.summary,
      plasticity: plasticityLean,
    })
  );

  assert(
    recovering.traits.calmRecovery >= stateAfterStress.traits.calmRecovery,
    'calmRecovery should increase after healing bias'
  );
  assert(recovering.arcs.some((arc) => arc.label === 'under-pressure-safe-intent'), 'healing arc should be tracked');

  for (let i = 0; i < 6; i++) {
    engine.evaluate(buildContext({ homeostasis: buildHomeostasis(0.35 + i * 0.01) }));
  }
  const bounded = engine.getState();
  assert(bounded.episodes.length <= 4, 'episode history should be bounded');

  const arcs = bounded.arcs.find((arc) => arc.label === 'under-pressure-safe-intent');
  assert(arcs && arcs.occurrences >= 1, 'arc occurrences should accumulate');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
