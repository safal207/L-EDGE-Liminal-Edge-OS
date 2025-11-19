import express from 'express';
import { heartbeat, resonance, runtime, storage } from '../core/systemContext';
import { EdgeEventFilter } from '../core';

const parseLimit = (value: unknown, fallback: number, max: number): number => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.min(parsed, max);
  }
  return fallback;
};

export const createInterfaceApp = () => {
  const app = express();

  app.get('/api/system/health', async (_req, res) => {
    const beat = await heartbeat.capture();
    res.json({
      status: 'ok',
      heartbeat: beat,
      components: {
        edge: beat.edgeStatus,
        storage: { size: beat.storageSize },
        resonance: { pending: beat.resonancePending, decisions: beat.decisionsGenerated },
        awareness: { decisions: beat.awarenessDecisions },
        runtime: { active: beat.runtimeActive },
      },
    });
  });

  app.get('/api/system/heartbeat', async (req, res) => {
    const limit = parseLimit(req.query.limit, 20, 50);
    const records = await heartbeat.getRecent(limit);
    res.json({ records });
  });

  app.get('/api/edge/events', async (req, res) => {
    const filter: EdgeEventFilter = {
      limit: parseLimit(req.query.limit, 20, 100),
      type: typeof req.query.type === 'string' ? (req.query.type as EdgeEventFilter['type']) : undefined,
      nodeId: typeof req.query.nodeId === 'string' ? req.query.nodeId : undefined,
      fromTimestamp: typeof req.query.from === 'string' ? req.query.from : undefined,
      toTimestamp: typeof req.query.to === 'string' ? req.query.to : undefined,
      correlationId: typeof req.query.correlationId === 'string' ? req.query.correlationId : undefined,
    };
    const events = await storage.queryEdgeEvents(filter);
    res.json({ events });
  });

  app.get('/api/decisions', async (req, res) => {
    const limit = parseLimit(req.query.limit, 20, 100);
    const decisions = await storage.listPolicyDecisions(limit);
    res.json({ decisions });
  });

  app.get('/api/runtime/state', async (_req, res) => {
    const state = await runtime.getSystemState();
    res.json(state);
  });

  app.get('/api/resonance/state', (_req, res) => {
    res.json({ pending: resonance.getPendingCount(), decisions: resonance.getDecisionCount() });
  });

  return app;
};

export const startInterfaceServer = (port = Number(process.env.INTERFACE_PORT ?? 4100)) => {
  const app = createInterfaceApp();
  return app.listen(port, () => {
    console.log(`Interface backend listening on http://localhost:${port}`);
  });
};

if (require.main === module) {
  startInterfaceServer();
}
