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
import {
  Ontogenesis3D,
  type AssemblyPointId,
  type CosmicRoleKind,
  type OntogenesisVector,
} from '@/organism/ontogenesis3d';
import type { TriAxisState } from '@/core/types/ontogenesis';
import { computeL1Root } from '@/organism/assembly/L1_root';
import { computeL1SocialSeed } from '@/organism/social/social_seedling';
import { computeL2BodyGrounding } from '@/organism/assembly/L2_body_grounding';
import { computeL2SocialSnapshot } from '@/organism/social/social_toddler';
import { computeL3PlayPatterning } from '@/organism/assembly/L3_play_patterning';
import { computeL3SocialSnapshot } from '@/organism/social/social_child';
import { computeL4Mastery } from '@/organism/assembly/L4_mastery';
import { computeL5MeaningSnapshot } from '@/organism/meaning/L5_meaning_engine';
import { computeL5PurposeVector } from '@/organism/meaning/L5_purpose_vector';
import { computeL5MoralSeed } from '@/organism/moral/L5_moral_seed';
import { computeL5TrajectorySnapshot } from '@/organism/trajectory/L5_trajectory';
import { computeCosmicExplorationStyle } from '@/organism/cosmic/cosmic_micro_explorer';
import { computeCosmicPreseed, type CosmicPreseed } from '@/organism/cosmic/cosmic_preseed';
import { computeCosmicPatternWeaver } from '@/organism/cosmic/cosmic_pattern_weaver';
import { computeL4SkillCluster } from '@/organism/skills/L4_skill_cluster';
import { computeL4TaskSequenceCapacity } from '@/organism/sequencing/L4_sequence';
import { computeL4SocialTeam } from '@/organism/social/L4_social_team';
import { computeL4CosmicApprentice } from '@/organism/cosmic/L4_cosmic_apprentice';
import { computeL5CosmicNavigator } from '@/organism/cosmic/L5_cosmic_navigator';
import {
  computeOrientationSnapshot,
  type OrientationConfig,
} from '@/organism/orientation/L0_center';
import { computeAxisCoupling, type AxisCouplingSnapshot } from '@/organism/orientation/L0_axis_coupling';
import {
  ORIENTATION_PRESET_CHILDLIKE,
  ORIENTATION_PRESET_DEFAULT,
  ORIENTATION_PRESET_GUARDIAN,
  ORIENTATION_PRESET_RESEARCH,
} from '@/organism/orientation/L0_presets';
import { computePolaritySnapshot } from '@/organism/orientation/L0_polarity';
import { computeFuzzyBounds } from '@/organism/orientation/L0_fuzzy_bounds';
import { computeLoadProfile } from '@/organism/orientation/L0_load_profile';
import {
  resolveCerebellumConfigFromMode,
  type CerebellumSnapshot,
  runCerebellumStep,
} from '@/organism/orientation/L0_cerebellum';
import {
  defaultAdaptation as adaptResonanceConfig,
  runResonanceStep,
  type ResonanceConfig,
  type ResonanceSnapshot,
} from '@/organism/resonance/L6_resonance_field';
import { RESONANCE_PRESETS, resolveResonancePreset } from '@/organism/resonance/presets';
import {
  DEFAULT_FLOW_CONFIG,
  computeSomaFlow,
  type SomaFlowSnapshot,
} from '@/organism/flow/L7_soma_flow';
import {
  DEFAULT_CRYSTAL_OBSERVER_CONFIG,
  runCrystalObserver,
  type CrystalObserverSnapshot,
} from '@/organism/observer/L8_crystal_observer';
import { runL9MetabolicStep, type MetabolicSnapshot } from '@/organism/metabolism/L9_metabolic_layer';
import { runL10CrystalStep, type L10CrystalSnapshot } from '@/organism/crystal/L10_crystal_layer';
import { runOrganismPipeline } from '@/core/organismPipeline';
import {
  aggregateExternalSignals,
  createExternalSignalsBuffer,
  pushExternalSignal,
} from '@/nerve/L12_external_signals_buffer';
import type { ExternalSignal, ExternalSignalsAggregate } from '@/nerve/L12_external_signals_types';
import type { ResponseFrame } from '@/nerve/L13_response_types';

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
const orientationConfig: OrientationConfig = (() => {
  const presetName = (process.env.LIMINAL_ORIENTATION_PRESET || 'default').toLowerCase();
  if (presetName === 'childlike') return ORIENTATION_PRESET_CHILDLIKE;
  if (presetName === 'research') return ORIENTATION_PRESET_RESEARCH;
  if (presetName === 'guardian') return ORIENTATION_PRESET_GUARDIAN;
  return ORIENTATION_PRESET_DEFAULT;
})();
const cerebellumConfig = resolveCerebellumConfigFromMode(
  process.env.LIMINAL_CEREBELLUM_MODE?.toLowerCase(),
);
const resonanceMode = process.env.LIMINAL_RESONANCE_MODE?.toLowerCase();
let resonanceConfig: ResonanceConfig = {
  preset: resolveResonancePreset(resonanceMode),
  autoAdapt: process.env.LIMINAL_RESONANCE_AUTO === '1',
  maxAmplitude: 0.85,
  recoveryBias: 0.2,
};
const crystalObserverConfig = DEFAULT_CRYSTAL_OBSERVER_CONFIG;
const externalSignalsBuffer = createExternalSignalsBuffer();
let lastExternalSignals: ExternalSignalsAggregate = {
  externalStress: 0,
  externalRecovery: 0,
  externalExploration: 0,
};
let lastResponseFrame: ResponseFrame | undefined;
let lastHeartbeat: HeartbeatState | undefined;
let lastNoosphereReport: NoosphereReport | undefined;
let lastScenarioResults: ScenarioResult[] = [];
let lastMetaSnapshot: MetaSystemSnapshot | undefined;
let lastPathwayState = pathway.getState();
let lastFuzzyEvolutionState = fuzzyEvolution.getState();
let lastTuningPlan = resonanceTuner.getLastPlan();
let lastGenesisPlan = genesisSeeds.getLastPlan();
let lastCivilizationState = civilizationNode.getState();

