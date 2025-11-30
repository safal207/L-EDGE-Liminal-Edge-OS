import { ContextSignal } from "./ContextSignal";
import { ContextRelevance } from "./ContextRelevance";

export type PressureType = "support" | "challenge" | "neutral";

export interface ContextPressure {
  pressureType: PressureType;
  intensity: number; // can exceed 1.0 in extreme cases
  color: string;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const intensityToColor = (intensity: number): string => {
  if (intensity > 1) return "🟪";
  if (intensity >= 0.8) return "🟥";
  if (intensity >= 0.6) return "🟧";
  if (intensity >= 0.4) return "🟨";
  if (intensity >= 0.2) return "🟩";
  return "🟦";
};

export const evaluatePressure = (
  signal: ContextSignal,
  relevance: ContextRelevance
): ContextPressure => {
  const payload = signal.payload;
  const load = typeof payload.cpu_usage === "number" ? clamp01(payload.cpu_usage) : 0;

  const intensity =
    0.45 * relevance.relevance + 0.25 * load + 0.2 * signal.confidence;

  let pressureType: PressureType = "neutral";
  if (intensity > 0.6) {
    pressureType = "challenge";
  } else if (intensity < 0.25) {
    pressureType = "support";
  }

  const color = intensityToColor(intensity);

  return {
    pressureType,
    intensity,
    color,
  };
};

export const getPressureColor = intensityToColor;
