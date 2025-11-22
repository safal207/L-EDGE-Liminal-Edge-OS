import assert from 'assert';
import { PerceptionEngine } from '../perceptionEngine';
import { ExternalSignalKind } from '../types';

const createSignal = (kind: ExternalSignalKind, intensity: number, source = 'test') => ({
  ts: Date.now(),
  source,
  kind,
  intensity,
});

async function run() {
  const engine = new PerceptionEngine({ maxHistory: 5 });

  engine.ingestSignal(createSignal('telemetry', 0.3));
  engine.ingestSignal(createSignal('environmentPressure', 0.7));
  engine.ingestSignal(createSignal('threatDetected', 0.9));

  const state = engine.getState();
  assert.strictEqual(state.summary.threatScore > 0.5, true, 'threat score should rise with threat signals');
  assert.strictEqual(state.summary.pressure > 0.5, true, 'pressure should reflect environmental stress');
  assert.strictEqual(['watch', 'alert', 'critical'].includes(state.summary.status), true, 'status should escalate');

  engine.ingestSignal(createSignal('externalOpportunity', 0.8));
  const withOpportunity = engine.getSummary();
  assert.ok(withOpportunity.opportunityScore > 0.15, 'opportunity score should climb');

  // history limit respected
  engine.ingestSignal(createSignal('resourceRisk', 0.4));
  engine.ingestSignal(createSignal('syncLoss', 0.6));
  engine.ingestSignal(createSignal('upstreamDelaySpike', 0.6));
  const signalsLength = engine.getState().events.length;
  assert.ok(signalsLength <= 5, 'history should be bounded');
}

run()
  .then(() => console.log('perception engine tests passed'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
