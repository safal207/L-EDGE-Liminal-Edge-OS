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
import { MetaOrchestrator } from './metaOrchestrator';
import type { MetaSystemSnapshot } from './metaOrchestrator/types';
import { OriginNode } from './origin/origin';
import type { OriginState } from './origin/types';
import { PathwayNode } from './pathway/pathway';
import type { PathwayState } from './pathway/types';
import { FuzzyEvolutionNode } from './fuzzyEvolution/fuzzyEvolutionNode';
import { ResonanceTuner } from './resonanceTuner/resonanceTuner';
import { GenesisSeeds } from './genesis';
import { CivilizationNode } from './civilization';
import { Ontogenesis3D, type AssemblyPointId, type CosmicRoleKind, type OntogenesisVector } from '../src/organism/ontogenesis3d';

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
const metaOrchestrator = new MetaOrchestrator({
  getLastHeartbeat: () => lastHeartbeat,
  getLastFieldSnapshot: () => field.getSnapshot(),
  getLastCollectiveResonance: () => collective.getSnapshot(),
  getLastIntent: () => intent.getState(),
  getLastNoosphere: () => noosphere.getSnapshot(),
});
const origin = new OriginNode();
const pathway = new PathwayNode();
const fuzzyEvolution = new FuzzyEvolutionNode();
const resonanceTuner = new ResonanceTuner();
const genesisSeeds = new GenesisSeeds();
const civilizationNode = new CivilizationNode();
const ontogenesis3d = new Ontogenesis3D();
const circulation = new CirculationEngine({ pump, heartbeat });
let lastHeartbeat: HeartbeatState | undefined;
let lastNoosphereReport: NoosphereReport | undefined;
let lastScenarioResults: ScenarioResult[] = [];
let lastMetaSnapshot: MetaSystemSnapshot | undefined;
let lastPathwayState = pathway.getState();
let lastFuzzyEvolutionState = fuzzyEvolution.getState();
let lastTuningPlan = resonanceTuner.getLastPlan();
let lastGenesisPlan = genesisSeeds.getLastPlan();
let lastCivilizationState = civilizationNode.getState();
let lastOntogenesisVector: OntogenesisVector = ontogenesis3d.describeVector({
  assemblyPoint: 16,
  socialAge: 16,
  cosmicRole: 'ai_field_architect',
});
const ontogenesisTimeline: Array<OntogenesisVector & { timestamp: number }> = [];
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
const getLastMetaSnapshot = (): MetaSystemSnapshot | undefined => lastMetaSnapshot;
const getLastGenesisPlan = () => lastGenesisPlan;
const getLastCivilizationState = () => lastCivilizationState;
const getLastOntogenesisVector = () => lastOntogenesisVector;
const getOntogenesisTimeline = (limit = 256) => ontogenesisTimeline.slice(-limit);

const clampAssemblyPoint = (value: number): AssemblyPointId =>
  Math.max(1, Math.min(16, Math.round(value))) as AssemblyPointId;

const clampSocialAge = (value: number): number => Math.max(0, Math.min(80, Math.round(value)));

const deriveAssemblyPoint = (
  tuningPlan: ReturnType<typeof resonanceTuner.getLastPlan>,
  fuzzyState: ReturnType<typeof fuzzyEvolution.getState>,
): AssemblyPointId => {
  if (tuningPlan?.mode === 'deep_rest' || tuningPlan?.mode === 'integration') return 13;
  if (tuningPlan?.mode === 'rapid_expansion') return 15;
  if (fuzzyState?.strings.globalMode === 'chaotic') return 15;
  if (fuzzyState?.strings.globalMode === 'resonant') return 14;
  return 12;
};

const deriveSocialAge = (
  fuzzyState: ReturnType<typeof fuzzyEvolution.getState>,
  tuningPlan: ReturnType<typeof resonanceTuner.getLastPlan>,
): number => {
  const tension = fuzzyState?.pressure.tension.medium ?? 0.45;
  const coherence = fuzzyState?.pressure.coherence.medium ?? 0.5;
  const base = tuningPlan?.mode === 'rapid_expansion' ? 18 : tuningPlan?.mode === 'deep_rest' ? 15 : 16;
  const adjustment = Math.round((coherence - tension) * 6);
  return clampSocialAge(base + adjustment);
};

