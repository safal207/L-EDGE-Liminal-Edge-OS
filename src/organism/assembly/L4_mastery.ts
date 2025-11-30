// L4 Mastery: early focus, completion, and micro-mastery signals

export interface L4MasterySnapshot {
  focusStability: number; // 0..1 — sustained attention on a throughline
  actionConsistency: number; // 0..1 — ability to finish actions
  microMasteryScore: number; // 0..1 — emerging competence
  frustrationTolerance: number; // 0..1 — ability to handle difficulty
  note: string;
}

export function computeL4Mastery(inputs: {
  innerPatternScore: number;
  scenarioPulse: number;
  embodimentScore: number;
  baseFrustrationTolerance: number;
}): L4MasterySnapshot {
  const { innerPatternScore, scenarioPulse, embodimentScore, baseFrustrationTolerance } = inputs;

  const focusStability = clamp01(
    0.3 * innerPatternScore + 0.3 * scenarioPulse + 0.2 * embodimentScore + 0.1,
  );

  const actionConsistency = clamp01(
    0.4 * scenarioPulse + 0.3 * innerPatternScore + 0.1 * embodimentScore + 0.1,
  );

  const microMasteryScore = clamp01(
    0.4 * focusStability + 0.4 * actionConsistency + 0.2 * innerPatternScore,
  );

  const frustrationTolerance = clamp01(0.5 * baseFrustrationTolerance + 0.3 * microMasteryScore + 0.1);

  return {
    focusStability,
    actionConsistency,
    microMasteryScore,
    frustrationTolerance,
    note: 'L4: первые устойчивые навыки, структурированный фокус и ученическое мастерство.',
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
