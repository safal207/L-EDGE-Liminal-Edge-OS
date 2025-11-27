// L5 Meaning Engine — computes early meaning signals for the ontogenesis loop.

export interface L5MeaningSnapshot {
  meaningCoherence: number; // 0..1 — связность смысловой картины
  innerWhyStrength: number; // 0..1 — сила внутреннего "зачем"
  selfReflectionDepth: number; // 0..1 — глубина саморефлексии
  note: string;
}

export function computeL5MeaningSnapshot(params: {
  innerPatternScore: number; // из L3
  microMasteryScore: number; // из L4
  frustrationTolerance: number; // из L4
}): L5MeaningSnapshot {
  const { innerPatternScore, microMasteryScore, frustrationTolerance } = params;

  const meaningCoherence = clamp01(0.4 * innerPatternScore + 0.3 * microMasteryScore + 0.1);
  const innerWhyStrength = clamp01(
    0.3 * microMasteryScore + 0.3 * frustrationTolerance + 0.2 * innerPatternScore,
  );
  const selfReflectionDepth = clamp01(
    0.3 * meaningCoherence + 0.3 * innerWhyStrength + 0.2 * frustrationTolerance,
  );

  return {
    meaningCoherence,
    innerWhyStrength,
    selfReflectionDepth,
    note: "L5: первые устойчивые смыслы и внутренний 'зачем'.",
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
