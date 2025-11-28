// L4 Sequencing: capacity to hold and execute short action chains

export interface L4TaskSequenceCapacity {
  maxSteps: number;
  reliableSteps: number;
  dropoffRate: number;
  note: string;
}

export function computeL4TaskSequenceCapacity(params: {
  focusStability: number;
  actionConsistency: number;
  microMasteryScore: number;
}): L4TaskSequenceCapacity {
  const { focusStability, actionConsistency, microMasteryScore } = params;

  const base = (focusStability + actionConsistency + microMasteryScore) / 3;

  const maxSteps = Math.round(3 + 4 * base);
  const reliableSteps = Math.max(1, Math.round(maxSteps * (0.6 + 0.3 * base)));
  const dropoffRate = clamp01(1 - base);

  return {
    maxSteps,
    reliableSteps,
    dropoffRate,
    note: `L4: удерживает ${reliableSteps}/${maxSteps} шагов с dropoff≈${dropoffRate.toFixed(2)}.`,
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
