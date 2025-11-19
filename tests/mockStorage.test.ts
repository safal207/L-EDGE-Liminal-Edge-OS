import assert from 'assert';
import { DEFAULT_NODE_ID, DEFAULT_SERVICE_ID } from '../core/constants';
import { EdgeEvent, PolicyDecision } from '../core/types';
import { createInMemoryLiminalStorage } from '../storage/mockStorage';

const storage = createInMemoryLiminalStorage();

const makeEvent = (index: number): EdgeEvent => ({
  id: `edge-${index}`,
  nodeId: DEFAULT_NODE_ID,
  service: DEFAULT_SERVICE_ID,
  type: index % 2 === 0 ? 'EDGE_REQUEST_RECEIVED' : 'EDGE_METRIC',
  payload: { index },
  metadata: {
    correlationId: `corr-${index % 3}`,
    traceId: `trace-${index}`,
    createdAt: new Date(Date.now() - index * 1000).toISOString(),
  },
});

const makeDecision = (index: number): PolicyDecision => ({
  id: `decision-${index}`,
  targetNode: DEFAULT_NODE_ID,
  policy: index % 2 === 0 ? 'ALLOW' : 'DELAY',
  issuedAt: new Date().toISOString(),
  metadata: {
    correlationId: `decision-${index}`,
    traceId: `decision-${index}`,
    createdAt: new Date().toISOString(),
  },
});

async function run() {
  for (let i = 0; i < 305; i += 1) {
    await storage.saveEdgeEvent(makeEvent(i));
  }

  const total = await storage.countEdgeEvents();
  assert.strictEqual(total, 300, 'storage enforces TTL of 300 events');

  const filtered = await storage.queryEdgeEvents({
    type: 'EDGE_METRIC',
    correlationId: 'corr-1',
    limit: 50,
  });
  assert.ok(filtered.length <= 50, 'respects filter limit');
  assert.ok(filtered.every((event) => event.type === 'EDGE_METRIC'));
  assert.ok(filtered.every((event) => event.metadata.correlationId === 'corr-1'));

  const from = new Date(Date.now() - 60 * 1000).toISOString();
  const timeFiltered = await storage.queryEdgeEvents({ fromTimestamp: from });
  assert.ok(
    timeFiltered.every((event) => new Date(event.metadata.createdAt).getTime() >= new Date(from).getTime()),
    'fromTimestamp filter works',
  );

  for (let i = 0; i < 10; i += 1) {
    await storage.savePolicyDecision(makeDecision(i));
  }
  const decisions = await storage.listPolicyDecisions(5);
  assert.strictEqual(decisions.length, 5);

  console.log('mockStorage tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