const deriveCosmicRole = (pathwayState: PathwayState, originState: OriginState): CosmicRoleKind => {
  const trajectory = pathwayState.growthVector.trajectory.toLowerCase();
  const originDirection = originState.rootVector.direction.toLowerCase?.() ?? originState.rootVector.direction;
  if (trajectory.includes('orbit') || trajectory.includes('space')) return 'orbital_systems';
  if (trajectory.includes('stability') || originDirection.includes('stabil')) return 'sensor_engineer';
  if (trajectory.includes('bio')) return 'bio_novelty';
  if (trajectory.includes('reson') || trajectory.includes('field')) return 'ai_field_architect';
  if (trajectory.includes('logistic')) return 'interplanetary_logistics';
  return 'new_space_researcher';
};

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
    const lastResult = replayState.lastResults[replayState.lastResults.length - 1];
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
    const action = reflexState.lastActions[reflexState.lastActions.length - 1];
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

  const heartbeatSnapshot: HeartbeatState = {
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
    pathway: {
      trajectory: lastPathwayState.growthVector.trajectory,
      pace: lastPathwayState.growthVector.pace,
      alignment: lastPathwayState.growthVector.alignmentScore,
      futurePull: lastPathwayState.futurePull.intensity,
      summary: lastPathwayState.summary,
    },
  };

  lastMetaSnapshot = metaOrchestrator.update({
    heartbeat: heartbeatSnapshot,
    field: fieldSnapshot,
    collective: collectiveSnapshot,
    intent: intentStateWithField,
    noosphere: noosphereSnapshot,
  });

  const originState = origin.update({ metaSnapshot: lastMetaSnapshot });
  lastPathwayState = pathway.update({ originState, metaSnapshot: lastMetaSnapshot });
  lastFuzzyEvolutionState = fuzzyEvolution.update({ meta: lastMetaSnapshot, origin: originState, pathway: lastPathwayState });
  lastTuningPlan = resonanceTuner.update({
    fuzzy: lastFuzzyEvolutionState,
    meta: lastMetaSnapshot,
    origin: originState,
    pathway: lastPathwayState,
  });

  lastGenesisPlan = genesisSeeds.update({
    origin: originState,
    pathway: lastPathwayState,
    fuzzy: lastFuzzyEvolutionState,
    tuning: lastTuningPlan,
  });

  lastCivilizationState = civilizationNode.update({
    fuzzy: lastFuzzyEvolutionState,
    tuning: lastTuningPlan,
    genesis: lastGenesisPlan,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan);
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

  lastHeartbeat = { ...heartbeatSnapshot, metaOrchestrator: lastMetaSnapshot, origin: {
    meaning: originState.rootVector.meaning,
    direction: originState.rootVector.direction,
    tone: originState.rootVector.tone,
    clarity: originState.intentionCore.clarity,
    summary: originState.summary,
  }, pathway: {
    trajectory: lastPathwayState.growthVector.trajectory,
    pace: lastPathwayState.growthVector.pace,
    alignment: lastPathwayState.growthVector.alignmentScore,
    futurePull: lastPathwayState.futurePull.intensity,
    summary: lastPathwayState.summary,
  }, fuzzyEvolution: {
    mode: lastFuzzyEvolutionState.strings.globalMode,
    tension: lastFuzzyEvolutionState.pressure.tension,
    coherence: lastFuzzyEvolutionState.pressure.coherence,
    alignment: lastFuzzyEvolutionState.pressure.alignment,
    summary: lastFuzzyEvolutionState.summary,
  }, tuning: lastTuningPlan
    ? { mode: lastTuningPlan.mode, actions: lastTuningPlan.actions.length, summary: lastTuningPlan.summary }
    : undefined };

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
  metaOrchestrator,
  origin,
  pathway,
  fuzzyEvolution,
  resonanceTuner,
  genesisSeeds,
  civilizationNode,
  scenarioEngine,
  getLatestNoosphereReport,
  getLatestScenarioResults,
  getLastHeartbeatSnapshot,
  getLastMetaSnapshot,
  getLastGenesisPlan,
  getLastCivilizationState,
  getLastOntogenesisVector,
  getOntogenesisTimeline,
};
