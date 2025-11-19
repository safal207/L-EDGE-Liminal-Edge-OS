import assert from 'assert';
import { v4 as uuid } from 'uuid';
import { EdgeEvent, PolicyDecision } from '../core';
import { HeartbeatService } from '../core/heartbeat';
import { LoggingAwarenessGateway } from '../awareness/awarenessGateway';
import { CirculationPump } from '../circulation/pump';
import { CirculationEngine } from '../circulation/circulationEngine';
import { InMemoryRuntimeAdapter } from '../runtime/runtimeAdapter';
import { createInMemoryLiminalStorage } from '../storage/mockStorage';
import { ResonanceEngine } from '../resonance/resonanceEngine';

class ImmediateResonanceEngine implements ResonanceEngine {
  private handler?: (decision: PolicyDecision) => void;
  private pending = 0;
  private total = 0;

  async submitEvents(events: EdgeEvent[]): Promise<void> {
    events.forEach((event, index) => {
      this.pending += 1;
      const decision = {
        id: `decision-${uuid()}`,
        targetNode: event.nodeId,
        policy: index % 2 === 0 ? 'ALLOW' : 'DELAY',
        issuedAt: new Date().toISOString(),
        metadata: event.metadata,
      };
      this.pending -= 1;
      this.total += 1;
      this.handler?.(decision);
    });
  }

  onDecision(handler: (decision: PolicyDecision) => void): void {
    this.handler = handler;
  }

  getPendingCount(): number {
    return this.pending;
  }

  getDecisionCount(): number {
    return this.total;
  }
}

(async () => {
  const storage = createInMemoryLiminalStorage();
  const awareness = new LoggingAwarenessGateway();
  const runtime = new InMemoryRuntimeAdapter();
  const resonance = new ImmediateResonanceEngine();
  const heartbeat = new HeartbeatService({
    storage,
    resonance,
    awareness,
    runtime,
    edgeStatusProvider: () => 'ok',
  });

  const pump = new CirculationPump({ storage, resonance, awareness, runtime });
  const circulation = new CirculationEngine({ pump, heartbeat, historyLimit: 5 });
  circulation.start();

  const event: EdgeEvent = {
    id: uuid(),
    nodeId: 'edge-test',
    service: 'test-service',
    type: 'EDGE_REQUEST_RECEIVED',
    payload: { message: 'hello' },
    metadata: {
      correlationId: uuid(),
      traceId: uuid(),
      createdAt: new Date().toISOString(),
    },
  };

  await storage.saveEdgeEvent(event);
  await new Promise((resolve) => setTimeout(resolve, 10));

  const snapshot = circulation.getLatestSnapshot();
  assert(snapshot, 'circulation snapshot should exist');
  assert(snapshot?.flowSpeedMs >= 0, 'flow speed should be non-negative');
  assert(snapshot?.direction.includes('Edge'), 'direction should reference Edge loop');

  const beats = await storage.listHeartbeats(1);
  assert(beats[0]?.circulation, 'heartbeat should embed circulation metrics');

  console.log('circulation test passed');
})();
