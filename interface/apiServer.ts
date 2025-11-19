import express from 'express';
import { createInMemoryLiminalStorage } from '../storage/mockStorage';
import { LoggingAwarenessGateway } from '../awareness/awarenessGateway';
import { InMemoryRuntimeAdapter } from '../runtime/runtimeAdapter';
import { MockResonanceEngine } from '../resonance/resonanceEngine';
import { RoutingPolicy } from '../core';

const app = express();
const storage = createInMemoryLiminalStorage();
const awareness = new LoggingAwarenessGateway();
const runtime = new InMemoryRuntimeAdapter();
const resonance = new MockResonanceEngine();

resonance.onDecision((decision) => {
  console.log('[interface] decision received', decision.id, decision.policy);
});

app.get('/api/system/health', async (_req, res) => {
  const sampleHandle = await runtime.startProcess({ image: 'diagnostic' });
  await runtime.stopProcess(sampleHandle.id);

  const samplePolicy: RoutingPolicy = {
    id: 'policy-dev',
    name: 'dev-routing',
    version: '0.0.1',
    rules: [{ pattern: '/echo', action: 'allow' }],
  };
  await awareness.updateRoutingPolicy(samplePolicy);
  await resonance.submitEvents([]);

  res.json({
    status: 'ok',
    components: {
      edge: 'reachable',
      runtime: await runtime.getProcessState(sampleHandle.id),
      storage: 'mock',
      resonance: 'mock',
      awareness: 'mock',
    },
  });
});

app.get('/api/edge/events', async (_req, res) => {
  const events = await storage.queryEdgeEvents({ limit: 10 });
  res.json({ events });
});

const port = process.env.INTERFACE_PORT ? Number(process.env.INTERFACE_PORT) : 4100;
app.listen(port, () => {
  console.log(`Interface backend listening on http://localhost:${port}`);
});
