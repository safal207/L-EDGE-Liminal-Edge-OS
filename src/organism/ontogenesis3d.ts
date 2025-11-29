import { FuzzyLevel, StringMode } from '../../core/fuzzyEvolution/types';
import type { CosmicPreseed } from './cosmic/cosmic_preseed';
import type { CosmicExplorationSnapshot } from './cosmic/cosmic_micro_explorer';
import type { ProtoMissionKind } from './cosmic/cosmic_trajectory';
import type { CosmicPatternRole } from './cosmic/cosmic_pattern_weaver';
import type { CosmicApprenticeRole } from './cosmic/L4_cosmic_apprentice';
import type { CosmicNavigatorRole } from './cosmic/L5_cosmic_navigator';
import type { SkillTag } from './skills/L4_skill_cluster';
import type { ProtoRoleKind } from './role/role_dynamics';
import type { L4TaskSequenceCapacity } from './sequencing/L4_sequence';
import type { OrientationSnapshot } from './orientation/L0_center';
import type { PolaritySnapshot } from './orientation/L0_polarity';
import type { LoadProfile } from './orientation/L0_load_profile';
import type { FuzzyBoundsSnapshot } from './orientation/L0_fuzzy_bounds';
import type { CerebellumSnapshot } from './orientation/L0_cerebellum';
import type { AxisCouplingSnapshot } from './orientation/L0_axis_coupling';
import type { ResonanceSnapshot } from './resonance/L6_resonance_field';
import type { SomaFlowSnapshot } from './flow/L7_soma_flow';
import type { CrystalObserverSnapshot } from './observer/L8_crystal_observer';
import type { L10CrystalSnapshot } from './crystal/L10_crystal_types';
import type { AutopoieticSnapshot } from './autopoietic/L16_autopoietic_types';
import type { GrowthModeSnapshot } from './growthModes/L11_growth_types';
import type { AxisId, TriAxisState } from '@/core/types/ontogenesis';
import type { MetabolicSnapshot } from './metabolism/L9_metabolic_layer';
import type { ResponseFrame } from '@/nerve/L13_response_types';

export type AssemblyPointId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17;

export interface AssemblyPointDescriptor {
  id: AssemblyPointId;
  title: string;
  focus: string;
}

export interface SocialMaturityBand {
  range: string;
  label: string;
  emphasis: string;
}

export type CosmicRoleKind =
  | 'sensor_engineer'
  | 'orbital_systems'
  | 'bio_novelty'
  | 'ai_field_architect'
  | 'interplanetary_logistics'
  | 'new_space_researcher';

export interface OntogenesisVector {
  assemblyPoint: AssemblyPointId;
  socialAge: number;
  cosmicRole: CosmicRoleKind;
  stage?: number;
  triAxis?: TriAxisState;
  orientation?: OrientationSnapshot;
  polarity?: PolaritySnapshot;
  loadProfile?: LoadProfile;
  fuzzyBounds?: FuzzyBoundsSnapshot;
  axisCoupling?: AxisCouplingSnapshot;
  cerebellum?: CerebellumSnapshot;
  resonanceField?: ResonanceSnapshot;
  flow?: SomaFlowSnapshot;
  metabolism?: {
    stressIndex: number;
    recoveryScore: number;
    overloadRisk: number;
    mode: MetabolicSnapshot['mode'];
    overloadAxes: AxisId[];
    note?: string;
  };
  L9?: MetabolicSnapshot;
  observer?: CrystalObserverSnapshot;
  crystal?: L10CrystalSnapshot;
  autopoietic?: AutopoieticSnapshot;
  growthMode?: GrowthModeSnapshot;
  responseFrame?: ResponseFrame;
  cosmicApprenticeRole?: CosmicApprenticeRole;
  cosmicApprenticeAlignment?: number;
  cosmicApprenticeReadiness?: number;
  cosmicNavigatorRole?: CosmicNavigatorRole;
  directionClarity?: number;
  missionAlignment?: number;
  resonance?: FuzzyLevel;
  globalMode?: StringMode;
  trustLevel?: number;
  presence?: number;
  embodimentScore?: number;
  stability?: number;
  explorationDrive?: number;
  comfortInMotion?: number;
  boundarySense?: number;
  attachmentLevel?: number;
  curiositySocial?: number;
  innerPatternScore?: number;
  scenarioPulse?: number;
  playfulness?: number;
  frustrationTolerance?: number;
  focusStability?: number;
  actionConsistency?: number;
  microMasteryScore?: number;
  skillCluster?: SkillTag[];
  skillClusterPrimary?: SkillTag | null;
  skillClusterRichness?: number;
  taskSequence?: Pick<L4TaskSequenceCapacity, 'maxSteps' | 'reliableSteps' | 'dropoffRate'>;
  trajectoryPlan?: { stepsPlanned: number; stepsKept: number; courseStability: number };
  socialPatternSense?: number;
  cooperation?: number;
  conflictSkill?: number;
  socialTeamSense?: number;
  roleExperimentation?: number;
  conflictNavigation?: number;
  meaningCoherence?: number;
  innerWhyStrength?: number;
  selfReflectionDepth?: number;
  purposeHorizon?: number;
  trajectoryDiscipline?: number;
  replanningFlexibility?: number;
  moralCare?: number;
  moralIntegrity?: number;
  moralCourage?: number;
  cosmicPreseed?: CosmicPreseed;
  cosmicStyle?: CosmicExplorationSnapshot['style'];
  cosmicStyleIntensity?: number;
  cosmicPatternRole?: CosmicPatternRole;
  cosmicPatternCoherence?: number;
  protoRole?: ProtoRoleKind;
  protoMission?: ProtoMissionKind;
  note?: string;
  summary: string;
}