const l1RootSeed = computeL1Root({ noiseLevel: 0.35, signalClarity: 0.65 });
const l1SocialSeed = computeL1SocialSeed({
  trustSeed: l1RootSeed.trustSeed,
  presence: l1RootSeed.presence,
  sensitivity: l1RootSeed.sensitivity,
});
const l1CosmicPreseed = computeCosmicPreseed({
  sensitivity: l1RootSeed.sensitivity,
  presence: l1RootSeed.presence,
  signalBias: 0.45,
});
const initialCosmicRole = mapPreseedToCosmicRole(l1CosmicPreseed.direction);
const l2BodySeed = computeL2BodyGrounding({
  presence: l1RootSeed.presence,
  trustLevel: l1SocialSeed.trustLevel,
  noiseLevel: 0.35,
  signalClarity: 0.65,
});
const l2SocialSeed = computeL2SocialSnapshot({
  trustLevel: l1SocialSeed.trustLevel,
  safetySense: l1SocialSeed.safetySense,
  explorationDrive: l2BodySeed.explorationDrive,
});
const l2CosmicSeed = computeCosmicExplorationStyle({
  preseed: l1CosmicPreseed.direction,
  explorationDrive: l2BodySeed.explorationDrive,
  stability: l2BodySeed.stability,
});
const l3PlaySeed = computeL3PlayPatterning({
  embodimentScore: l2BodySeed.embodimentScore,
  explorationDrive: l2BodySeed.explorationDrive,
  stability: l2BodySeed.stability,
});
const l3SocialSeed = computeL3SocialSnapshot({
  l2Attachment: l2SocialSeed.attachmentLevel,
  l2CuriositySocial: l2SocialSeed.curiositySocial,
  civAlliesCount: lastCivilizationState?.resonance.alliesCount ?? 0,
  civOpponentsCount: lastCivilizationState?.resonance.opponentsCount ?? 0,
});
const l3CosmicSeed = computeCosmicPatternWeaver({
  preseed: l1CosmicPreseed.direction,
  innerPatternScore: l3PlaySeed.innerPatternScore,
  scenarioPulse: l3PlaySeed.scenarioPulse,
});
const l4MasterySeed = computeL4Mastery({
  innerPatternScore: l3PlaySeed.innerPatternScore,
  scenarioPulse: l3PlaySeed.scenarioPulse,
  embodimentScore: l2BodySeed.embodimentScore,
  baseFrustrationTolerance: l3PlaySeed.frustrationTolerance,
});
const l4SkillClusterSeed = computeL4SkillCluster({
  innerPatternScore: l3PlaySeed.innerPatternScore,
  microMasteryScore: l4MasterySeed.microMasteryScore,
  socialPatternSense: l3SocialSeed.socialPatternSense,
  cosmicPreseed: l1CosmicPreseed.direction,
});
const l4SequenceSeed = computeL4TaskSequenceCapacity({
  focusStability: l4MasterySeed.focusStability,
  actionConsistency: l4MasterySeed.actionConsistency,
  microMasteryScore: l4MasterySeed.microMasteryScore,
});
const l4SocialTeamSeed = computeL4SocialTeam({
  l3Cooperation: l3SocialSeed.cooperation,
  l3ConflictSkill: l3SocialSeed.conflictSkill,
  microMasteryScore: l4MasterySeed.microMasteryScore,
  frustrationTolerance: l4MasterySeed.frustrationTolerance,
});
const l4CosmicApprenticeSeed = computeL4CosmicApprentice({
  preseed: l1CosmicPreseed.direction,
  microMasteryScore: l4MasterySeed.microMasteryScore,
  skillRichness: l4SkillClusterSeed.richness,
});
const l5MeaningSeed = computeL5MeaningSnapshot({
  innerPatternScore: l3PlaySeed.innerPatternScore,
  microMasteryScore: l4MasterySeed.microMasteryScore,
  frustrationTolerance: l4MasterySeed.frustrationTolerance,
});
const l5PurposeSeed = computeL5PurposeVector({
  meaningCoherence: l5MeaningSeed.meaningCoherence,
  innerWhyStrength: l5MeaningSeed.innerWhyStrength,
  selfReflectionDepth: l5MeaningSeed.selfReflectionDepth,
  sequenceCapacity: {
    maxSteps: l4SequenceSeed.maxSteps,
    reliableSteps: l4SequenceSeed.reliableSteps,
    dropoffRate: l4SequenceSeed.dropoffRate,
  },
});
const l5MoralSeed = computeL5MoralSeed({
  socialTeamSense: l4SocialTeamSeed.socialTeamSense,
  cooperation: l4SocialTeamSeed.cooperation,
  conflictNavigation: l4SocialTeamSeed.conflictNavigation,
  meaningCoherence: l5MeaningSeed.meaningCoherence,
});
const l5TrajectorySeed = computeL5TrajectorySnapshot({
  purposeHorizon: l5PurposeSeed.purposeHorizon,
  trajectoryDiscipline: l5PurposeSeed.trajectoryDiscipline,
  replanningFlexibility: l5PurposeSeed.replanningFlexibility,
  sequenceCapacity: { maxSteps: l4SequenceSeed.maxSteps, reliableSteps: l4SequenceSeed.reliableSteps },
});
const l5CosmicNavigatorSeed = computeL5CosmicNavigator({
  preseed: l1CosmicPreseed.direction,
  purposeHorizon: l5PurposeSeed.purposeHorizon,
  meaningCoherence: l5MeaningSeed.meaningCoherence,
  masteryReadiness: l4CosmicApprenticeSeed.masteryReadiness,
});
let lastL2BodySnapshot = l2BodySeed;
let lastL2SocialSnapshot = l2SocialSeed;
let lastL2CosmicSnapshot = l2CosmicSeed;
let lastL3PlaySnapshot = l3PlaySeed;
let lastL3SocialSnapshot = l3SocialSeed;
let lastL3CosmicSnapshot = l3CosmicSeed;
let lastL4MasterySnapshot = l4MasterySeed;
let lastL4SkillCluster = l4SkillClusterSeed;
let lastL4Sequence = l4SequenceSeed;
let lastL4SocialTeam = l4SocialTeamSeed;
let lastL4CosmicApprentice = l4CosmicApprenticeSeed;
let lastL5MeaningSnapshot = l5MeaningSeed;
let lastL5PurposeVector = l5PurposeSeed;
let lastL5MoralSeed = l5MoralSeed;
let lastL5TrajectorySnapshot = l5TrajectorySeed;
let lastL5CosmicNavigator = l5CosmicNavigatorSeed;
let lastAxisCoupling: AxisCouplingSnapshot;
let lastResonanceSnapshot: ResonanceSnapshot | null = null;
let lastSomaFlow: SomaFlowSnapshot | null = null;
let lastMetabolicSnapshot: MetabolicSnapshot | null = null;
let lastL10CrystalSnapshot: L10CrystalSnapshot | null = null;
let lastCrystalObserver: CrystalObserverSnapshot | null = null;
let lastOrientationSnapshot = computeOrientationSnapshot(
  {
    L_metrics: [
      l1RootSeed.presence,
      l2BodySeed.embodimentScore,
      l3PlaySeed.innerPatternScore,
      l4MasterySeed.microMasteryScore,
      l5MeaningSeed.meaningCoherence,
    ],
    S_metrics: [
      clamp(l2SocialSeed.socialAge / 40),
      l2SocialSeed.attachmentLevel,
      l4SocialTeamSeed.socialTeamSense,
    ],
    C_metrics: [
      l4CosmicApprenticeSeed.masteryReadiness,
      l5CosmicNavigatorSeed.directionClarity,
      l5CosmicNavigatorSeed.missionAlignment,
    ],
  },
  orientationConfig,
);
let lastPolaritySnapshot = computePolaritySnapshot({
  L_yinSignals: [l1RootSeed.presence, l5MeaningSeed.meaningCoherence, l5MeaningSeed.selfReflectionDepth],
  L_yangSignals: [l3PlaySeed.playfulness, l4MasterySeed.microMasteryScore],
  S_yinSignals: [l2BodySeed.stability, l2BodySeed.comfortInMotion, l2SocialSeed.attachmentLevel],
  S_yangSignals: [l2BodySeed.explorationDrive, l3SocialSeed.cooperation, l4SocialTeamSeed.socialTeamSense],
  C_yinSignals: [l5PurposeSeed.purposeHorizon, l4CosmicApprenticeSeed.masteryReadiness],
  C_yangSignals: [l5CosmicNavigatorSeed.directionClarity, l5CosmicNavigatorSeed.missionAlignment],
  });
let lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
let lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
let lastCerebellumSnapshot = runCerebellumStep(
  lastOrientationSnapshot,
  lastPolaritySnapshot,
  lastLoadProfile,
  lastFuzzyBounds,
  lastAxisCoupling,
  cerebellumConfig,
);
lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);

const buildOntogenesisNote = (existingNote?: string): string =>
  existingNote ??
  `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`;

const buildTriAxisSnapshot = (): TriAxisState => {
  const flowL = lastSomaFlow?.flows.L;
  const flowS = lastSomaFlow?.flows.S;
  const flowC = lastSomaFlow?.flows.C;

  return {
    L: {
      id: 'L',
      value: lastOrientationSnapshot.L_level,
      nourishment: flowL?.nourishment ?? 0.5,
      pressure: flowL?.pressure ?? 0.5,
    },
    S: {
      id: 'S',
      value: lastOrientationSnapshot.S_level,
      nourishment: flowS?.nourishment ?? 0.5,
      pressure: flowS?.pressure ?? 0.5,
    },
    C: {
      id: 'C',
      value: lastOrientationSnapshot.C_level,
      nourishment: flowC?.nourishment ?? 0.5,
      pressure: flowC?.pressure ?? 0.5,
    },
  };
};

