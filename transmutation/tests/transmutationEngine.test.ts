import assert from 'assert';
import { cleanEntropy } from '../converters/entropyCleaner';
import { mutateState } from '../converters/stateMutator';
import { TransmutationState } from '../contracts';
import { EdgeEvent } from '../../core';
import { LoopTelemetry } from '../../circulation/types';

const sampleEvents: EdgeEvent[] = [
  {
    id: 'e1',
    nodeId: 'node-1',
    service: 'svc',
    type: 'EDGE_REQUEST_RECEIVED',
    payload: { entropy: 0.2 },
    metadata: { correlationId: 'c1', traceId: 't1', createdAt: new Date().toISOString() },
  },
  {
    id: 'e2',
    nodeId: 'node-1',
    service: 'svc',
    type: 'EDGE_METRIC',
    payload: { entropy: 0.9 },
    metadata: { correlationId: 'c2', traceId: 't2', createdAt: new Date().toISOString() },
  },
];

const telemetry: LoopTelemetry = {
  decision: {
    id: 'decision-1',
    targetNode: 'node-1',
    policy: 'ALLOW',
    issuedAt: new Date().toISOString(),
    metadata: { correlationId: 'c1', traceId: 't1', createdAt: new Date().toISOString() },
  },
  signal: {
    id: 'signal-1',
    decisionId: 'decision-1',
    type: 'start-process',
    targetProcessRef: 'proc',
    issuedAt: new Date().toISOString(),
  },
  completedAt: Date.now(),
};

async function run() {
  const cleaning = cleanEntropy(sampleEvents);
  assert.strictEqual(cleaning.purifiedEvents.length, 1, 'one low-entropy event remains');
  assert.strictEqual(cleaning.discardedEntropy, 1, 'one noisy event discarded');

  const baseState: TransmutationState = {
    lastMutation: 0,
    purifiedEvents: 0,
    discardedEntropy: 0,
    signalStrength: 0,
    tags: [],
    signature: 'base',
  };

  const mutated = mutateState(baseState, cleaning.purifiedEvents, 0.5, cleaning.discardedEntropy, telemetry);
  const mutatedAgain = mutateState(baseState, cleaning.purifiedEvents, 0.5, cleaning.discardedEntropy, telemetry);

  assert.strictEqual(mutated.signature, mutatedAgain.signature, 'mutations are deterministic for same inputs');
  assert.ok(mutated.lastMutation > 0, 'mutation timestamp recorded');
  assert.strictEqual(mutated.purifiedEvents, 1);
  assert.strictEqual(mutated.discardedEntropy, 1);

  console.log('transmutation tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