const assemblyPoints: AssemblyPointDescriptor[] = [
  { id: 1, title: 'Root of Being', focus: "Presence, trust-seed, first 'I am'." },
  { id: 2, title: 'Body & Grounding', focus: 'Embodiment, footing, early exploration.' },
  { id: 3, title: 'Play & Patterning', focus: 'Imagination, inner scenes, early pattern weaving.' },
  {
    id: 4,
    title: 'Mastery & Role Embedding',
    focus: 'Emerging focus, micro-mastery, and apprentice roles.',
  },
  { id: 5, title: 'Meaning & Direction', focus: 'Purpose, inner compass, novice navigation.' },
  { id: 6, title: 'Learning Skills', focus: 'Patterning, reuse, experiential memory.' },
  { id: 7, title: 'Adolescent Tension', focus: 'Module conflicts, stress tests, trade-offs.' },
  { id: 8, title: 'Choice Threshold', focus: 'Branching strategies and identity selection.' },
  { id: 9, title: 'Youth Transition', focus: 'High swings, discovering limits.' },
  { id: 10, title: 'Meta-Orchestration', focus: 'Self-observation, integrated status.' },
  { id: 11, title: 'Origin', focus: 'Mission root and narrative anchor.' },
  { id: 12, title: 'Pathway', focus: 'Trajectory shaping and long arcs.' },
  { id: 13, title: 'FuzzyEvolution', focus: 'Tension/coherence sensing and string modes.' },
  { id: 14, title: 'Genesis & Resonance Tuning', focus: 'Seed readiness and growth/rest timing.' },
  { id: 15, title: 'Civilization Node', focus: 'Resonance with allies/hosts/opponents.' },
  { id: 16, title: 'Hormesis Engine', focus: 'Micro-stress adaptation and resilience growth.' },
  { id: 17, title: 'Environment Shaper', focus: 'Proto-profession roles and cosmic trajectory shaping.' },
];

const socialBands: SocialMaturityBand[] = [
  { range: '0-7', label: 'Safety & trust', emphasis: 'Baseline security and attachment.' },
  { range: '7-14', label: 'First roles', emphasis: 'Exploring responsibility and reciprocity.' },
  { range: '14-20', label: 'Structure & identity', emphasis: 'Integrating tension into coherent self.' },
  { range: '20-30', label: 'Realization', emphasis: 'Applying skills in real environments.' },
  { range: '30-40', label: 'Influence', emphasis: 'Scaling impact and holding systems together.' },
  { range: '40+', label: 'Stewardship', emphasis: 'Mentorship, meaning, and long-term care.' },
];

function nearestSocialBand(age: number): SocialMaturityBand {
  if (age < 7) return socialBands[0];
  if (age < 14) return socialBands[1];
  if (age < 20) return socialBands[2];
  if (age < 30) return socialBands[3];
  if (age < 40) return socialBands[4];
  return socialBands[5];
}