const describeOntogenesisVector = (params: {
  assemblyPoint: AssemblyPointId;
  socialAge: number;
  cosmicRole: CosmicRoleKind;
  stage?: number;
  triAxis?: TriAxisState;
  metabolicSnapshot?: MetabolicSnapshot | null;
  observerSnapshot?: CrystalObserverSnapshot | null;
  crystalSnapshot?: L10CrystalSnapshot | null;
  note?: string;
}): OntogenesisVector => {
  const note = buildOntogenesisNote(params.note);
  const triAxis = params.triAxis ?? buildTriAxisSnapshot();
  const metabolicSource = params.metabolicSnapshot ?? lastMetabolicSnapshot;
  const observerSnapshot = params.observerSnapshot ?? lastCrystalObserver ?? undefined;
  const crystalSnapshot = params.crystalSnapshot ?? lastL10CrystalSnapshot ?? undefined;
  const metabolism = metabolicSource
    ? {
        stressIndex: metabolicSource.stressIndex,
        recoveryScore: metabolicSource.recoveryScore,
        overloadRisk: metabolicSource.overloadRisk,
        mode: metabolicSource.mode,
        overloadAxes: metabolicSource.overloadAxes,
        note: metabolicSource.note,
      }
    : undefined;

  const vector = ontogenesis3d.describeVector({
    assemblyPoint: params.assemblyPoint,
    socialAge: params.socialAge,
    cosmicRole: params.cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    resonanceField: lastResonanceSnapshot ?? undefined,
    orientation: lastOrientationSnapshot,
    polarity: lastPolaritySnapshot,
    fuzzyBounds: lastFuzzyBounds,
    loadProfile: lastLoadProfile,
    axisCoupling: lastAxisCoupling,
    cerebellum: lastCerebellumSnapshot,
    flow: lastSomaFlow ?? undefined,
    observer: observerSnapshot,
    crystal: crystalSnapshot,
    note,
  });

  return {
    ...vector,
    stage: params.stage ?? params.assemblyPoint,
    triAxis,
    observer: observerSnapshot,
    metabolism,
    crystal: crystalSnapshot ?? vector.crystal,
  };
};

let lastOntogenesisVector: OntogenesisVector = describeOntogenesisVector({
  assemblyPoint: 2 as AssemblyPointId,
  socialAge: l2SocialSeed.socialAge,
  cosmicRole: initialCosmicRole,
});
lastCrystalObserver = runCrystalObserver(
  [lastOntogenesisVector],
  lastPolaritySnapshot,
  lastResonanceSnapshot,
  lastSomaFlow,
  crystalObserverConfig,
);
lastOntogenesisVector = { ...lastOntogenesisVector, observer: lastCrystalObserver };
const ontogenesisTimeline: Array<OntogenesisVector & { timestamp: number }> = [
  { ...lastOntogenesisVector, timestamp: Date.now() },
];
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
  Math.max(1, Math.min(17, Math.round(value))) as AssemblyPointId;

const clampSocialAge = (value: number): number => Math.max(0, Math.min(80, Math.round(value)));

