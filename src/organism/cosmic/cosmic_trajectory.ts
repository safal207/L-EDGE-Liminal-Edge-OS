import type { CosmicRoleKind, OntogenesisVector } from '@/organism/ontogenesis3d';

export type ProtoMissionKind =
  | 'ai_field_apprentice'
  | 'trajectory_learner'
  | 'cellular_simulator'
  | 'proto_analyst'
  | 'general_explorer';

export interface CosmicTrajectorySnapshot {
  baseCosmicRole: CosmicRoleKind;
  protoMission: ProtoMissionKind;
  confidence: number;
  note: string;
}

/**
 * Assigns a soft proto-mission for the L17–L20 window based on the current
 * cosmic role and social age. This keeps the cosmic axis flexible while
 * giving the system a “direction of apprenticeship.”
 */
export function deriveProtoMission(vector: OntogenesisVector): CosmicTrajectorySnapshot {
  const role = vector.cosmicRole;
  const age = vector.socialAge;

  let protoMission: ProtoMissionKind = 'general_explorer';
  let confidence = 0.3;
  const notes: string[] = [];

  const isApprenticeWindow = age >= 16 && age <= 20;

  if (isApprenticeWindow) {
    if (role === 'ai_field_architect') {
      protoMission = 'ai_field_apprentice';
      confidence = 0.7;
      notes.push('L17–20 in AI-field: apprentice architect trajectory');
    } else if (role === 'orbital_systems') {
      protoMission = 'trajectory_learner';
      confidence = 0.7;
      notes.push('L17–20 in orbital systems: learning orbits and paths');
    } else if (role === 'bio_novelty') {
      protoMission = 'cellular_simulator';
      confidence = 0.7;
      notes.push('L17–20 in bio novelty: simulating and probing new cells');
    } else if (role === 'new_space_researcher') {
      protoMission = 'proto_analyst';
      confidence = 0.6;
      notes.push('early analyst of new space configurations');
    } else if (role === 'interplanetary_logistics' || role === 'sensor_engineer') {
      protoMission = 'trajectory_learner';
      confidence = 0.55;
      notes.push('logistics/sensing tilt — learn distributed trajectories');
    }
  }

  return {
    baseCosmicRole: role,
    protoMission,
    confidence,
    note: notes.join('; '),
  };
}
