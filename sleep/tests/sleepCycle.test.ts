import assert from 'assert';
import { consolidateEvents } from '../consolidation';
import { runDreamSandbox } from '../dreamSandbox';
import { SleepCycle } from '../sleepCycle';
import { createInMemoryLiminalStorage } from '../../storage/mockStorage';
import { EdgeEvent } from '../../core';
import { DEFAULT_NODE_ID, DEFAULT_SERVICE_ID } from '../../core/constants';

const makeEvent = (entropy: number): EdgeEvent => ({
  id: `edge-${entropy}`,
  nodeId: DEFAULT_NODE_ID,
  service: DEFAULT_SERVICE_ID,
  type: 'EDGE_REQUEST_RECEIVED',
  payload: { entropy },
  metadata: { correlationId: `c-${entropy}`, traceId: `t-${entropy}`, createdAt: new Date().toISOString() },
});

async function run() {
  const events = [makeEvent(0.1), makeEvent(0.8), makeEvent(0.2)];
  const consolidation = consolidateEvents(events);
  assert.strictEqual(consolidation.consolidationEvents, 2, 'two events survive consolidation');
  assert.strictEqual(consolidation.noiseCleared, 1, 'one noisy event cleared');

  const dreamReport = runDreamSandbox(0.9, 2);
  assert.ok(dreamReport.iterations >= 2, 'dream runs at least base iterations');
  assert.ok(dreamReport.imaginedLinks > 0, 'dream generates imagined links');

  const storage = createInMemoryLiminalStorage();
  for (const event of events) {
    await storage.saveEdgeEvent(event);
  }

  const sleep = new SleepCycle({ storage });
  const metrics = await sleep.trigger();
  assert.ok(metrics.lastSleep > 0, 'sleep timestamp recorded');
  assert.strictEqual(metrics.consolidationEvents, 2);
  assert.strictEqual(metrics.noiseCleared, 1);
  assert.ok(metrics.dreamIterations >= 2, 'dream iterations propagated to metrics');

  console.log('sleep cycle tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