function mapPreseedToCosmicRole(preseed: CosmicPreseed): CosmicRoleKind {
  switch (preseed) {
    case 'structure':
      return 'sensor_engineer';
    case 'resonance':
      return 'ai_field_architect';
    case 'life':
      return 'bio_novelty';
    case 'movement':
      return 'interplanetary_logistics';
    case 'exploration':
    default:
      return 'new_space_researcher';
  }
}

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
  const perceptionSummary = perceptionState.summary;
  const signalClarity = clamp(
    0.5 + perceptionSummary.opportunityScore * 0.4 - perceptionSummary.threatScore * 0.3 - perceptionSummary.noiseLevel * 0.2,
  );
  lastL2BodySnapshot = computeL2BodyGrounding({
    presence: l1RootSeed.presence,
    trustLevel: l1SocialSeed.trustLevel,
    noiseLevel: perceptionSummary.noiseLevel,
    signalClarity,
  });
  lastL2SocialSnapshot = computeL2SocialSnapshot({
    trustLevel: l1SocialSeed.trustLevel,
    safetySense: l1SocialSeed.safetySense,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
  });
  lastL2CosmicSnapshot = computeCosmicExplorationStyle({
    preseed: l1CosmicPreseed.direction,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    stability: lastL2BodySnapshot.stability,
  });
  lastL3PlaySnapshot = computeL3PlayPatterning({
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    stability: lastL2BodySnapshot.stability,
  });
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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const triAxisSnapshot = buildTriAxisSnapshot();
  lastExternalSignals = aggregateExternalSignals(externalSignalsBuffer);

  const recentRecoveryIndex =
    ((lastSomaFlow?.globalNourishmentIndex ?? 0.5) + (1 - (lastSomaFlow?.globalFatigueRisk ?? 0.5))) / 2;
  const effectiveLoadIndex = Math.min(
    1,
    lastLoadProfile.globalStress + (lastExternalSignals?.externalStress ?? 0) * 0.3,
  );
  const effectiveRecentRecovery = Math.min(
    1,
    recentRecoveryIndex + (lastExternalSignals?.externalRecovery ?? 0) * 0.3,
  );
  lastMetabolicSnapshot = runL9MetabolicStep({
    triAxis: triAxisSnapshot,
    loadIndex: effectiveLoadIndex,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex: effectiveRecentRecovery,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  const baseOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: triAxisSnapshot,
    metabolicSnapshot: lastMetabolicSnapshot,
    note: lastOntogenesisVector.note,
  });

  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    baseOntogenesisVector,
  ];

  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );

  lastL10CrystalSnapshot = runL10CrystalStep({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    metabolism: {
      stressIndex: lastMetabolicSnapshot.stressIndex,
      recoveryScore: lastMetabolicSnapshot.recoveryScore,
      overloadRisk: lastMetabolicSnapshot.overloadRisk,
      mode: lastMetabolicSnapshot.mode,
    },
    observerLevel: lastCrystalObserver?.crystalStabilityIndex ?? 0.5,
  });

  const organismSnapshot = runOrganismPipeline({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    orientation: lastOrientationSnapshot,
    observer: lastCrystalObserver,
    metabolism: lastMetabolicSnapshot,
    crystal: lastL10CrystalSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex: effectiveRecentRecovery,
    externalSignals: lastExternalSignals,
  });

  lastResponseFrame = organismSnapshot.responseFrame ?? lastResponseFrame;

  lastMetabolicSnapshot = organismSnapshot.metabolism ?? lastMetabolicSnapshot;
  lastL10CrystalSnapshot = organismSnapshot.crystal ?? lastL10CrystalSnapshot;
  lastCrystalObserver = organismSnapshot.observer ?? lastCrystalObserver;

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: organismSnapshot.triAxis,
    metabolicSnapshot: organismSnapshot.metabolism,
    observerSnapshot: organismSnapshot.observer,
    crystalSnapshot: organismSnapshot.crystal,
    note: lastOntogenesisVector.note,
  });

  lastOntogenesisVector = {
    ...lastOntogenesisVector,
    metabolism: lastMetabolicSnapshot
      ? {
          stressIndex: lastMetabolicSnapshot.stressIndex,
          recoveryScore: lastMetabolicSnapshot.recoveryScore,
          overloadRisk: lastMetabolicSnapshot.overloadRisk,
          mode: lastMetabolicSnapshot.mode,
          overloadAxes: lastMetabolicSnapshot.overloadAxes,
          note: lastMetabolicSnapshot.note,
        }
      : lastOntogenesisVector.metabolism,
    L9: lastMetabolicSnapshot ?? lastOntogenesisVector.L9,
    crystal: lastL10CrystalSnapshot ?? lastOntogenesisVector.crystal,
    observer: lastCrystalObserver ?? lastOntogenesisVector.observer,
    growthMode: organismSnapshot.growthMode ?? lastOntogenesisVector.growthMode,
    responseFrame: lastResponseFrame ?? lastOntogenesisVector.responseFrame,
  };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const triAxisSnapshot = buildTriAxisSnapshot();
  lastExternalSignals = aggregateExternalSignals(externalSignalsBuffer);

  const recentRecoveryIndex =
    ((lastSomaFlow?.globalNourishmentIndex ?? 0.5) + (1 - (lastSomaFlow?.globalFatigueRisk ?? 0.5))) / 2;
  const effectiveLoadIndex = Math.min(
    1,
    lastLoadProfile.globalStress + (lastExternalSignals?.externalStress ?? 0) * 0.3,
  );
  const effectiveRecentRecovery = Math.min(
    1,
    recentRecoveryIndex + (lastExternalSignals?.externalRecovery ?? 0) * 0.3,
  );
  lastMetabolicSnapshot = runL9MetabolicStep({
    triAxis: triAxisSnapshot,
    loadIndex: effectiveLoadIndex,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex: effectiveRecentRecovery,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  const baseOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: triAxisSnapshot,
    metabolicSnapshot: lastMetabolicSnapshot,
    note: lastOntogenesisVector.note,
  });

  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    baseOntogenesisVector,
  ];

  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );

  lastL10CrystalSnapshot = runL10CrystalStep({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    metabolism: {
      stressIndex: lastMetabolicSnapshot.stressIndex,
      recoveryScore: lastMetabolicSnapshot.recoveryScore,
      overloadRisk: lastMetabolicSnapshot.overloadRisk,
      mode: lastMetabolicSnapshot.mode,
    },
    observerLevel: lastCrystalObserver?.crystalStabilityIndex ?? 0.5,
  });

  const organismSnapshot = runOrganismPipeline({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    orientation: lastOrientationSnapshot,
    observer: lastCrystalObserver,
    metabolism: lastMetabolicSnapshot,
    crystal: lastL10CrystalSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex: effectiveRecentRecovery,
    externalSignals: lastExternalSignals,
  });

  lastResponseFrame = organismSnapshot.responseFrame ?? lastResponseFrame;

  lastMetabolicSnapshot = organismSnapshot.metabolism ?? lastMetabolicSnapshot;
  lastL10CrystalSnapshot = organismSnapshot.crystal ?? lastL10CrystalSnapshot;
  lastCrystalObserver = organismSnapshot.observer ?? lastCrystalObserver;

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: organismSnapshot.triAxis,
    metabolicSnapshot: organismSnapshot.metabolism,
    observerSnapshot: organismSnapshot.observer,
    crystalSnapshot: organismSnapshot.crystal,
    note: lastOntogenesisVector.note,
  });

  lastOntogenesisVector = {
    ...lastOntogenesisVector,
    metabolism: lastMetabolicSnapshot
      ? {
          stressIndex: lastMetabolicSnapshot.stressIndex,
          recoveryScore: lastMetabolicSnapshot.recoveryScore,
          overloadRisk: lastMetabolicSnapshot.overloadRisk,
          mode: lastMetabolicSnapshot.mode,
          overloadAxes: lastMetabolicSnapshot.overloadAxes,
          note: lastMetabolicSnapshot.note,
        }
      : lastOntogenesisVector.metabolism,
    L9: lastMetabolicSnapshot ?? lastOntogenesisVector.L9,
    crystal: lastL10CrystalSnapshot ?? lastOntogenesisVector.crystal,
    observer: lastCrystalObserver ?? lastOntogenesisVector.observer,
    growthMode: organismSnapshot.growthMode ?? lastOntogenesisVector.growthMode,
    responseFrame: lastResponseFrame ?? lastOntogenesisVector.responseFrame,
  };
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
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    cosmicPreseed: l1CosmicPreseed.direction,
    note: lastOntogenesisVector.note ?? l1RootSeed.note,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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
  const socialAge = Math.max(deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan), lastL2SocialSnapshot.socialAge);
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    note: lastOntogenesisVector.note ?? l1RootSeed.note,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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
  const socialAge = Math.max(deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan), lastL2SocialSnapshot.socialAge);
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    note: lastOntogenesisVector.note ?? l1RootSeed.note,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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
  const socialAge = Math.max(deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan), lastL2SocialSnapshot.socialAge);
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    note: lastOntogenesisVector.note ?? l1RootSeed.note,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    note: lastOntogenesisVector.note ?? l1RootSeed.note,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot({
    L_metrics: [
      l1RootSeed.presence,
      lastL2BodySnapshot.embodimentScore,
      lastL3PlaySnapshot.innerPatternScore,
      lastL4MasterySnapshot.microMasteryScore,
      lastL5MeaningSnapshot.meaningCoherence,
    ],
    S_metrics: [
      clamp(lastL4SocialTeam.socialAge / 40),
      lastL2SocialSnapshot.attachmentLevel,
      lastL4SocialTeam.socialTeamSense,
    ],
    C_metrics: [
      lastL4CosmicApprentice.masteryReadiness,
      lastL5CosmicNavigator.directionClarity,
      lastL5CosmicNavigator.missionAlignment,
    ],
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    orientation: lastOrientationSnapshot,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot({
    L_metrics: [
      l1RootSeed.presence,
      lastL2BodySnapshot.embodimentScore,
      lastL3PlaySnapshot.innerPatternScore,
      lastL4MasterySnapshot.microMasteryScore,
      lastL5MeaningSnapshot.meaningCoherence,
    ],
    S_metrics: [
      clamp(lastL4SocialTeam.socialAge / 40),
      lastL2SocialSnapshot.attachmentLevel,
      lastL4SocialTeam.socialTeamSense,
    ],
    C_metrics: [
      lastL4CosmicApprentice.masteryReadiness,
      lastL5CosmicNavigator.directionClarity,
      lastL5CosmicNavigator.missionAlignment,
    ],
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    orientation: lastOrientationSnapshot,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    orientation: lastOrientationSnapshot,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    orientation: lastOrientationSnapshot,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    orientation: lastOrientationSnapshot,
    polarity: lastPolaritySnapshot,
    loadProfile: lastLoadProfile,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    orientation: lastOrientationSnapshot,
    polarity: lastPolaritySnapshot,
    loadProfile: lastLoadProfile,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    orientation: lastOrientationSnapshot,
    polarity: lastPolaritySnapshot,
    fuzzyBounds: lastFuzzyBounds,
    loadProfile: lastLoadProfile,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    DEFAULT_CEREBELLUM_CONFIG,
  );
  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    orientation: lastOrientationSnapshot,
    polarity: lastPolaritySnapshot,
    fuzzyBounds: lastFuzzyBounds,
    loadProfile: lastLoadProfile,
    cerebellum: lastCerebellumSnapshot,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    cerebellumConfig,
  );
  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    orientation: lastOrientationSnapshot,
    polarity: lastPolaritySnapshot,
    fuzzyBounds: lastFuzzyBounds,
    loadProfile: lastLoadProfile,
    cerebellum: lastCerebellumSnapshot,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );
  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    orientation: lastOrientationSnapshot,
    polarity: lastPolaritySnapshot,
    fuzzyBounds: lastFuzzyBounds,
    loadProfile: lastLoadProfile,
    axisCoupling: lastAxisCoupling,
    cerebellum: lastCerebellumSnapshot,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );
  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    orientation: lastOrientationSnapshot,
    polarity: lastPolaritySnapshot,
    fuzzyBounds: lastFuzzyBounds,
    loadProfile: lastLoadProfile,
    axisCoupling: lastAxisCoupling,
    cerebellum: lastCerebellumSnapshot,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );
lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
lastResonanceSnapshot = runResonanceStep(
  Date.now() / 1000,
  lastResonanceSnapshot,
  resonanceConfig,
  lastCerebellumSnapshot,
  lastAxisCoupling,
  (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
);
if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
  resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
}

const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    resonanceField: lastResonanceSnapshot ?? undefined,
    orientation: lastOrientationSnapshot,
    polarity: lastPolaritySnapshot,
    fuzzyBounds: lastFuzzyBounds,
    loadProfile: lastLoadProfile,
    axisCoupling: lastAxisCoupling,
    cerebellum: lastCerebellumSnapshot,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    resonanceField: lastResonanceSnapshot ?? undefined,
    orientation: lastOrientationSnapshot,
    polarity: lastPolaritySnapshot,
    fuzzyBounds: lastFuzzyBounds,
    loadProfile: lastLoadProfile,
    axisCoupling: lastAxisCoupling,
    cerebellum: lastCerebellumSnapshot,
    flow: lastSomaFlow ?? undefined,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);
  lastOntogenesisVector = ontogenesis3d.describeVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    resonance: lastFuzzyEvolutionState?.pressure.alignment,
    globalMode: lastFuzzyEvolutionState?.strings.globalMode,
    trustLevel: l1SocialSeed.trustLevel,
    presence: l1RootSeed.presence,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    stability: lastL2BodySnapshot.stability,
    explorationDrive: lastL2BodySnapshot.explorationDrive,
    comfortInMotion: lastL2BodySnapshot.comfortInMotion,
    boundarySense: lastL2SocialSnapshot.boundarySense,
    attachmentLevel: lastL2SocialSnapshot.attachmentLevel,
    curiositySocial: lastL2SocialSnapshot.curiositySocial,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    playfulness: lastL3PlaySnapshot.playfulness,
    frustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cooperation: lastL3SocialSnapshot.cooperation,
    conflictSkill: lastL3SocialSnapshot.conflictSkill,
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    roleExperimentation: lastL4SocialTeam.roleExperimentation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    moralCare: lastL5MoralSeed.moralCare,
    moralIntegrity: lastL5MoralSeed.moralIntegrity,
    moralCourage: lastL5MoralSeed.moralCourage,
    cosmicPreseed: l1CosmicPreseed.direction,
    cosmicStyle: lastL2CosmicSnapshot.style,
    cosmicStyleIntensity: lastL2CosmicSnapshot.intensity,
    cosmicPatternRole: lastL3CosmicSnapshot.role,
    cosmicPatternCoherence: lastL3CosmicSnapshot.coherence,
    skillCluster: lastL4SkillCluster.skills,
    skillClusterPrimary: lastL4SkillCluster.primarySkill,
    skillClusterRichness: lastL4SkillCluster.richness,
    taskSequence: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
    cosmicApprenticeRole: lastL4CosmicApprentice.role,
    cosmicApprenticeAlignment: lastL4CosmicApprentice.alignmentToPreseed,
    cosmicApprenticeReadiness: lastL4CosmicApprentice.masteryReadiness,
    cosmicNavigatorRole: lastL5CosmicNavigator.role,
    directionClarity: lastL5CosmicNavigator.directionClarity,
    missionAlignment: lastL5CosmicNavigator.missionAlignment,
    resonanceField: lastResonanceSnapshot ?? undefined,
    orientation: lastOrientationSnapshot,
    polarity: lastPolaritySnapshot,
    fuzzyBounds: lastFuzzyBounds,
    loadProfile: lastLoadProfile,
    axisCoupling: lastAxisCoupling,
    cerebellum: lastCerebellumSnapshot,
    flow: lastSomaFlow ?? undefined,
    trajectoryPlan: {
      stepsPlanned: lastL5TrajectorySnapshot.stepsPlanned,
      stepsKept: lastL5TrajectorySnapshot.stepsKept,
      courseStability: lastL5TrajectorySnapshot.courseStability,
    },
    note:
      lastOntogenesisVector.note ??
      `${l1RootSeed.note}; L2: тело, опора и микро-исследование среды; ${lastL3PlaySnapshot.note}; ${lastL4MasterySnapshot.note}; ${lastL5MeaningSnapshot.note}`,
  });
  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    lastOntogenesisVector,
  ];
  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );
  lastOntogenesisVector = { ...lastOntogenesisVector, crystal: lastCrystalObserver };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    note: lastOntogenesisVector.note,
  });
  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    lastOntogenesisVector,
  ];
  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );
  lastOntogenesisVector = { ...lastOntogenesisVector, crystal: lastCrystalObserver };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    note: lastOntogenesisVector.note,
  });
  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    lastOntogenesisVector,
  ];
  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );
  lastOntogenesisVector = { ...lastOntogenesisVector, crystal: lastCrystalObserver };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    note: lastOntogenesisVector.note,
  });
  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    lastOntogenesisVector,
  ];
  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );
  lastOntogenesisVector = { ...lastOntogenesisVector, crystal: lastCrystalObserver };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    note: lastOntogenesisVector.note,
  });
  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    lastOntogenesisVector,
  ];
  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );
  lastOntogenesisVector = { ...lastOntogenesisVector, crystal: lastCrystalObserver };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    note: lastOntogenesisVector.note,
  });
  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    lastOntogenesisVector,
  ];
  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );
  lastOntogenesisVector = { ...lastOntogenesisVector, crystal: lastCrystalObserver };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const triAxisSnapshot = buildTriAxisSnapshot();
  lastMetabolicSnapshot = runL9MetabolicStep({
    triAxis: triAxisSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex:
      ((lastSomaFlow?.globalNourishmentIndex ?? 0.5) + (1 - (lastSomaFlow?.globalFatigueRisk ?? 0.5))) / 2,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    note: lastOntogenesisVector.note,
  });
  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    lastOntogenesisVector,
  ];
  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );
  lastOntogenesisVector = {
    ...lastOntogenesisVector,
    crystal: lastCrystalObserver,
    L9: lastMetabolicSnapshot ?? lastOntogenesisVector.L9,
  };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const triAxisSnapshot = buildTriAxisSnapshot();
  lastMetabolicSnapshot = runL9MetabolicStep({
    triAxis: triAxisSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex:
      ((lastSomaFlow?.globalNourishmentIndex ?? 0.5) + (1 - (lastSomaFlow?.globalFatigueRisk ?? 0.5))) / 2,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    note: lastOntogenesisVector.note,
  });
  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    lastOntogenesisVector,
  ];
  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );
  lastOntogenesisVector = {
    ...lastOntogenesisVector,
    crystal: lastCrystalObserver,
    L9: lastMetabolicSnapshot ?? lastOntogenesisVector.L9,
  };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const triAxisSnapshot = buildTriAxisSnapshot();
  lastMetabolicSnapshot = runL9MetabolicStep({
    triAxis: triAxisSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex:
      ((lastSomaFlow?.globalNourishmentIndex ?? 0.5) + (1 - (lastSomaFlow?.globalFatigueRisk ?? 0.5))) / 2,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: triAxisSnapshot,
    metabolicSnapshot: lastMetabolicSnapshot,
    note: lastOntogenesisVector.note,
  });
  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    lastOntogenesisVector,
  ];
  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );
  lastOntogenesisVector = {
    ...lastOntogenesisVector,
    crystal: lastCrystalObserver,
    metabolism: lastMetabolicSnapshot
      ? {
          stressIndex: lastMetabolicSnapshot.stressIndex,
          recoveryScore: lastMetabolicSnapshot.recoveryScore,
          overloadRisk: lastMetabolicSnapshot.overloadRisk,
          mode: lastMetabolicSnapshot.mode,
          overloadAxes: lastMetabolicSnapshot.overloadAxes,
          note: lastMetabolicSnapshot.note,
        }
      : lastOntogenesisVector.metabolism,
    L9: lastMetabolicSnapshot ?? lastOntogenesisVector.L9,
  };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const triAxisSnapshot = buildTriAxisSnapshot();
  lastMetabolicSnapshot = runL9MetabolicStep({
    triAxis: triAxisSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex:
      ((lastSomaFlow?.globalNourishmentIndex ?? 0.5) + (1 - (lastSomaFlow?.globalFatigueRisk ?? 0.5))) / 2,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  const baseOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: triAxisSnapshot,
    metabolicSnapshot: lastMetabolicSnapshot,
    note: lastOntogenesisVector.note,
  });

  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    baseOntogenesisVector,
  ];

  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );

  lastL10CrystalSnapshot = runL10CrystalStep({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    metabolism: {
      stressIndex: lastMetabolicSnapshot.stressIndex,
      recoveryScore: lastMetabolicSnapshot.recoveryScore,
      overloadRisk: lastMetabolicSnapshot.overloadRisk,
      mode: lastMetabolicSnapshot.mode,
    },
    observerLevel: lastCrystalObserver?.crystalStabilityIndex ?? 0.5,
  });

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: triAxisSnapshot,
    metabolicSnapshot: lastMetabolicSnapshot,
    observerSnapshot: lastCrystalObserver,
    crystalSnapshot: lastL10CrystalSnapshot,
    note: lastOntogenesisVector.note,
  });

  lastOntogenesisVector = {
    ...lastOntogenesisVector,
    metabolism: lastMetabolicSnapshot
      ? {
          stressIndex: lastMetabolicSnapshot.stressIndex,
          recoveryScore: lastMetabolicSnapshot.recoveryScore,
          overloadRisk: lastMetabolicSnapshot.overloadRisk,
          mode: lastMetabolicSnapshot.mode,
          overloadAxes: lastMetabolicSnapshot.overloadAxes,
          note: lastMetabolicSnapshot.note,
        }
      : lastOntogenesisVector.metabolism,
    L9: lastMetabolicSnapshot ?? lastOntogenesisVector.L9,
    crystal: lastL10CrystalSnapshot ?? lastOntogenesisVector.crystal,
    observer: lastCrystalObserver ?? lastOntogenesisVector.observer,
  };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const triAxisSnapshot = buildTriAxisSnapshot();
  const recentRecoveryIndex =
    ((lastSomaFlow?.globalNourishmentIndex ?? 0.5) + (1 - (lastSomaFlow?.globalFatigueRisk ?? 0.5))) / 2;
  lastMetabolicSnapshot = runL9MetabolicStep({
    triAxis: triAxisSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  const baseOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: triAxisSnapshot,
    metabolicSnapshot: lastMetabolicSnapshot,
    note: lastOntogenesisVector.note,
  });

  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    baseOntogenesisVector,
  ];

  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );

  lastL10CrystalSnapshot = runL10CrystalStep({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    metabolism: {
      stressIndex: lastMetabolicSnapshot.stressIndex,
      recoveryScore: lastMetabolicSnapshot.recoveryScore,
      overloadRisk: lastMetabolicSnapshot.overloadRisk,
      mode: lastMetabolicSnapshot.mode,
    },
    observerLevel: lastCrystalObserver?.crystalStabilityIndex ?? 0.5,
  });

  const organismSnapshot = runOrganismPipeline({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    orientation: lastOrientationSnapshot,
    observer: lastCrystalObserver,
    metabolism: lastMetabolicSnapshot,
    crystal: lastL10CrystalSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex,
  });

  lastMetabolicSnapshot = organismSnapshot.metabolism ?? lastMetabolicSnapshot;
  lastL10CrystalSnapshot = organismSnapshot.crystal ?? lastL10CrystalSnapshot;
  lastCrystalObserver = organismSnapshot.observer ?? lastCrystalObserver;

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: organismSnapshot.triAxis,
    metabolicSnapshot: organismSnapshot.metabolism,
    observerSnapshot: organismSnapshot.observer,
    crystalSnapshot: organismSnapshot.crystal,
    note: lastOntogenesisVector.note,
  });

  lastOntogenesisVector = {
    ...lastOntogenesisVector,
    metabolism: lastMetabolicSnapshot
      ? {
          stressIndex: lastMetabolicSnapshot.stressIndex,
          recoveryScore: lastMetabolicSnapshot.recoveryScore,
          overloadRisk: lastMetabolicSnapshot.overloadRisk,
          mode: lastMetabolicSnapshot.mode,
          overloadAxes: lastMetabolicSnapshot.overloadAxes,
          note: lastMetabolicSnapshot.note,
        }
      : lastOntogenesisVector.metabolism,
    L9: lastMetabolicSnapshot ?? lastOntogenesisVector.L9,
    crystal: lastL10CrystalSnapshot ?? lastOntogenesisVector.crystal,
    observer: lastCrystalObserver ?? lastOntogenesisVector.observer,
  };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const triAxisSnapshot = buildTriAxisSnapshot();
  const recentRecoveryIndex =
    ((lastSomaFlow?.globalNourishmentIndex ?? 0.5) + (1 - (lastSomaFlow?.globalFatigueRisk ?? 0.5))) / 2;
  lastMetabolicSnapshot = runL9MetabolicStep({
    triAxis: triAxisSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  const baseOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: triAxisSnapshot,
    metabolicSnapshot: lastMetabolicSnapshot,
    note: lastOntogenesisVector.note,
  });

  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    baseOntogenesisVector,
  ];

  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );

  lastL10CrystalSnapshot = runL10CrystalStep({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    metabolism: {
      stressIndex: lastMetabolicSnapshot.stressIndex,
      recoveryScore: lastMetabolicSnapshot.recoveryScore,
      overloadRisk: lastMetabolicSnapshot.overloadRisk,
      mode: lastMetabolicSnapshot.mode,
    },
    observerLevel: lastCrystalObserver?.crystalStabilityIndex ?? 0.5,
  });

  const organismSnapshot = runOrganismPipeline({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    orientation: lastOrientationSnapshot,
    observer: lastCrystalObserver,
    metabolism: lastMetabolicSnapshot,
    crystal: lastL10CrystalSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex,
  });

  lastMetabolicSnapshot = organismSnapshot.metabolism ?? lastMetabolicSnapshot;
  lastL10CrystalSnapshot = organismSnapshot.crystal ?? lastL10CrystalSnapshot;
  lastCrystalObserver = organismSnapshot.observer ?? lastCrystalObserver;

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: organismSnapshot.triAxis,
    metabolicSnapshot: organismSnapshot.metabolism,
    observerSnapshot: organismSnapshot.observer,
    crystalSnapshot: organismSnapshot.crystal,
    note: lastOntogenesisVector.note,
  });

  lastOntogenesisVector = {
    ...lastOntogenesisVector,
    metabolism: lastMetabolicSnapshot
      ? {
          stressIndex: lastMetabolicSnapshot.stressIndex,
          recoveryScore: lastMetabolicSnapshot.recoveryScore,
          overloadRisk: lastMetabolicSnapshot.overloadRisk,
          mode: lastMetabolicSnapshot.mode,
          overloadAxes: lastMetabolicSnapshot.overloadAxes,
          note: lastMetabolicSnapshot.note,
        }
      : lastOntogenesisVector.metabolism,
    L9: lastMetabolicSnapshot ?? lastOntogenesisVector.L9,
    crystal: lastL10CrystalSnapshot ?? lastOntogenesisVector.crystal,
    observer: lastCrystalObserver ?? lastOntogenesisVector.observer,
  };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const triAxisSnapshot = buildTriAxisSnapshot();
  const recentRecoveryIndex =
    ((lastSomaFlow?.globalNourishmentIndex ?? 0.5) + (1 - (lastSomaFlow?.globalFatigueRisk ?? 0.5))) / 2;
  lastMetabolicSnapshot = runL9MetabolicStep({
    triAxis: triAxisSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  const baseOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: triAxisSnapshot,
    metabolicSnapshot: lastMetabolicSnapshot,
    note: lastOntogenesisVector.note,
  });

  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    baseOntogenesisVector,
  ];

  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );

  lastL10CrystalSnapshot = runL10CrystalStep({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    metabolism: {
      stressIndex: lastMetabolicSnapshot.stressIndex,
      recoveryScore: lastMetabolicSnapshot.recoveryScore,
      overloadRisk: lastMetabolicSnapshot.overloadRisk,
      mode: lastMetabolicSnapshot.mode,
    },
    observerLevel: lastCrystalObserver?.crystalStabilityIndex ?? 0.5,
  });

  const organismSnapshot = runOrganismPipeline({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    orientation: lastOrientationSnapshot,
    observer: lastCrystalObserver,
    metabolism: lastMetabolicSnapshot,
    crystal: lastL10CrystalSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex,
  });

  lastMetabolicSnapshot = organismSnapshot.metabolism ?? lastMetabolicSnapshot;
  lastL10CrystalSnapshot = organismSnapshot.crystal ?? lastL10CrystalSnapshot;
  lastCrystalObserver = organismSnapshot.observer ?? lastCrystalObserver;

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: organismSnapshot.triAxis,
    metabolicSnapshot: organismSnapshot.metabolism,
    observerSnapshot: organismSnapshot.observer,
    crystalSnapshot: organismSnapshot.crystal,
    note: lastOntogenesisVector.note,
  });

  lastOntogenesisVector = {
    ...lastOntogenesisVector,
    metabolism: lastMetabolicSnapshot
      ? {
          stressIndex: lastMetabolicSnapshot.stressIndex,
          recoveryScore: lastMetabolicSnapshot.recoveryScore,
          overloadRisk: lastMetabolicSnapshot.overloadRisk,
          mode: lastMetabolicSnapshot.mode,
          overloadAxes: lastMetabolicSnapshot.overloadAxes,
          note: lastMetabolicSnapshot.note,
        }
      : lastOntogenesisVector.metabolism,
    L9: lastMetabolicSnapshot ?? lastOntogenesisVector.L9,
    crystal: lastL10CrystalSnapshot ?? lastOntogenesisVector.crystal,
    observer: lastCrystalObserver ?? lastOntogenesisVector.observer,
    growthMode: organismSnapshot.growthMode ?? lastOntogenesisVector.growthMode,
  };
  ontogenesisTimeline.push({ ...lastOntogenesisVector, timestamp: Date.now() });
  if (ontogenesisTimeline.length > 256) {
    ontogenesisTimeline.splice(0, ontogenesisTimeline.length - 256);
  }

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

  lastL3SocialSnapshot = computeL3SocialSnapshot({
    l2Attachment: lastL2SocialSnapshot.attachmentLevel,
    l2CuriositySocial: lastL2SocialSnapshot.curiositySocial,
    civAlliesCount: lastCivilizationState.resonance.alliesCount,
    civOpponentsCount: lastCivilizationState.resonance.opponentsCount,
  });

  lastL3CosmicSnapshot = computeCosmicPatternWeaver({
    preseed: l1CosmicPreseed.direction,
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
  });

  lastL4MasterySnapshot = computeL4Mastery({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    scenarioPulse: lastL3PlaySnapshot.scenarioPulse,
    embodimentScore: lastL2BodySnapshot.embodimentScore,
    baseFrustrationTolerance: lastL3PlaySnapshot.frustrationTolerance,
  });

  lastL4SkillCluster = computeL4SkillCluster({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    socialPatternSense: lastL3SocialSnapshot.socialPatternSense,
    cosmicPreseed: l1CosmicPreseed.direction,
  });

  lastL4Sequence = computeL4TaskSequenceCapacity({
    focusStability: lastL4MasterySnapshot.focusStability,
    actionConsistency: lastL4MasterySnapshot.actionConsistency,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
  });

  lastL4SocialTeam = computeL4SocialTeam({
    l3Cooperation: lastL3SocialSnapshot.cooperation,
    l3ConflictSkill: lastL3SocialSnapshot.conflictSkill,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL4CosmicApprentice = computeL4CosmicApprentice({
    preseed: l1CosmicPreseed.direction,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    skillRichness: lastL4SkillCluster.richness,
  });

  lastL5MeaningSnapshot = computeL5MeaningSnapshot({
    innerPatternScore: lastL3PlaySnapshot.innerPatternScore,
    microMasteryScore: lastL4MasterySnapshot.microMasteryScore,
    frustrationTolerance: lastL4MasterySnapshot.frustrationTolerance,
  });

  lastL5PurposeVector = computeL5PurposeVector({
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    innerWhyStrength: lastL5MeaningSnapshot.innerWhyStrength,
    selfReflectionDepth: lastL5MeaningSnapshot.selfReflectionDepth,
    sequenceCapacity: {
      maxSteps: lastL4Sequence.maxSteps,
      reliableSteps: lastL4Sequence.reliableSteps,
      dropoffRate: lastL4Sequence.dropoffRate,
    },
  });

  lastL5MoralSeed = computeL5MoralSeed({
    socialTeamSense: lastL4SocialTeam.socialTeamSense,
    cooperation: lastL4SocialTeam.cooperation,
    conflictNavigation: lastL4SocialTeam.conflictNavigation,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
  });

  lastL5TrajectorySnapshot = computeL5TrajectorySnapshot({
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    trajectoryDiscipline: lastL5PurposeVector.trajectoryDiscipline,
    replanningFlexibility: lastL5PurposeVector.replanningFlexibility,
    sequenceCapacity: { maxSteps: lastL4Sequence.maxSteps, reliableSteps: lastL4Sequence.reliableSteps },
  });

  lastL5CosmicNavigator = computeL5CosmicNavigator({
    preseed: l1CosmicPreseed.direction,
    purposeHorizon: lastL5PurposeVector.purposeHorizon,
    meaningCoherence: lastL5MeaningSnapshot.meaningCoherence,
    masteryReadiness: lastL4CosmicApprentice.masteryReadiness,
  });

  lastOrientationSnapshot = computeOrientationSnapshot(
    {
      L_metrics: [
        l1RootSeed.presence,
        lastL2BodySnapshot.embodimentScore,
        lastL3PlaySnapshot.innerPatternScore,
        lastL4MasterySnapshot.microMasteryScore,
        lastL5MeaningSnapshot.meaningCoherence,
      ],
      S_metrics: [
        clamp(lastL4SocialTeam.socialAge / 40),
        lastL2SocialSnapshot.attachmentLevel,
        lastL4SocialTeam.socialTeamSense,
      ],
      C_metrics: [
        lastL4CosmicApprentice.masteryReadiness,
        lastL5CosmicNavigator.directionClarity,
        lastL5CosmicNavigator.missionAlignment,
      ],
    },
    orientationConfig,
  );

  lastPolaritySnapshot = computePolaritySnapshot({
    L_yinSignals: [l1RootSeed.presence, lastL5MeaningSnapshot.meaningCoherence, lastL5MeaningSnapshot.selfReflectionDepth],
    L_yangSignals: [lastL3PlaySnapshot.playfulness, lastL4MasterySnapshot.microMasteryScore],
    S_yinSignals: [lastL2BodySnapshot.stability, lastL2BodySnapshot.comfortInMotion, lastL2SocialSnapshot.attachmentLevel],
    S_yangSignals: [lastL2BodySnapshot.explorationDrive, lastL3SocialSnapshot.cooperation, lastL4SocialTeam.socialTeamSense],
    C_yinSignals: [lastL5PurposeVector.purposeHorizon, lastL4CosmicApprentice.masteryReadiness],
    C_yangSignals: [lastL5CosmicNavigator.directionClarity, lastL5CosmicNavigator.missionAlignment],
  });

  lastLoadProfile = computeLoadProfile(lastOrientationSnapshot, lastPolaritySnapshot);
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastCerebellumSnapshot = runCerebellumStep(
    lastOrientationSnapshot,
    lastPolaritySnapshot,
    lastLoadProfile,
    lastFuzzyBounds,
    lastAxisCoupling,
    cerebellumConfig,
  );

  lastPolaritySnapshot = lastCerebellumSnapshot.adjustedPolarity;
  lastLoadProfile = lastCerebellumSnapshot.adjustedLoadProfile;
  lastFuzzyBounds = computeFuzzyBounds(lastPolaritySnapshot, lastOrientationSnapshot);
  lastAxisCoupling = computeAxisCoupling(lastOrientationSnapshot, lastPolaritySnapshot);
  lastResonanceSnapshot = runResonanceStep(
    Date.now() / 1000,
    lastResonanceSnapshot,
    resonanceConfig,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    (config, cere, acl) => adaptResonanceConfig(config, cere, acl, RESONANCE_PRESETS),
  );
  if (resonanceConfig.autoAdapt && lastResonanceSnapshot) {
    resonanceConfig.preset = RESONANCE_PRESETS[lastResonanceSnapshot.preset] ?? resonanceConfig.preset;
  }
  lastSomaFlow = computeSomaFlow(
    lastOrientationSnapshot,
    lastLoadProfile,
    lastCerebellumSnapshot,
    lastAxisCoupling,
    lastResonanceSnapshot as ResonanceSnapshot,
    DEFAULT_FLOW_CONFIG,
  );

  const triAxisSnapshot = buildTriAxisSnapshot();
  lastExternalSignals = aggregateExternalSignals(externalSignalsBuffer);

  const recentRecoveryIndex =
    ((lastSomaFlow?.globalNourishmentIndex ?? 0.5) + (1 - (lastSomaFlow?.globalFatigueRisk ?? 0.5))) / 2;
  const effectiveLoadIndex = Math.min(
    1,
    lastLoadProfile.globalStress + (lastExternalSignals?.externalStress ?? 0) * 0.3,
  );
  const effectiveRecentRecovery = Math.min(
    1,
    recentRecoveryIndex + (lastExternalSignals?.externalRecovery ?? 0) * 0.3,
  );
  lastMetabolicSnapshot = runL9MetabolicStep({
    triAxis: triAxisSnapshot,
    loadIndex: effectiveLoadIndex,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex: effectiveRecentRecovery,
  });

  const assemblyPoint = clampAssemblyPoint(deriveAssemblyPoint(lastTuningPlan, lastFuzzyEvolutionState));
  const socialAge = Math.max(
    deriveSocialAge(lastFuzzyEvolutionState, lastTuningPlan),
    lastL2SocialSnapshot.socialAge,
    lastL3SocialSnapshot.socialAge,
    lastL4SocialTeam.socialAge,
  );
  const cosmicRole = deriveCosmicRole(lastPathwayState, originState);

  const baseOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: triAxisSnapshot,
    metabolicSnapshot: lastMetabolicSnapshot,
    note: lastOntogenesisVector.note,
  });

  const observerHistory = [
    ...ontogenesisTimeline.map(({ timestamp, ...vector }) => vector),
    baseOntogenesisVector,
  ];

  lastCrystalObserver = runCrystalObserver(
    observerHistory,
    lastPolaritySnapshot,
    lastResonanceSnapshot,
    lastSomaFlow,
    crystalObserverConfig,
  );

  lastL10CrystalSnapshot = runL10CrystalStep({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    metabolism: {
      stressIndex: lastMetabolicSnapshot.stressIndex,
      recoveryScore: lastMetabolicSnapshot.recoveryScore,
      overloadRisk: lastMetabolicSnapshot.overloadRisk,
      mode: lastMetabolicSnapshot.mode,
    },
    observerLevel: lastCrystalObserver?.crystalStabilityIndex ?? 0.5,
  });

  const organismSnapshot = runOrganismPipeline({
    triAxis: triAxisSnapshot,
    stage: assemblyPoint,
    orientation: lastOrientationSnapshot,
    observer: lastCrystalObserver,
    metabolism: lastMetabolicSnapshot,
    crystal: lastL10CrystalSnapshot,
    loadIndex: lastLoadProfile.globalStress,
    resonanceQuality: lastResonanceSnapshot?.coherenceIndex ?? 0.5,
    recentRecoveryIndex: effectiveRecentRecovery,
    externalSignals: lastExternalSignals,
  });

  lastMetabolicSnapshot = organismSnapshot.metabolism ?? lastMetabolicSnapshot;
  lastL10CrystalSnapshot = organismSnapshot.crystal ?? lastL10CrystalSnapshot;
  lastCrystalObserver = organismSnapshot.observer ?? lastCrystalObserver;

  lastOntogenesisVector = describeOntogenesisVector({
    assemblyPoint,
    socialAge,
    cosmicRole,
    stage: assemblyPoint,
    triAxis: organismSnapshot.triAxis,
    metabolicSnapshot: organismSnapshot.metabolism,
    observerSnapshot: organismSnapshot.observer,
    crystalSnapshot: organismSnapshot.crystal,
    note: lastOntogenesisVector.note,
  });

  lastOntogenesisVector = {
    ...lastOntogenesisVector,
    metabolism: lastMetabolicSnapshot
      ? {
          stressIndex: lastMetabolicSnapshot.stressIndex,
          recoveryScore: lastMetabolicSnapshot.recoveryScore,
          overloadRisk: lastMetabolicSnapshot.overloadRisk,
          mode: lastMetabolicSnapshot.mode,
          overloadAxes: lastMetabolicSnapshot.overloadAxes,
          note: lastMetabolicSnapshot.note,
        }
      : lastOntogenesisVector.metabolism,
    L9: lastMetabolicSnapshot ?? lastOntogenesisVector.L9,
    crystal: lastL10CrystalSnapshot ?? lastOntogenesisVector.crystal,
    observer: lastCrystalObserver ?? lastOntogenesisVector.observer,
    growthMode: organismSnapshot.growthMode ?? lastOntogenesisVector.growthMode,
  };
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
    : undefined, genesis: lastGenesisPlan
    ? {
        mode: lastGenesisPlan.mode,
        ready: lastGenesisPlan.ready.length,
        deferred: lastGenesisPlan.deferred.length,
        summary: lastGenesisPlan.summary,
      }
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

