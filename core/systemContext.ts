import { LoggingAwarenessGateway } from '../awareness/awarenessGateway';
import { HeartbeatService } from './heartbeat';
import { createInMemoryLiminalStorage } from '../storage/mockStorage';
import { InMemoryRuntimeAdapter } from '../runtime/runtimeAdapter';
import { MockResonanceEngine } from '../resonance/resonanceEngine';
import { CirculationPump } from '../circulation/pump';
import { CirculationEngine } from '../circulation/circulationEngine';
import { TransmutationEngine } from '../transmutation/transmutationEngine';
import { SleepCycle } from '../sleep/sleepCycle';
import { HomeostasisManager } from './homeostasisManager';
import { HeartbeatState } from './types';
import { ReflexEngine } from '../reflex/reflexEngine';
import { PerceptionEngine } from '../perception/perceptionEngine';
import { MemoryEngine } from '../memory/memoryEngine';
import { DreamReplayEngine } from '../replay/dreamReplayEngine';
import { IntentEngine } from '../intent/intentEngine';
import { MetaEngine } from '../meta/metaEngine';
import { InteroceptionEngine } from '../interoception/interoceptionEngine';
import { EmotionEngine } from '../emotion/emotionEngine';
import { SocialResonanceEngine } from '../social/socialResonanceEngine';
import { PlasticityEngine } from '../plasticity/plasticityEngine';
import { SelfModelEngine } from '../self/selfModelEngine';
import { CollectiveResonanceEngine } from '../resonance/collectiveResonanceEngine';
import { FieldResonanceEngine } from '../field/fieldResonanceEngine';
import { NoosphereBridge } from '../noosphere/noosphereBridge';
import { clamp } from '../meta/patternDetector';
import { v4 as uuidv4 } from 'uuid';
import { buildNoosphereReport } from '../noosphere/reportBuilder';
import { ScenarioEngine } from '../scenarios/scenarioEngine';
import { defaultScenarioRules } from '../scenarios/defaultRules';
import { NoosphereReport } from '../noosphere/contracts';
import { ScenarioResult } from '../scenarios/types';

const storage = createInMemoryLiminalStorage();
const runtime = new InMemoryRuntimeAdapter();
const awareness = new LoggingAwarenessGateway();
const resonance = new MockResonanceEngine();

const heartbeat = new HeartbeatService({
  storage,
  resonance,
  awareness,
  runtime,
  edgeStatusProvider: () => 'ok',
});

const pump = new CirculationPump({ storage, resonance, awareness, runtime });
const transmutation = new TransmutationEngine({ storage, pump });
const sleep = new SleepCycle({ storage, transmutation });
const perception = new PerceptionEngine();
const memory = new MemoryEngine();
const replay = new DreamReplayEngine({ memory, transmutation, config: { maxEpisodes: 5, minStressThreshold: 0.15 } });
const intent = new IntentEngine();
const meta = new MetaEngine();
const interoception = new InteroceptionEngine();
const emotion = new EmotionEngine();
const social = new SocialResonanceEngine();
const plasticity = new PlasticityEngine();
const selfModel = new SelfModelEngine();
const collective = new CollectiveResonanceEngine();
const field = new FieldResonanceEngine();
const noosphere = new NoosphereBridge();
const scenarioEngine = new ScenarioEngine(defaultScenarioRules);
const circulation = new CirculationEngine({ pump, heartbeat });
let lastHeartbeat: HeartbeatState | undefined;
let lastNoosphereReport: NoosphereReport | undefined;
let lastScenarioResults: ScenarioResult[] = [];
const getLatestNoosphereReport = (): NoosphereReport => {
  if (!lastNoosphereReport) {
    const snapshot = noosphere.getSnapshot();
    const fieldSnapshot = field.getSnapshot();
    const intentState = intent.getState();
    lastNoosphereReport = buildNoosphereReport({
      snapshot,
      field: fieldSnapshot,
      lastIntent: { ...intentState.decision, mode: intentState.mode },
    });
  }
  return lastNoosphereReport;
};

const getLatestScenarioResults = (): ScenarioResult[] => lastScenarioResults;
const getLastHeartbeatSnapshot = (): HeartbeatState | undefined => lastHeartbeat;

const homeostasis = new HomeostasisManager({
  getHeartbeatMetrics: () => lastHeartbeat,
  getCirculationMetrics: () => circulation.getLatestSnapshot(),
  getStorageMetrics: () => ({ size: lastHeartbeat?.storageSize ?? 0 }),
  getTransmutationMetrics: () => transmutation.getMetrics(),
  getSleepMetrics: () => sleep.getState(),
  getPerceptionMetrics: () => perception.getState().summary,
  getReplayMetrics: () => replay.getState(),
});

