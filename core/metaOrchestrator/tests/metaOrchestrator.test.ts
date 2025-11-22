import assert from 'assert';
import { MetaOrchestrator } from '../metaOrchestrator';
import type { HeartbeatState } from '../../types';
import type { FieldSnapshot } from '../../../field/contracts';
import type { CollectiveResonanceSnapshot } from '../../../resonance/collectiveContracts';
import type { NoosphereSnapshot } from '../../../noosphere/contracts';
import type { IntentState } from '../../../intent/types';

const buildHeartbeat = (overrides: Partial<HeartbeatState> = {}): HeartbeatState => ({
  timestamp: new Date().toISOString(),
  edgeStatus: 'ok',
  storageSize: 0,
  resonancePending: 0,
  decisionsGenerated: 0,
  awarenessDecisions: 0,
  runtimeActive: 1,
  homeostasis: { stressScore: 0.2, loadLevel: 'normal' },
  ...overrides,
});

const sampleField: FieldSnapshot = {
  pastField: { dominantPatterns: [], entropy: 0.25 },
  futureField: { candidatePatterns: [], confidence: 0.6 },
  lastUpdated: Date.now(),
};

const sampleCollective: CollectiveResonanceSnapshot = {
  primaryMode: 'resonant',
  topMirrors: [],
  topEchoes: [],
  topSeeds: [],
  volatility: 0.2,
  lastUpdated: Date.now(),
};

const sampleNoosphere: NoosphereSnapshot = {
  activeImprints: [],
  dominantTag: 'growth',
  supportLevel: 0.7,
  tensionLevel: 0.2,
  lastUpdated: Date.now(),
};

const buildIntent = (alignment: IntentState['decision']['fieldAlignment'] = 'aligned'): IntentState => ({
  mode: 'CALM',
  decision: {
    allowHeavyTasks: true,
    throttleNonCritical: false,
    preferCache: false,
    forceSleepSoon: false,
    degradedMode: false,
    fieldAlignment: alignment,
  },
  lastEvaluatedAt: Date.now(),
  context: {} as IntentState['context'],
  overrideActive: false,
});

async function run() {
  const orchestrator = new MetaOrchestrator({
    getLastHeartbeat: () => buildHeartbeat(),
    getLastFieldSnapshot: () => sampleField,
    getLastCollectiveResonance: () => sampleCollective,
    getLastIntent: () => buildIntent('aligned'),
    getLastNoosphere: () => sampleNoosphere,
  });

  assert.strictEqual(orchestrator.getLastSnapshot(), null);

  const supportive = orchestrator.update();
  assert.ok(supportive.meta.coherence > 0.5, 'coherence should reflect supportive field');
  assert.strictEqual(supportive.field?.mode, 'supportive');
  assert.strictEqual(supportive.intent?.fieldAlignment, 'aligned');
  assert.ok((supportive.meta.comment ?? '').length > 0, 'comment should be present');

  const tenseHeartbeat = buildHeartbeat({ homeostasis: { stressScore: 0.92, loadLevel: 'critical' } });
  const highTension: NoosphereSnapshot = { ...sampleNoosphere, supportLevel: 0.1, tensionLevel: 0.85 };
  const tenseSnapshot = orchestrator.update({
    heartbeat: tenseHeartbeat,
    field: { ...sampleField, pastField: { ...sampleField.pastField, entropy: 0.6 } },
    collective: { ...sampleCollective, volatility: 0.8, primaryMode: 'fragmented' },
    intent: buildIntent('against_field'),
    noosphere: highTension,
  });

  assert.ok(tenseSnapshot.meta.tension > 0.8, 'tension should reflect stressed field');
  assert.strictEqual(tenseSnapshot.field?.mode, 'high_tension');
  assert.strictEqual(tenseSnapshot.intent?.fieldAlignment, 'against_field');
  assert.ok((tenseSnapshot.meta.comment ?? '').includes('Высокое напряжение'));

  console.log('meta orchestrator tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