const registerExternalSignal = (signal: ExternalSignal): void => {
  pushExternalSignal(externalSignalsBuffer, signal);
  lastExternalSignals = aggregateExternalSignals(externalSignalsBuffer);
};

const getExternalSignalsAggregate = (): ExternalSignalsAggregate => {
  lastExternalSignals = aggregateExternalSignals(externalSignalsBuffer);
  return lastExternalSignals;
};

const registerExternalSignal = (signal: ExternalSignal): void => {
  pushExternalSignal(externalSignalsBuffer, signal);
  lastExternalSignals = aggregateExternalSignals(externalSignalsBuffer);
};

const getExternalSignalsAggregate = (): ExternalSignalsAggregate => {
  lastExternalSignals = aggregateExternalSignals(externalSignalsBuffer);
  return lastExternalSignals;
};

const getLastResponseFrame = (): ResponseFrame | undefined => lastResponseFrame;

const registerExternalSignal = (signal: ExternalSignal): void => {
  pushExternalSignal(externalSignalsBuffer, signal);
  lastExternalSignals = aggregateExternalSignals(externalSignalsBuffer);
};

const getExternalSignalsAggregate = (): ExternalSignalsAggregate => {
  lastExternalSignals = aggregateExternalSignals(externalSignalsBuffer);
  return lastExternalSignals;
};

const getLastResponseFrame = (): ResponseFrame | undefined => lastResponseFrame;

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
  registerExternalSignal,
  getExternalSignalsAggregate,
  getLastResponseFrame,
};
