// L4 Cosmic Apprentice: soft alignment of early mastery with cosmic preseed

import type { CosmicPreseed } from './cosmic_preseed';

export type CosmicApprenticeRole =
  | 'structured_apprentice'
  | 'resonant_apprentice'
  | 'living_apprentice'
  | 'kinetic_apprentice'
  | 'exploratory_apprentice';

export interface L4CosmicApprenticeSnapshot {
  role: CosmicApprenticeRole;
  alignmentToPreseed: number; // 0..1
  masteryReadiness: number; // 0..1
  note: string;
}

export function computeL4CosmicApprentice(params: {
  preseed: CosmicPreseed;
  microMasteryScore: number;
  skillRichness: number;
}): L4CosmicApprenticeSnapshot {
  const { preseed, microMasteryScore, skillRichness } = params;

  let role: CosmicApprenticeRole = 'exploratory_apprentice';

  switch (preseed) {
    case 'structure':
      role = 'structured_apprentice';
      break;
    case 'resonance':
      role = 'resonant_apprentice';
      break;
    case 'life':
      role = 'living_apprentice';
      break;
    case 'movement':
      role = 'kinetic_apprentice';
      break;
    case 'exploration':
      role = 'exploratory_apprentice';
      break;
  }

  const alignmentToPreseed = clamp01(0.6 + 0.3 * microMasteryScore);
  const masteryReadiness = clamp01(0.4 * microMasteryScore + 0.4 * skillRichness + 0.1);

  const note =
    'L4: космический ученик — ' +
    role.replace(/_/g, ' ') +
    `, готовность к мастерству≈${masteryReadiness.toFixed(2)}.`;

  return {
    role,
    alignmentToPreseed,
    masteryReadiness,
    note,
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
