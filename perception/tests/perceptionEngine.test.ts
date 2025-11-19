import assert from 'assert';
import { PerceptionEngine } from '../perceptionEngine';
import { PerceptionSignalType } from '../types';

const createSignal = (type: PerceptionSignalType, intensity: number, source = 'test') => ({
  ts: Date.now(),
  source,
  type,
  intensity,
});

async function run() {
  const engine = new PerceptionEngine({ maxHistory: 5, noiseThreshold: 0.2, anomalyThreshold: 0.8 });

  engine.ingestSignal(createSignal('telemetry', 0.6));
  engine.ingestSignal(createSignal('noise', 0.05));
  engine.ingestSignal(createSignal('alert', 0.9));

  const snapshot = engine.getSnapshot();
  assert.strictEqual(snapshot.noiseLevel > 0, true, 'noise should be recorded');
  assert.strictEqual(snapshot.anomalies, 1, 'alert above threshold should count as anomaly');
  assert.strictEqual(snapshot.status, 'noisy', 'mixed signals should mark status as noisy or higher');

  engine.ingestSignal(createSignal('anomaly', 0.95));
  engine.ingestSignal(createSignal('anomaly', 0.95));
  engine.ingestSignal(createSignal('anomaly', 0.95));
  const heavyNoise = engine.getSnapshot();
  assert.strictEqual(heavyNoise.status === 'degraded' || heavyNoise.status === 'critical', true);

  // history limit respected
  engine.ingestSignal(createSignal('telemetry', 0.4));
  engine.ingestSignal(createSignal('telemetry', 0.4));
  const signalsLength = (engine as any).signals?.length as number;
  assert.ok(signalsLength <= 5, 'history should be bounded');
}

run()
  .then(() => console.log('perception engine tests passed'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
