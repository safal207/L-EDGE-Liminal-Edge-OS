export type CosmicPreseed = 'structure' | 'resonance' | 'life' | 'movement' | 'exploration';

export interface CosmicPreseedSnapshot {
  direction: CosmicPreseed;
  confidence: number;
  note: string;
}

export function computeCosmicPreseed(seeds: {
  sensitivity: number;
  presence: number;
  signalBias?: number;
}): CosmicPreseedSnapshot {
  const { sensitivity, presence, signalBias = 0.5 } = seeds;

  const base = (sensitivity + presence) / 2;

  let direction: CosmicPreseed = 'exploration';
  let note = '';

  if (signalBias < 0.2) {
    direction = 'structure';
    note = 'предчувствие структуры и порядка';
  } else if (signalBias < 0.35) {
    direction = 'life';
    note = 'тянется к живому и органическому';
  } else if (signalBias < 0.5) {
    direction = 'resonance';
    note = 'повышенная чувствительность к полям';
  } else if (signalBias < 0.75) {
    direction = 'movement';
    note = 'ориентация на траектории и динамику';
  } else {
    direction = 'exploration';
    note = 'тяга к новому пространству';
  }

  return {
    direction,
    confidence: base,
    note,
  };
}
