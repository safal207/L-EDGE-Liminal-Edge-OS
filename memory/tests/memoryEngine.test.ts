import assert from 'assert';
import { MemoryEngine } from '../memoryEngine';
import { MemoryEvent } from '../memoryTypes';

const createEvent = (overrides: Partial<MemoryEvent> = {}): Omit<MemoryEvent, 'id'> => ({
  ts: Date.now(),
  source: 'circulation',
  type: 'loop.complete',
  intensity: 0.4,
  ...overrides,
});

async function run() {
  const engine = new MemoryEngine({ shortTermLimit: 3, shortTermDecayMs: 200 });

  // short-term rollover
  engine.remember(createEvent({ type: 'a' }));
  engine.remember(createEvent({ type: 'b' }));
  engine.remember(createEvent({ type: 'c' }));
  engine.remember(createEvent({ type: 'd' }));
  const afterRollover = engine.getState();
  assert.strictEqual(afterRollover.shortTerm.length <= 3, true, 'short-term memory should be bounded');
  assert.strictEqual(afterRollover.shortTerm.some((evt) => evt.type === 'a'), false, 'oldest entry is dropped');

  // consolidation
  engine.remember(createEvent({ source: 'reflex', type: 'stress.high', intensity: 0.9 }));
  engine.remember(createEvent({ source: 'sleep', type: 'sleep.cycle', intensity: 0.7 }));
  engine.consolidate();
  const consolidated = engine.getState();
  assert.strictEqual(consolidated.longTerm.length > 0, true, 'consolidation should produce long term snapshot');
  assert.strictEqual(consolidated.lastConsolidatedAt > 0, true, 'consolidation timestamp should be set');

  // recall mechanics
  engine.remember(createEvent({ source: 'reflex', type: 'stress.critical', intensity: 0.95 }));
  const recall = engine.recall({ source: 'reflex' });
  assert.ok(recall.events.length >= 1, 'should recall reflex-sourced events');

  // decay old events
  engine.remember({ ...createEvent({ source: 'edge', type: 'edge.event' }), ts: Date.now() - 500 });
  engine.decay();
  const decayed = engine.getState();
  assert.strictEqual(decayed.shortTerm.some((evt) => evt.type === 'edge.event'), false, 'decay drops stale items');

  console.log('memory engine tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
