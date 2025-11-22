import assert from 'assert';
import { IntentEngine } from '../intentEngine';
import { IntentContext } from '../types';
import { HomeostasisState } from '../../core/homeostasisManager';

const calmHomeostasis: HomeostasisState = {
  stressScore: 0.15,
  loadLevel: 'low',
  lastDecisionAt: Date.now(),
  recommendations: { increaseTransmutation: false, triggerSleep: false, throttleEdge: false },
};

const createContext = (overrides: Partial<IntentContext> = {}): IntentContext => ({
  homeostasis: calmHomeostasis,
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
  memory: {
    shortTerm: [],
    longTerm: [],
    lastConsolidatedAt: 0,
    shortTermLimit: 50,
    status: 'idle',
  },
  perception: undefined,
  ...overrides,
});

async function run() {
  const engine = new IntentEngine();

  const calmState = engine.evaluate(createContext());
  assert.strictEqual(calmState.mode, 'CALM', 'calm state should default to CALM');
  assert.strictEqual(calmState.decision.allowHeavyTasks, true);

  const focused = engine.evaluate(
    createContext({
      homeostasis: { ...calmHomeostasis, stressScore: 0.6, loadLevel: 'normal' },
      reflex: { lastActions: [], lastEvents: [] },
    })
  );
  assert.strictEqual(focused.mode, 'FOCUSED', 'medium stress should become FOCUSED');
  assert.strictEqual(focused.decision.preferCache, true);

  const degraded = engine.evaluate(
    createContext({ homeostasis: { ...calmHomeostasis, stressScore: 0.8, loadLevel: 'high' } })
  );
  assert.strictEqual(degraded.mode, 'DEGRADED');
  assert.strictEqual(degraded.decision.degradedMode, true);
  assert.strictEqual(degraded.decision.allowHeavyTasks, false);

  const critical = engine.evaluate(
    createContext({
      homeostasis: { ...calmHomeostasis, stressScore: 0.95, loadLevel: 'critical' },
      reflex: { lastActions: [{ id: '1', ts: Date.now(), severity: 'critical', reason: 'stress', commands: {} }], lastEvents: [] },
    })
  );
  assert.strictEqual(critical.mode, 'CRITICAL');
  assert.strictEqual(critical.decision.forceSleepSoon, true);
  assert.strictEqual(critical.decision.throttleNonCritical, true);

  const healing = engine.evaluate(
    createContext({
      homeostasis: { ...calmHomeostasis, stressScore: 0.35, loadLevel: 'normal' },
      replay: {
        status: 'idle',
        lastRunAt: Date.now(),
        episodesProcessed: 3,
        avgIntegrationScore: 0.6,
        reliefScore: 0.5,
        lastResults: [],
        lastEpisodes: [],
      },
      memory: {
        shortTerm: Array.from({ length: 30 }).map((_, idx) => ({ id: `m${idx}`, ts: Date.now(), source: 'runtime', type: 't' })),
        longTerm: [],
        lastConsolidatedAt: 0,
        shortTermLimit: 50,
        status: 'learning',
      },
    })
  );
  assert.strictEqual(healing.mode, 'HEALING');
  assert.strictEqual(healing.decision.forceSleepSoon, false, 'healing should not force sleep if relief is strong');

  engine.setOverride('CALM');
  const overridden = engine.evaluate(
    createContext({ homeostasis: { ...calmHomeostasis, stressScore: 0.92, loadLevel: 'critical' } })
  );
  assert.strictEqual(overridden.mode, 'CALM', 'override should pin mode to CALM');
  assert.strictEqual(overridden.overrideActive, true);
  engine.clearOverride();

  const alignedState = engine.annotateWithField(
    {
      field: {
        pastField: { dominantPatterns: [], entropy: 0.2 },
        futureField: { candidatePatterns: [], confidence: 0.7 },
        lastUpdated: Date.now(),
      },
      noosphere: { activeImprints: [], supportLevel: 0.7, tensionLevel: 0.2, lastUpdated: Date.now() },
    },
    overridden,
  );
  assert.strictEqual(alignedState.decision.fieldAlignment, 'aligned');

  console.log('intent engine tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