const reflex = new ReflexEngine();

heartbeat.onBeat((beat) => {
  lastHeartbeat = beat;
  homeostasis.tick();
  const homeostasisState = homeostasis.getState();
  const perceptionState = perception.getState();
  const circulationSnapshot = circulation.getLatestSnapshot();
  const replayState = replay.getState();
  const transmutationMetrics = transmutation.getMetrics();
  const intentSnapshot = intent.getState();
  const emotionSnapshot = emotion.evaluate({
    homeostasis: homeostasisState,
    interoception: interoception.getState(),
    reflex: reflex.getState(),
    perception: perceptionState.summary,
    intent: intentSnapshot,
    meta: meta.getState(),
    replay: replayState,
  });
  const interoceptionState = interoception.evaluate({
    homeostasis: homeostasisState,
    sleep: sleep.getState(),
    reflex: reflex.getState(),
    replay: replayState,
    transmutation: transmutationMetrics,
    perception: perceptionState.summary,
    intent: intentSnapshot,
    circulation: circulationSnapshot,
    heartbeat: beat,
    memory: memory.getState(),
    meta: meta.getState(),
  });
  const intentState = intent.evaluate({
    homeostasis: homeostasisState,
    reflex: reflex.getState(),
    replay: replayState,
    memory: memory.getState(),
    perception: perceptionState.summary,
    interoception: interoceptionState,
    emotion: emotionSnapshot,
    social: social.getState(),
  });

  const socialState = social.evaluate({
    homeostasis: homeostasisState,
    emotion: emotionSnapshot.current,
    intent: intentState,
    perception: perceptionState.summary,
    interoception: interoceptionState.summary,
    meta: meta.getState(),
    peers: social.getState().peers,
  });

  const plasticityState = plasticity.evaluate({
    homeostasis: homeostasisState,
    reflex: reflex.getState(),
    intent: intentSnapshot,
    emotion: emotionSnapshot,
    social: socialState,
    perception: perceptionState.summary,
    interoception: interoceptionState,
    meta: meta.getState(),
  });

  const intentDecisionWithAdaptation = plasticity.adaptIntentDecision(intentState.decision);
  const intentStateWithAdaptation = { ...intentState, decision: intentDecisionWithAdaptation.decision };
  intent.syncState(intentStateWithAdaptation);

  if (circulationSnapshot) {
    memory.remember({
      source: 'circulation',
      type: 'circulation.loop',
      ts: Date.now(),
      intensity: Math.min(1, circulationSnapshot.pressure / 150),
      payload: circulationSnapshot,
    });
  }

  if (homeostasisState.loadLevel === 'high' || homeostasisState.loadLevel === 'critical') {
    reflex.ingestEvent({
      id: uuidv4(),
      ts: Date.now(),
      source: 'homeostasis',
      kind: homeostasisState.loadLevel === 'critical' ? 'stress.critical' : 'stress.high',
      details: { stressScore: homeostasisState.stressScore },
    });

    memory.remember({
      source: 'homeostasis',
      type: homeostasisState.loadLevel === 'critical' ? 'stress.critical' : 'stress.high',
      ts: Date.now(),
      intensity: homeostasisState.stressScore,
      payload: homeostasisState,
    });
  }

  if (perceptionState.summary.status === 'alert' || perceptionState.summary.status === 'critical') {
    reflex.ingestEvent({
      id: uuidv4(),
      ts: Date.now(),
      source: 'homeostasis',
      kind: perceptionState.summary.status === 'critical' ? 'perception.critical' : 'perception.watch',
      details: perceptionState.summary,
    });

    memory.remember({
      source: 'perception',
      type: perceptionState.summary.status === 'critical' ? 'perception.critical' : 'perception.watch',
      ts: Date.now(),
      intensity: perceptionState.summary.threatScore,
      payload: perceptionState.summary,
    });
  }

  if (replayState.lastResults.length) {
    const lastResult = replayState.lastResults.at(-1);
    if (lastResult) {
      reflex.ingestEvent({
        id: uuidv4(),
        ts: Date.now(),
        source: 'replay',
        kind: lastResult.integrationScore >= 0.7 ? 'replay.success' : 'replay.minor',
        details: lastResult,
      });
    }
  }

  memory.decay();

  meta.evaluate({
    homeostasis: homeostasisState,
    reflex: reflex.getState(),
    sleep: sleep.getState(),
    replay: replayState,
    intent: intentStateWithAdaptation,
    transmutation: transmutationMetrics,
    emotion: emotionSnapshot,
    social: socialState,
    plasticity: plasticityState,
  });

  const adaptedHomeostasis = {
    ...homeostasisState,
    stressScore: clamp(homeostasisState.stressScore * plasticityState.suggestions.stressSensitivity),
  };

  const actionsBefore = reflex.getState().lastActions.length;
  reflex.evaluate(adaptedHomeostasis, emotionSnapshot.current);
  const reflexState = reflex.getState();
  const actionsAfter = reflexState.lastActions.length;

  if (actionsAfter > actionsBefore) {
    const action = reflexState.lastActions.at(-1);
    if (action) {
      memory.remember({
        source: 'reflex',
        type: `reflex.${action.severity}`,
        ts: action.ts,
        intensity: action.severity === 'critical' ? 1 : 0.75,
        payload: action,
      });
    }
  }

  selfModel.evaluate({
    heartbeat: beat,
    homeostasis: homeostasisState,
    interoception: interoceptionState.summary,
    emotion: emotionSnapshot.current,
    perception: perceptionState.summary,
    plasticity: plasticityState,
    social: socialState.summary,
    intent: intentStateWithAdaptation,
    reflex: reflexState,
    meta: meta.getState(),
  });

  const collectiveSnapshot = collective.evaluate({
    self: selfModel.getSummary(),
    emotion: emotionSnapshot.current,
    perception: perceptionState.summary,
  });

  const fieldSnapshot = field.evaluate({
    intentMode: intentStateWithAdaptation.mode,
    emotionState: emotionSnapshot.current.state,
    stress: homeostasisState.stressScore,
    threat: perceptionState.summary.threatScore,
    opportunity: perceptionState.summary.opportunityScore,
    annotations: [perceptionState.summary.status, intentStateWithAdaptation.mode],
  });

  const noosphereSnapshot = noosphere.compute({
    field: fieldSnapshot,
    self: selfModel.getSummary(),
    emotion: emotionSnapshot.current,
    homeostasis: homeostasisState,
    perception: perceptionState.summary,
  });

  const intentStateWithField = intent.annotateWithField(
    { field: fieldSnapshot, noosphere: noosphereSnapshot },
    intentStateWithAdaptation,
  );

  const noosphereReport = buildNoosphereReport({
    snapshot: noosphereSnapshot,
    field: fieldSnapshot,
    lastIntent: { ...intentStateWithField.decision, mode: intentStateWithField.mode },
  });
  lastNoosphereReport = noosphereReport;
  lastScenarioResults = scenarioEngine.evaluate({
    noosphereReport,
    heartbeat: beat,
    collectiveResonance: collectiveSnapshot,
  });

  lastHeartbeat = {
    ...beat,
    intent: {
      mode: intentStateWithField.mode,
      allowHeavyTasks: intentStateWithField.decision.allowHeavyTasks,
      throttleNonCritical: intentStateWithField.decision.throttleNonCritical,
      forceSleepSoon: intentStateWithField.decision.forceSleepSoon,
      degradedMode: intentStateWithField.decision.degradedMode,
      fieldAlignment: intentStateWithField.decision.fieldAlignment,
      noosphereSupport: intentStateWithField.decision.noosphereSupport,
      noosphereTension: intentStateWithField.decision.noosphereTension,
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
  };

  void runtime.applyIntentDecision(intentStateWithField.decision);
});

heartbeat.onBeat((beat) => {
  perception.ingestSignal({
    source: 'heartbeat',
    ts: Date.now(),
    kind: beat.edgeStatus === 'ok' ? 'telemetry' : 'environmentPressure',
    intensity: Math.min(1, (beat.resonancePending + beat.runtimeActive) / 50),
    payload: {
      resonancePending: beat.resonancePending,
      runtimeActive: beat.runtimeActive,
      edgeStatus: beat.edgeStatus,
    },
  });

  memory.remember({
    source: 'heartbeat',
    type: 'heartbeat.snapshot',
    ts: Date.now(),
    intensity: Math.min(1, beat.runtimeActive / 20),
    payload: beat,
  });
});

sleep.on('cycle', (metrics) => {
  memory.remember({
    source: 'sleep',
    type: 'sleep.cycle',
    ts: metrics.lastSleep,
    intensity: Math.min(1, metrics.noiseCleared / 10),
    payload: metrics,
  });
  memory.consolidate();
  replay.runReplayCycle('sleep');
});

sleep.start();
circulation.start();
heartbeat.start();
homeostasis.tick();

export {
  storage,
  runtime,
  awareness,
  resonance,
  heartbeat,
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
  scenarioEngine,
  getLatestNoosphereReport,
  getLatestScenarioResults,
  getLastHeartbeatSnapshot,
};
