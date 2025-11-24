import { FuzzyLevel, StringMode } from '../../core/fuzzyEvolution/types';
import type { CosmicPreseed } from './cosmic/cosmic_preseed';
import type { CosmicExplorationSnapshot } from './cosmic/cosmic_micro_explorer';
import type { ProtoMissionKind } from './cosmic/cosmic_trajectory';
import type { CosmicPatternRole } from './cosmic/cosmic_pattern_weaver';
import type { CosmicApprenticeRole } from './cosmic/L4_cosmic_apprentice';
import type { SkillTag } from './skills/L4_skill_cluster';
import type { ProtoRoleKind } from './role/role_dynamics';
import type { L4TaskSequenceCapacity } from './sequencing/L4_sequence';

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
  cosmicApprenticeRole?: CosmicApprenticeRole;
  cosmicApprenticeAlignment?: number;
  cosmicApprenticeReadiness?: number;
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
  socialPatternSense?: number;
  cooperation?: number;
  conflictSkill?: number;
  socialTeamSense?: number;
  roleExperimentation?: number;
  conflictNavigation?: number;
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
  { id: 5, title: 'Rules & Frames', focus: 'Policies, protocols, ethical rails.' },
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
    socialPatternSense?: number;
    cooperation?: number;
    conflictSkill?: number;
    socialTeamSense?: number;
    roleExperimentation?: number;
    conflictNavigation?: number;
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

    if (params.cosmicPatternRole) {
      summaryParts.push(`pattern role: ${params.cosmicPatternRole}`);
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

    return {
      assemblyPoint: params.assemblyPoint,
      socialAge: params.socialAge,
      cosmicRole: params.cosmicRole,
      cosmicApprenticeRole: params.cosmicApprenticeRole,
      cosmicApprenticeAlignment: params.cosmicApprenticeAlignment,
      cosmicApprenticeReadiness: params.cosmicApprenticeReadiness,
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
      socialPatternSense: params.socialPatternSense,
      cooperation: params.cooperation,
      conflictSkill: params.conflictSkill,
      socialTeamSense: params.socialTeamSense,
      roleExperimentation: params.roleExperimentation,
      conflictNavigation: params.conflictNavigation,
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
