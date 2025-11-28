// L5 Cosmic Navigator — maps preseed and L5 meaning signals into a novice navigator role.

import type { CosmicPreseed } from './cosmic_preseed';

export type CosmicNavigatorRole =
  | 'structured_navigator'
  | 'resonant_navigator'
  | 'living_navigator'
  | 'kinetic_navigator'
  | 'exploratory_navigator';

export interface L5CosmicNavigatorSnapshot {
  role: CosmicNavigatorRole;
  directionClarity: number; // 0..1 — ясность направления
  missionAlignment: number; // 0..1 — согласованность действий с выбранным вектором
  note: string;
}

export function computeL5CosmicNavigator(params: {
  preseed: CosmicPreseed; // из L1CosmicPreseed
  purposeHorizon: number; // из L5PurposeVector
  meaningCoherence: number; // из L5MeaningSnapshot
  masteryReadiness: number; // из L4CosmicApprentice
}): L5CosmicNavigatorSnapshot {
  const { preseed, purposeHorizon, meaningCoherence, masteryReadiness } = params;

  let role: CosmicNavigatorRole = 'exploratory_navigator';

  switch (preseed) {
    case 'structure':
      role = 'structured_navigator';
      break;
    case 'resonance':
      role = 'resonant_navigator';
      break;
    case 'life':
      role = 'living_navigator';
      break;
    case 'movement':
      role = 'kinetic_navigator';
      break;
    case 'exploration':
    default:
      role = 'exploratory_navigator';
      break;
  }

  const directionClarity = clamp01(
    0.4 * purposeHorizon + 0.3 * meaningCoherence + 0.2 * masteryReadiness,
  );

  const missionAlignment = clamp01(
    0.4 * meaningCoherence + 0.3 * masteryReadiness + 0.2 * purposeHorizon,
  );

  const note =
    'L5: космический младший навигатор — ' +
    role.replace(/_/g, ' ') +
    `, ясность направления≈${directionClarity.toFixed(2)}, согласованность≈${missionAlignment.toFixed(2)}.`;

  return {
    role,
    directionClarity,
    missionAlignment,
    note,
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
