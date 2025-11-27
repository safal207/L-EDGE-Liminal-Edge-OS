// src/organism/cosmic/cosmic_pattern_weaver.ts

import type { CosmicPreseed } from './cosmic_preseed';

export type CosmicPatternRole =
  | 'structured_pattern_weaver'
  | 'resonant_pattern_weaver'
  | 'living_pattern_weaver'
  | 'kinetic_pattern_weaver'
  | 'chaotic_pattern_weaver';

export interface CosmicPatternSnapshot {
  role: CosmicPatternRole;
  coherence: number; // 0..1 — насколько узоры согласованы
  note: string;
}

export function computeCosmicPatternWeaver(params: {
  preseed: CosmicPreseed;
  innerPatternScore: number;
  scenarioPulse: number;
}): CosmicPatternSnapshot {
  const { preseed, innerPatternScore, scenarioPulse } = params;

  let role: CosmicPatternRole = 'chaotic_pattern_weaver';

  switch (preseed) {
    case 'structure':
      role = 'structured_pattern_weaver';
      break;
    case 'resonance':
      role = 'resonant_pattern_weaver';
      break;
    case 'life':
      role = 'living_pattern_weaver';
      break;
    case 'movement':
      role = 'kinetic_pattern_weaver';
      break;
    case 'exploration':
    default:
      role = 'chaotic_pattern_weaver';
      break;
  }

  const coherence = Math.min(1, 0.5 * innerPatternScore + 0.4 * scenarioPulse);

  const note = `L3: ${role.replace(/_/g, ' ')} — узоры опыта становятся устойчивыми и осмысленными.`;

  return {
    role,
    coherence,
    note,
  };
}