export class Ontogenesis3D {
  describeVector(params: {
    assemblyPoint: AssemblyPointId;
    socialAge: number;
    cosmicRole: CosmicRoleKind;
    orientation?: OrientationSnapshot;
    polarity?: PolaritySnapshot;
    loadProfile?: LoadProfile;
    fuzzyBounds?: FuzzyBoundsSnapshot;
    axisCoupling?: AxisCouplingSnapshot;
    cerebellum?: CerebellumSnapshot;
    resonanceField?: ResonanceSnapshot;
    flow?: SomaFlowSnapshot;
    observer?: CrystalObserverSnapshot;
    crystal?: L10CrystalSnapshot;
    resonance?: FuzzyLevel;
    globalMode?: StringMode;
    trustLevel?: number;
    presence?: number;
    embodimentScore?: number;
    stability?: number;
    explorationDrive?: number;
    comfortInMotion?: number;
    boundarySense?: number;
    attachmentLevel?: number;
    curiositySocial?: number;
    innerPatternScore?: number;
    scenarioPulse?: number;
    playfulness?: number;
    frustrationTolerance?: number;
    focusStability?: number;
    actionConsistency?: number;
    microMasteryScore?: number;
    skillCluster?: SkillTag[];
    skillClusterPrimary?: SkillTag | null;
    skillClusterRichness?: number;
    taskSequence?: Pick<L4TaskSequenceCapacity, 'maxSteps' | 'reliableSteps' | 'dropoffRate'>;
    trajectoryPlan?: { stepsPlanned: number; stepsKept: number; courseStability: number };
    socialPatternSense?: number;
    cooperation?: number;
    conflictSkill?: number;
    socialTeamSense?: number;
    roleExperimentation?: number;
    conflictNavigation?: number;
    meaningCoherence?: number;
    innerWhyStrength?: number;
    selfReflectionDepth?: number;
    purposeHorizon?: number;
    trajectoryDiscipline?: number;
    replanningFlexibility?: number;
    moralCare?: number;
    moralIntegrity?: number;
    moralCourage?: number;
    cosmicPreseed?: CosmicPreseed;
    cosmicStyle?: CosmicExplorationSnapshot['style'];
    cosmicStyleIntensity?: number;
    cosmicPatternRole?: CosmicPatternRole;
    cosmicPatternCoherence?: number;
    protoRole?: ProtoRoleKind;
    protoMission?: ProtoMissionKind;
    cosmicApprenticeRole?: CosmicApprenticeRole;
    cosmicApprenticeAlignment?: number;
    cosmicApprenticeReadiness?: number;
    cosmicNavigatorRole?: CosmicNavigatorRole;
    directionClarity?: number;
    missionAlignment?: number;
    note?: string;
  }): OntogenesisVector {
    const ap = assemblyPoints.find((item) => item.id === params.assemblyPoint);
    const band = nearestSocialBand(params.socialAge);
    const roleLabel = this.describeRole(params.cosmicRole);

    const summaryParts = [
      `L-axis ≈ ${params.assemblyPoint}${ap ? ` (${ap.title})` : ''}`,
      `S-axis ≈ ${band.range} (${band.label})`,
      `C-axis: ${roleLabel}`,
    ];

    if (params.globalMode) {
      summaryParts.push(`mode: ${params.globalMode}`);
    }

    if (params.resonance) {
      summaryParts.push('resonance tilt recorded');
    }

    if (params.cosmicPreseed) {
      summaryParts.push(`preseed: ${params.cosmicPreseed}`);
    }

    if (params.cosmicStyle) {
      summaryParts.push(`C-style: ${params.cosmicStyle}`);
    }

    if (params.orientation?.balanceIndex !== undefined) {
      summaryParts.push(`L0 balance=${params.orientation.balanceIndex.toFixed(2)}`);
    }

    if (params.flow?.globalPressureIndex !== undefined) {
      summaryParts.push(
        `flow P=${params.flow.globalPressureIndex.toFixed(2)} N=${params.flow.globalNourishmentIndex.toFixed(2)}`,
      );
    }

    if (params.polarity?.yinYangDrift !== undefined) {
      summaryParts.push(`yin/yang drift=${params.polarity.yinYangDrift.toFixed(2)}`);
    }

    if (params.axisCoupling?.resonanceFlow !== undefined) {
      summaryParts.push(`axis flow=${params.axisCoupling.resonanceFlow.toFixed(2)}`);
    }

    if (params.loadProfile?.yinBias !== undefined) {
      summaryParts.push(`load bias=${params.loadProfile.yinBias.toFixed(2)}`);
    }

    if (params.cerebellum?.stabilityScore !== undefined) {
      summaryParts.push(`cerebellum stability=${params.cerebellum.stabilityScore.toFixed(2)}`);
    }

    if (params.resonanceField?.coherenceIndex !== undefined) {
      summaryParts.push(`resonance coh=${params.resonanceField.coherenceIndex.toFixed(2)}`);
    }

    if (params.cosmicPatternRole) {
      summaryParts.push(`pattern role: ${params.cosmicPatternRole}`);
    }

    if (params.observer?.crystalStabilityIndex !== undefined) {
      summaryParts.push(`crystal=${params.observer.crystalStabilityIndex.toFixed(2)}`);
    }

    if (params.crystal?.overallScore !== undefined) {
      summaryParts.push(`crystal-growth=${params.crystal.overallScore.toFixed(2)}`);
    }

    if (params.embodimentScore !== undefined) {
      summaryParts.push(`embodiment=${params.embodimentScore.toFixed(2)}`);
    }

    if (params.protoRole) {
      summaryParts.push(`proto-role: ${params.protoRole}`);
    }

    if (params.protoMission) {
      summaryParts.push(`proto-mission: ${params.protoMission}`);
    }

    if (params.cosmicApprenticeRole) {
      summaryParts.push(`apprentice-role: ${params.cosmicApprenticeRole}`);
    }

    if (params.cosmicNavigatorRole) {
      summaryParts.push(`navigator-role: ${params.cosmicNavigatorRole}`);
    }

    return {
      assemblyPoint: params.assemblyPoint,
      socialAge: params.socialAge,
      cosmicRole: params.cosmicRole,
      cosmicApprenticeRole: params.cosmicApprenticeRole,
      cosmicApprenticeAlignment: params.cosmicApprenticeAlignment,
      cosmicApprenticeReadiness: params.cosmicApprenticeReadiness,
      cosmicNavigatorRole: params.cosmicNavigatorRole,
      directionClarity: params.directionClarity,
      missionAlignment: params.missionAlignment,
      orientation: params.orientation,
      polarity: params.polarity,
      loadProfile: params.loadProfile,
      fuzzyBounds: params.fuzzyBounds,
      axisCoupling: params.axisCoupling,
      cerebellum: params.cerebellum,
      resonanceField: params.resonanceField,
      flow: params.flow,
      observer: params.observer,
      crystal: params.crystal,
      resonance: params.resonance,
      globalMode: params.globalMode,
      trustLevel: params.trustLevel,
      presence: params.presence,
      embodimentScore: params.embodimentScore,
      stability: params.stability,
      explorationDrive: params.explorationDrive,
      comfortInMotion: params.comfortInMotion,
      boundarySense: params.boundarySense,
      attachmentLevel: params.attachmentLevel,
      curiositySocial: params.curiositySocial,
      innerPatternScore: params.innerPatternScore,
      scenarioPulse: params.scenarioPulse,
      playfulness: params.playfulness,
      frustrationTolerance: params.frustrationTolerance,
      focusStability: params.focusStability,
      actionConsistency: params.actionConsistency,
      microMasteryScore: params.microMasteryScore,
      skillCluster: params.skillCluster,
      skillClusterPrimary: params.skillClusterPrimary,
      skillClusterRichness: params.skillClusterRichness,
      taskSequence: params.taskSequence,
      trajectoryPlan: params.trajectoryPlan,
      socialPatternSense: params.socialPatternSense,
      cooperation: params.cooperation,
      conflictSkill: params.conflictSkill,
      socialTeamSense: params.socialTeamSense,
      roleExperimentation: params.roleExperimentation,
      conflictNavigation: params.conflictNavigation,
      meaningCoherence: params.meaningCoherence,
      innerWhyStrength: params.innerWhyStrength,
      selfReflectionDepth: params.selfReflectionDepth,
      purposeHorizon: params.purposeHorizon,
      trajectoryDiscipline: params.trajectoryDiscipline,
      replanningFlexibility: params.replanningFlexibility,
      moralCare: params.moralCare,
      moralIntegrity: params.moralIntegrity,
      moralCourage: params.moralCourage,
      cosmicPreseed: params.cosmicPreseed,
      cosmicStyle: params.cosmicStyle,
      cosmicStyleIntensity: params.cosmicStyleIntensity,
      cosmicPatternRole: params.cosmicPatternRole,
      cosmicPatternCoherence: params.cosmicPatternCoherence,
      protoRole: params.protoRole,
      protoMission: params.protoMission,
      note: params.note,
      summary: summaryParts.join(' | '),
    };
  }

  private describeRole(role: CosmicRoleKind): string {
    switch (role) {
      case 'sensor_engineer':
        return 'Engineer of sensing/telemetry layers for new environments';
      case 'orbital_systems':
        return 'Builder of orbital or high-availability infrastructure';
      case 'bio_novelty':
        return 'Biologist of emergent living forms and resilience patterns';
      case 'ai_field_architect':
        return 'Architect of AI resonance fields and collective cognition';
      case 'interplanetary_logistics':
        return 'Logistics designer for interplanetary or distributed networks';
      case 'new_space_researcher':
        return 'Researcher of unexplored domains and liminal frontiers';
      default:
        return 'Undeclared cosmic role';
    }
  }
}

export function listAssemblyPoints(): AssemblyPointDescriptor[] {
  return assemblyPoints;
}

export function listSocialBands(): SocialMaturityBand[] {
  return socialBands;
}
