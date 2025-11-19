import express from 'express';
import { v4 as uuid } from 'uuid';
import {
  DEFAULT_NODE_ID,
  DEFAULT_SERVICE_ID,
  EDGE_EVENT_TOPIC,
  EdgeEvent,
  Metadata,
} from '../core';
import { storage } from '../core/systemContext';
import { StorageEdgeEventSink } from './storageEdgeEventSink';

const sink = new StorageEdgeEventSink(storage);

export const createEdgeApp = () => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'edge', topic: EDGE_EVENT_TOPIC });
  });

  app.post('/echo', async (req, res) => {
    const now = new Date();
    const metadata: Metadata = {
      correlationId: uuid(),
      traceId: uuid(),
      createdAt: now.toISOString(),
    };

    const event: EdgeEvent = {
      id: uuid(),
      nodeId: DEFAULT_NODE_ID,
      service: DEFAULT_SERVICE_ID,
      type: 'EDGE_REQUEST_RECEIVED',
      payload: {
        method: req.method,
        path: req.path,
        body: req.body ?? null,
      },
      metadata,
    };

    const storedEvent = await sink.recordEdgeEvent(event);

    res.json({
      message: 'echo',
      received: req.body ?? null,
      eventId: storedEvent.id,
      sequence: storedEvent.sequence,
    });
  });

  return app;
};

export const startEdgeService = (port = Number(process.env.EDGE_PORT ?? 4000)) => {
  const app = createEdgeApp();
  return app.listen(port, () => {
    console.log(`Edge SomaSeed gateway listening on http://localhost:${port}`);
  });
};

if (require.main === module) {
  startEdgeService();
}
