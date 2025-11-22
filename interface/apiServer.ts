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
  emotion,
  social,
  plasticity,
  selfModel,
  collective,
  field,
  noosphere,
  metaOrchestrator,
  origin,
  pathway,
  fuzzyEvolution,
  resonanceTuner,
  scenarioEngine,
  getLatestNoosphereReport,
  getLatestScenarioResults,
  getLastHeartbeatSnapshot,
  getLastMetaSnapshot,
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
    const emotionState = emotion.getState();
    const socialState = social.getState();
    const plasticityState = plasticity.getState();
    const selfState = selfModel.getState();
    const collectiveSnapshot = collective.getSnapshot();
    const fieldSnapshot = field.getSnapshot();
    const noosphereSnapshot = noosphere.getSnapshot();
    const metaOrchestratorSnapshot = metaOrchestrator.getLastSnapshot();
    const originState = origin.getState();
    const pathwayState = pathway.getState();
    const fuzzyState = fuzzyEvolution.getState();
    const tuningPlan = resonanceTuner.getLastPlan();
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
        fieldAlignment: intentState.decision.fieldAlignment,
        noosphereSupport: intentState.decision.noosphereSupport,
        noosphereTension: intentState.decision.noosphereTension,
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
      emotion: {
        state: emotionState.current.state,
        confidence: emotionState.current.confidence,
        volatility: emotionState.current.volatility,
        annotations: emotionState.current.annotations,
      },
      social: {
        selfResonance: socialState.summary.selfResonance.score,
        coherence: socialState.summary.selfResonance.coherence,
        tension: socialState.summary.selfResonance.tension,
        fieldStatus: socialState.summary.fieldResonance.status,
        recommendation: socialState.summary.recommendation.action,
        peers: socialState.peers.length,
      },
      plasticity: {
        stressSensitivity: plasticityState.suggestions.stressSensitivity,
        reflexBias: plasticityState.suggestions.reflexPriorityBias,
        volatility: plasticityState.volatility,
        episodes: plasticityState.episodes.length,
        status: plasticityState.status,
      },
      selfModel: {
        identity: selfState.identitySummary,
        traits: selfState.traits,
        arcs: selfState.arcs.length,
        volatility: selfState.volatility,
      },
      collectiveResonance: {
        primaryMode: collectiveSnapshot.primaryMode,
        topMirror: collectiveSnapshot.topMirrors[0]?.templateId,
        topEcho: collectiveSnapshot.topEchoes[0]?.templateId,
        topSeed: collectiveSnapshot.topSeeds[0]?.templateId,
        volatility: collectiveSnapshot.volatility,
      },
      field: {
        pastEntropy: fieldSnapshot.pastField.entropy,
        futureConfidence: fieldSnapshot.futureField.confidence,
        dominantCorridor: fieldSnapshot.futureField.candidatePatterns[0]?.id,
      },
      noosphere: {
        supportLevel: noosphereSnapshot.supportLevel,
        tensionLevel: noosphereSnapshot.tensionLevel,
        dominantTag: noosphereSnapshot.dominantTag,
      },
      origin: {
        meaning: originState.rootVector.meaning,
        direction: originState.rootVector.direction,
        tone: originState.rootVector.tone,
        clarity: originState.intentionCore.clarity,
        summary: originState.summary,
      },
      pathway: {
        trajectory: pathwayState.growthVector.trajectory,
        pace: pathwayState.growthVector.pace,
        alignment: pathwayState.growthVector.alignmentScore,
        futurePull: pathwayState.futurePull.intensity,
        summary: pathwayState.summary,
      },
      fuzzyEvolution: {
        mode: fuzzyState.strings.globalMode,
        tension: fuzzyState.pressure.tension,
        coherence: fuzzyState.pressure.coherence,
        alignment: fuzzyState.pressure.alignment,
        summary: fuzzyState.summary,
      },
      tuning: tuningPlan
        ? { mode: tuningPlan.mode, actions: tuningPlan.actions.length, summary: tuningPlan.summary }
        : undefined,
      metaOrchestrator: metaOrchestratorSnapshot ?? undefined,
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
        metaOrchestrator: beat.metaOrchestrator,
        interoception: beat.interoception,
        emotion: beat.emotion,
        social: beat.social,
        plasticity: beat.plasticity,
        selfModel: beat.selfModel,
        collectiveResonance: beat.collectiveResonance,
        field: beat.field,
        noosphere: beat.noosphere,
        origin: beat.origin,
        fuzzyEvolution: beat.fuzzyEvolution,
        tuning: beat.tuning,
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
      emotion: emotion.getState(),
      social: social.getState(),
      plasticity: plasticity.getState(),
      self: selfModel.getState(),
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
      emotion: emotion.getState(),
      social: social.getState(),
      plasticity: plasticity.getState(),
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

  app.get('/api/system/social/resonance', (_req, res) => {
    res.json(social.getState().summary);
  });

  app.get('/api/system/resonance/collective', (_req, res) => {
    res.json(collective.getSnapshot());
  });

  app.get('/api/system/resonance/collective/history', (req, res) => {
    const limit = parseLimit(req.query.limit, 20, 200);
    res.json({ history: collective.listHistory(limit) });
  });

  app.get('/api/system/field', (_req, res) => {
    res.json(field.getSnapshot());
  });

  app.get('/api/system/field/patterns', (req, res) => {
    const limit = parseLimit(req.query.limit, 10, 120);
    res.json({ patterns: field.listPatterns(limit), history: field.listHistory(limit) });
  });

  app.get('/api/system/noosphere', (_req, res) => {
    res.json(noosphere.getSnapshot());
  });

  app.get('/api/system/noosphere/imprints', (_req, res) => {
    res.json({ imprints: noosphere.listImprints() });
  });

  app.get('/api/system/noosphere/report', (_req, res) => {
    res.json(getLatestNoosphereReport());
  });

  app.get('/api/system/social/peers', (req, res) => {
    const limit = parseLimit(req.query.limit, 20, 120);
    res.json({ peers: social.listPeers(limit) });
  });

  app.post('/api/system/social/peers', (req, res) => {
    const peer = req.body ?? {};
    if (typeof peer.id !== 'string') {
      res.status(400).json({ error: 'peer id is required' });
      return;
    }
    social.upsertPeer({
      id: peer.id,
      alignment: typeof peer.alignment === 'number' ? peer.alignment : undefined,
      syncPotential: typeof peer.syncPotential === 'number' ? peer.syncPotential : undefined,
      tension: typeof peer.tension === 'number' ? peer.tension : undefined,
      lastSeen: typeof peer.lastSeen === 'number' ? peer.lastSeen : undefined,
      tags: Array.isArray(peer.tags) ? peer.tags : undefined,
    });
    res.json({ status: 'accepted' });
  });

  app.get('/api/system/emotion', (_req, res) => {
    res.json(emotion.getState().current);
  });

  app.get('/api/system/scenario/suggestions', (_req, res) => {
    const report = getLatestNoosphereReport();
    const suggestions = scenarioEngine.evaluate({
      noosphereReport: report,
      heartbeat: getLastHeartbeatSnapshot(),
      collectiveResonance: collective.getSnapshot(),
    });
    res.json({ suggestions: suggestions.slice(0, 5) });
  });

  app.get('/api/system/emotion/history', (req, res) => {
    const limit = parseLimit(req.query.limit, 20, 120);
    res.json({ history: emotion.listHistory(limit) });
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

  app.get('/api/system/meta/state', (_req, res) => {
    const snapshot = getLastMetaSnapshot() ?? metaOrchestrator.getLastSnapshot();
    if (!snapshot) {
      res.json({ meta: null, message: 'meta orchestrator has not produced a snapshot yet' });
      return;
    }
    res.json({ meta: snapshot });
  });

  app.get('/api/system/evolution/fuzzy', (_req, res) => {
    res.json(fuzzyEvolution.getState());
  });

  app.get('/api/system/tuning/plan', (_req, res) => {
    const plan = resonanceTuner.getLastPlan();
    res.json(plan ?? { status: 'no-plan-yet' });
  });

  app.get('/api/system/origin/state', (_req, res) => {
    res.json(origin.getState());
  });

  app.get('/api/system/pathway/state', (_req, res) => {
    res.json(pathway.getState());
  });

  app.get('/api/system/plasticity', (_req, res) => {
    res.json(plasticity.getState());
  });

  app.get('/api/system/plasticity/history', (req, res) => {
    const limit = parseLimit(req.query.limit, 20, 200);
    res.json({ episodes: plasticity.listEpisodes(limit) });
  });

  app.get('/api/system/self', (_req, res) => {
    const summary = selfModel.getSummary();
    res.json({ ...summary, lastUpdate: summary.lastUpdated });
  });

  app.get('/api/system/self/narrative', (req, res) => {
    const limit = parseLimit(req.query.limit, 20, 200);
    const state = selfModel.getState();
    res.json({
      episodes: selfModel.listEpisodes(limit),
      arcs: state.arcs.slice(-limit).reverse(),
      volatility: state.volatility,
    });
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

  app.get('/api/system/organism', async (_req, res) => {
    const beat = await heartbeat.capture();
    res.json({
      heartbeat: beat,
      homeostasis: homeostasis.getState(),
      emotion: emotion.getState().current,
      social: social.getState().summary,
      intent: intent.getState(),
      plasticity: plasticity.getState(),
      self: selfModel.getSummary(),
      collective: collective.getSnapshot(),
      field: field.getSnapshot(),
      noosphere: noosphere.getSnapshot(),
      origin: origin.getState(),
      pathway: pathway.getState(),
      fuzzyEvolution: fuzzyEvolution.getState(),
      tuning: resonanceTuner.getLastPlan(),
    });
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
