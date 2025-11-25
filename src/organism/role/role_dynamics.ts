import type { CivilizationState } from '../../../core/civilization/types';
import type { OntogenesisVector } from '../ontogenesis3d';

export type ProtoRoleKind =
  | 'apprentice_engineer'
  | 'junior_resonance_navigator'
  | 'observer_researcher'
  | 'integration_helper'
  | 'unspecified_proto_role';

export interface RoleDynamicsContext {
  vector: OntogenesisVector;
  civilization: CivilizationState | null;
}

export interface RoleDynamicsSnapshot {
  protoRole: ProtoRoleKind;
  confidence: number;
  note: string;
}

export function deriveProtoRole(ctx: RoleDynamicsContext): RoleDynamicsSnapshot {
  const { vector, civilization } = ctx;
  const age = vector.socialAge;
  const mode = vector.globalMode ?? 'ground';

  const allies = civilization?.resonance.alliesCount ?? 0;
  const opponents = civilization?.resonance.opponentsCount ?? 0;
  const neutral = civilization?.resonance.neutralCount ?? 0;
  const notes: string[] = [];

  let protoRole: ProtoRoleKind = 'unspecified_proto_role';
  let confidence = 0.2;

  const isMidLateTeen = age >= 16 && age <= 19;

  if (isMidLateTeen) {
    if (mode === 'resonant' && allies > 0 && opponents === 0) {
      protoRole = 'junior_resonance_navigator';
      confidence = 0.7;
      notes.push('resonant field with allies, tension low');
    } else if (mode === 'ground') {
      protoRole = 'apprentice_engineer';
      confidence = 0.6;
      notes.push('grounded mode supports early engineering craft');
    } else if (mode === 'damped') {
      protoRole = 'integration_helper';
      confidence = 0.55;
      notes.push('damped mode favors integration and support tasks');
    } else if (mode === 'chaotic') {
      protoRole = 'observer_researcher';
      confidence = 0.55;
      notes.push('chaotic mode invites observation and pattern logging');
    }
  }

  if (neutral > 2 && protoRole === 'unspecified_proto_role') {
    notes.push('neutral field — stay observant until alignment improves');
  }

  return {
    protoRole,
    confidence,
    note: notes.join('; '),
  };
}
