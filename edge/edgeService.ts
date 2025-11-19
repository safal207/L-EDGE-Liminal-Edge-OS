import express from 'express';
import { v4 as uuid } from 'uuid';
import {
  DEFAULT_NODE_ID,
  DEFAULT_SERVICE_ID,
  EDGE_EVENT_TOPIC,
  EdgeEvent,
  Metadata,
} from '../core';
import { createInMemoryLiminalStorage } from '../storage/mockStorage';
import { StorageEdgeEventSink } from './storageEdgeEventSink';

const app = express();
app.use(express.json());

const storage = createInMemoryLiminalStorage();
const sink = new StorageEdgeEventSink(storage);

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

  await sink.recordEdgeEvent(event);

  res.json({ message: 'echo', received: req.body ?? null, eventId: event.id });
});

const port = process.env.EDGE_PORT ? Number(process.env.EDGE_PORT) : 4000;
app.listen(port, () => {
  console.log(`Edge SomaSeed gateway listening on http://localhost:${port}`);
});
