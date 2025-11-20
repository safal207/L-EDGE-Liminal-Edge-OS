import express from 'express';
import {
  heartbeat,
  resonance,
  runtime,
  storage,
  circulation,
  transmutation,
  sleep,
  homeostasis,
  reflex,
  perception,
  memory,
  replay,
  intent,
  meta,
  interoception,
} from '../core/systemContext';
import { EdgeEventFilter } from '../core';
import { toHeartbeatCirculation } from '../core/heartbeat';

const parseLimit = (value: unknown, fallback: number, max: number): number => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.min(parsed, max);
  }
  return fallback;
};

export const createInterfaceApp = () => {
  const app = express();
  app.use(express.json());

  app.get('/api/system/health', async (_req, res) => {
    const transmutationMetrics = transmutation.getMetrics();
    const sleepState = sleep.getState();
    const homeostasisState = homeostasis.getState();
    const reflexState = reflex.getState();
    const perceptionSummary = perception.getSummary();
    const memoryState = memory.getState();
    const replayState = replay.getState();
    const intentState = intent.getState();
    const metaState = meta.getState();
    const interoceptionState = interoception.getState();
    const beat = await heartbeat.capture((state) => ({
      ...state,
      perception: {
        pressure: perceptionSummary.pressure,
        threatScore: perceptionSummary.threatScore,
        opportunityScore: perceptionSummary.opportunityScore,
        noiseLevel: perceptionSummary.noiseLevel,
        status: perceptionSummary.status,
      },
      memory: {
        shortTerm: memoryState.shortTerm.length,
        longTerm: memoryState.longTerm.length,
        lastConsolidatedAt: memoryState.lastConsolidatedAt,
        status: memoryState.status,
      },
      replay: {
        lastRunAt: replayState.lastRunAt,
        episodes: replayState.episodesProcessed,
        avgIntegrationScore: replayState.avgIntegrationScore,
        reliefScore: replayState.reliefScore,
        status: replayState.status,
      },
      transmutation: {
        lastMutation: transmutationMetrics.lastMutation,
        purified: transmutationMetrics.purifiedEvents,
        entropy: transmutationMetrics.discardedEntropy,
        signalStrength: transmutationMetrics.signalStrength,
      },
      sleep: {
        lastSleep: sleepState.lastSleep,
        noiseCleared: sleepState.noiseCleared,
        dreamIterations: sleepState.dreamIterations,
      },
      homeostasis: {
        stressScore: homeostasisState.stressScore,
        loadLevel: homeostasisState.loadLevel,
      },
      reflex: {
        lastActionSeverity: reflexState.lastActions.at(-1)?.severity ?? null,
        lastActionReason: reflexState.lastActions.at(-1)?.reason,
        actionsCount: reflexState.lastActions.length,
      },
      intent: {
        mode: intentState.mode,
        allowHeavyTasks: intentState.decision.allowHeavyTasks,
        throttleNonCritical: intentState.decision.throttleNonCritical,
        forceSleepSoon: intentState.decision.forceSleepSoon,
        degradedMode: intentState.decision.degradedMode,
      },
      meta: {
        coherence: metaState.summary.coherence,
        stressTrend: metaState.summary.stressTrend,
        adaptationPhase: metaState.summary.adaptationPhase,
        dominantIntent: metaState.summary.dominantIntent,
        anomalies: metaState.summary.anomalies,
      },
      interoception: {
        fatigue: interoceptionState.summary.fatigue,
        tension: interoceptionState.summary.tension,
        entropyPressure: interoceptionState.summary.entropyPressure,
        readiness: interoceptionState.summary.readiness,
        clarity: interoceptionState.summary.clarity,
        overload: interoceptionState.summary.overload,
        status: interoceptionState.summary.status,
        annotations: interoceptionState.summary.annotations,
      },
    }));
    const circulationState =
      beat.circulation ?? toHeartbeatCirculation(circulation.getLatestSnapshot()) ?? undefined;
    res.json({
      status: 'ok',
      heartbeat: beat,
      components: {
        edge: beat.edgeStatus,
        storage: { size: beat.storageSize },
        resonance: { pending: beat.resonancePending, decisions: beat.decisionsGenerated },
        awareness: { decisions: beat.awarenessDecisions },
        runtime: { active: beat.runtimeActive },
        perception: beat.perception,
        memory: beat.memory,
        replay: beat.replay,
        circulation: circulationState,
        transmutation: beat.transmutation,
        sleep: beat.sleep,
        homeostasis: beat.homeostasis,
        reflex: beat.reflex,
        intent: beat.intent,
        meta: beat.meta,
        interoception: beat.interoception,
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

  app.get('/api/system/circulation', (req, res) => {
    const limit = parseLimit(req.query.limit, 10, 50);
    const history = circulation.listSnapshots(limit);
    res.json({
      direction: circulation.getDirection(),
      latest: history[0] ?? circulation.getLatestSnapshot(),
      history,
    });
  });

  app.get('/api/system/transmutation', (_req, res) => {
    res.json(transmutation.getMetrics());
  });

  app.get('/api/system/homeostasis', (_req, res) => {
    res.json({
      homeostasis: homeostasis.getState(),
      perception: perception.getSummary(),
      memory: memory.getState(),
      replay: replay.getState(),
      intent: intent.getState(),
      meta: meta.getState(),
      interoception: interoception.getState(),
    });
  });

  app.get('/api/system/reflex', (_req, res) => {
    res.json({
      ...reflex.getState(),
      perception: perception.getSummary(),
      memory: memory.getState(),
      replay: replay.getState(),
      intent: intent.getState(),
      meta: meta.getState(),
      interoception: interoception.getState(),
    });
  });

  app.get('/api/system/memory', (_req, res) => {
    res.json(memory.getState());
  });

  app.get('/api/system/memory/short', (_req, res) => {
    res.json({ events: memory.getState().shortTerm });
  });

  app.get('/api/system/memory/long', (_req, res) => {
    res.json({ snapshots: memory.getState().longTerm });
  });

  app.post('/api/system/memory/recall', (req, res) => {
    const criteria = typeof req.body === 'object' && req.body ? req.body : {};
    const result = memory.recall(criteria);
    res.json(result);
  });

  app.get('/api/system/perception', (_req, res) => {
    res.json(perception.getState());
  });

  app.get('/api/system/perception/events', (req, res) => {
    const limit = parseLimit(req.query.limit, 20, 200);
    res.json({ events: perception.listEvents(limit) });
  });

  app.get('/api/system/perception/summary', (_req, res) => {
    res.json(perception.getSummary());
  });

  app.get('/api/system/replay', (_req, res) => {
    res.json(replay.getSummary());
  });

  app.get('/api/system/replay/state', (_req, res) => {
    res.json(replay.getState());
  });

  app.get('/api/system/replay/episodes', (_req, res) => {
    res.json({ episodes: replay.getEpisodes(), results: replay.getResults() });
  });

  app.post('/api/system/replay/trigger', (_req, res) => {
    const state = replay.runReplayCycle('manual');
    res.json(state);
  });

  app.get('/api/system/meta', (_req, res) => {
    res.json(meta.getState());
  });

  app.get('/api/system/interoception', (_req, res) => {
    res.json(interoception.getState().summary);
  });

  app.get('/api/system/interoception/state', (_req, res) => {
    res.json(interoception.getState());
  });

  app.get('/api/system/intent', (_req, res) => {
    res.json(intent.getState());
  });

  app.post('/api/system/intent/override', (req, res) => {
    const { mode, decision } = req.body ?? {};
    if (typeof mode !== 'string') {
      res.status(400).json({ error: 'mode is required' });
      return;
    }
    intent.setOverride(mode, decision);
    res.json({ status: 'override-set', mode });
  });

  app.post('/api/system/perception/signal', (req, res) => {
    const { source, type, intensity, payload } = req.body ?? {};
    if (typeof source !== 'string' || typeof type !== 'string' || typeof intensity !== 'number') {
      res.status(400).json({ error: 'source, type and intensity are required' });
      return;
    }
    perception.ingestSignal({ source, type, intensity, payload, ts: Date.now() });
    res.json({ status: 'accepted' });
  });

  app.post('/api/system/sleep', async (_req, res) => {
    const metrics = await sleep.trigger('manual');
    res.json({ status: 'started', timestamp: metrics.lastSleep });
  });

  app.get('/api/system/sleep/state', (_req, res) => {
    res.json(sleep.getState());
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
