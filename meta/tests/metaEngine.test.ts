import assert from 'assert';
import { MetaEngine } from '../metaEngine';
import { MetaContext } from '../types';
import { IntentState } from '../../intent/types';
import { MemoryState } from '../../memory/memoryTypes';
import { ReflexState } from '../../reflex/types';
import { ReplayState } from '../../replay/types';
import { SleepMetrics } from '../../sleep/sleepCycle';
import { HomeostasisState } from '../../core/homeostasisManager';
import { TransmutationMetrics } from '../../transmutation/contracts';

const baseHomeostasis: HomeostasisState = {
  stressScore: 0.2,
  loadLevel: 'low',
  lastDecisionAt: Date.now(),
  recommendations: { increaseTransmutation: false, triggerSleep: false, throttleEdge: false },
};

const baseMemory: MemoryState = {
  shortTerm: [],
  longTerm: [],
  lastConsolidatedAt: 0,
  shortTermLimit: 50,
  status: 'idle',
};

const baseReflex: ReflexState = { lastActions: [], lastEvents: [] };

const baseSleep: SleepMetrics = { lastSleep: Date.now(), consolidationEvents: 1, dreamIterations: 1, noiseCleared: 2 };

const baseReplay: ReplayState = {
  status: 'idle',
  lastRunAt: 0,
  episodesProcessed: 0,
  avgIntegrationScore: 0.3,
  reliefScore: 0.2,
  lastResults: [],
  lastEpisodes: [],
};

const baseTransmutation: TransmutationMetrics = {
  lastMutation: 0,
  purifiedEvents: 5,
  discardedEntropy: 1,
  signalStrength: 0.6,
};

const buildIntentState = (mode: IntentState['mode'], homeostasis: HomeostasisState, reflex: ReflexState): IntentState => ({
  mode,
  decision: {
    allowHeavyTasks: true,
    throttleNonCritical: false,
    preferCache: false,
    forceSleepSoon: false,
    degradedMode: mode === 'DEGRADED' || mode === 'CRITICAL',
  },
  lastEvaluatedAt: Date.now(),
  context: { homeostasis, reflex, replay: baseReplay, memory: baseMemory },
  overrideActive: false,
});

const buildContext = (partial?: Partial<MetaContext>): MetaContext => {
  const homeostasis = partial?.homeostasis ?? baseHomeostasis;
  const reflex = partial?.reflex ?? baseReflex;
  const sleep = partial?.sleep ?? baseSleep;
  const replay = partial?.replay ?? baseReplay;
  const intent = partial?.intent ?? buildIntentState('CALM', homeostasis, reflex);
  return { homeostasis, reflex, sleep, replay, intent, transmutation: partial?.transmutation ?? baseTransmutation };
};

async function run() {
  const meta = new MetaEngine({ maxHistory: 10 });
  const calmState = meta.evaluate(buildContext());
  assert(calmState.summary.coherence > 0.7, 'expected coherence to stay high');
  assert.strictEqual(calmState.summary.anomalies.length, 0);
  assert.strictEqual(calmState.summary.stressTrend, 'stable');

  const reflex: ReflexState = {
    lastActions: [
      { id: 'a1', ts: Date.now(), severity: 'critical', reason: 'overload', commands: { throttleEdge: true } },
    ],
    lastEvents: [],
  };

  const stressed: HomeostasisState = {
    stressScore: 0.95,
    loadLevel: 'critical',
    lastDecisionAt: Date.now(),
    recommendations: { increaseTransmutation: true, triggerSleep: true, throttleEdge: true },
  };

  const contexts = [0.3, 0.55, 0.75, 0.95].map((score) =>
    buildContext({ homeostasis: { ...stressed, stressScore: score, loadLevel: score > 0.9 ? 'critical' : 'high' }, reflex })
  );

  contexts.forEach((ctx) => meta.evaluate(ctx));
  const state = meta.getState();

  assert.strictEqual(state.summary.stressTrend, 'rising');
  assert(state.summary.anomalies.includes('stress.critical') || state.summary.anomalies.includes('stress.high'));
  assert(state.summary.anomalies.includes('reflex.critical'));
  assert(state.summary.coherence < 0.6, 'coherence should drop under heavy stress');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
