import assert from 'assert';
import { consolidateEvents } from '../consolidation';
import { runDreamSandbox } from '../dreamSandbox';
import { SleepCycle, planSleep } from '../sleepCycle';
import { createInMemoryLiminalStorage } from '../../storage/mockStorage';
import { EdgeEvent } from '../../core';
import { DEFAULT_NODE_ID, DEFAULT_SERVICE_ID } from '../../core/constants';
import type { BodyFatigueSnapshot } from '../../interoception/contracts';

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

  const emergencyFatigue: BodyFatigueSnapshot = { fatigueLevel: 0.9, depletionLevel: 0.8, recoveryNeed: 'high', suggestedSleepMode: 'deep' };
  const emergencyFatiguePlan = planSleep(emergencyFatigue);
  assert.strictEqual(emergencyFatiguePlan.mode, 'deep');
  assert(emergencyFatiguePlan.durationFactor > 1.3, 'deep fatigue extends duration');
  assert.strictEqual(emergencyFatiguePlan.cognitiveOpen, false, 'deep recovery limits replay load');

  const integrativePlan = planSleep({ fatigueLevel: 0.45, depletionLevel: 0.3, recoveryNeed: 'medium', suggestedSleepMode: 'integrative' });
  assert.strictEqual(integrativePlan.mode, 'integrative');
  assert.strictEqual(integrativePlan.durationFactor, 1.0, 'integrative stays balanced');
  assert.strictEqual(integrativePlan.cognitiveOpen, true, 'integrative mode allows exploration');

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

  const boostedMetrics = await sleep.trigger('manual', { bodyFatigue: emergencyFatigue });
  assert.strictEqual(boostedMetrics.lastPlan?.mode, 'deep', 'fatigue propagates into plan');
  assert(boostedMetrics.noiseCleared >= metrics.noiseCleared, 'recovery-emphasis sleep clears at least as much noise');

  console.log('sleep cycle tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
