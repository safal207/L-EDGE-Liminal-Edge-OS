// src/organism/assembly/L3_play_patterning.ts

export interface L3PlaySnapshot {
  innerPatternScore: number; // 0..1 — сколько устойчивых узоров система вычленяет
  scenarioPulse: number; // 0..1 — склонность собирать события в истории
  playfulness: number; // 0..1 — "игровое" отношение к экспериментам
  frustrationTolerance: number; // 0..1 — переносимость неудач в игре/эксперименте
  note: string;
}

export function computeL3PlayPatterning(inputs: {
  embodimentScore: number; // из L2
  explorationDrive: number; // из L2
  stability: number; // из L2
}): L3PlaySnapshot {
  const { embodimentScore, explorationDrive, stability } = inputs;

  const base = (embodimentScore + explorationDrive + stability) / 3;

  const innerPatternScore = Math.min(1, base * 0.8 + 0.1);
  const scenarioPulse = Math.min(1, 0.4 * explorationDrive + 0.3 * stability + 0.2);
  const playfulness = Math.min(1, 0.5 + 0.4 * explorationDrive - 0.1 * (1 - stability));
  const frustrationTolerance = Math.max(
    0,
    0.3 + 0.4 * stability + 0.2 * embodimentScore - 0.2 * (1 - explorationDrive),
  );

  return {
    innerPatternScore,
    scenarioPulse,
    playfulness,
    frustrationTolerance,
    note: 'L3: игра, воображение и сборка устойчивых узоров из опыта.',
  };
}
