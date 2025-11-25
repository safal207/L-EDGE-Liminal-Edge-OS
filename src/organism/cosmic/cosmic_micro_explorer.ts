import type { CosmicPreseed } from './cosmic_preseed';

export type CosmicExplorationStyle =
  | 'structured_micro_explorer'
  | 'resonant_micro_explorer'
  | 'life_micro_explorer'
  | 'movement_micro_explorer'
  | 'chaotic_micro_explorer';

export interface CosmicExplorationSnapshot {
  style: CosmicExplorationStyle;
  intensity: number; // 0..1
  note: string;
}

export function computeCosmicExplorationStyle(params: {
  preseed: CosmicPreseed;
  explorationDrive: number;
  stability: number;
}): CosmicExplorationSnapshot {
  const { preseed, explorationDrive, stability } = params;

  let style: CosmicExplorationStyle = 'chaotic_micro_explorer';
  const intensity = Math.min(1, Math.max(0, explorationDrive));

  switch (preseed) {
    case 'structure':
      style = 'structured_micro_explorer';
      break;
    case 'resonance':
      style = 'resonant_micro_explorer';
      break;
    case 'life':
      style = 'life_micro_explorer';
      break;
    case 'movement':
      style = 'movement_micro_explorer';
      break;
    case 'exploration':
    default:
      style = 'chaotic_micro_explorer';
      break;
  }

  const note =
    'L2: ' +
    style.replace(/_/g, ' ') +
    ', стабильность=' +
    stability.toFixed(2) +
    ', интенсивность=' +
    intensity.toFixed(2);

  return {
    style,
    intensity,
    note,
  };
}
