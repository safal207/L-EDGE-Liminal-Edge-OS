import { ContextSignal } from "./ContextSignal";
import { ContextRelevance } from "./ContextRelevance";

export type PressureType = "support" | "challenge" | "neutral";
export type PressureZone = "low" | "medium" | "high";

export interface ContextPressure {
  pressureType: PressureType;
  type: PressureType;
  intensity: number; // can exceed 1.0 in extreme cases
  zone: PressureZone;
  color: string;
  label: string;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export function intensityToColor(intensity: number) {
  const clamped = Math.max(0, Math.min(1, intensity));

  if (clamped < 0.33) {
    return {
      hex: "#4CAF50", // green
      name: "low" as const,
      label: "низкое давление",
    };
  }

  if (clamped < 0.66) {
    return {
      hex: "#FFC107", // yellow
      name: "medium" as const,
      label: "среднее давление",
    };
  }

  return {
    hex: "#F44336", // red
    name: "high" as const,
    label: "высокое давление",
  };
}

export function buildContextPressure(intensity: number, type: PressureType): ContextPressure {
  const color = intensityToColor(intensity);

  return {
    type,
    pressureType: type,
    intensity,
    zone: color.name,
    color: color.hex,
    label: color.label,
  };
}

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

  return buildContextPressure(intensity, pressureType);
};

export const getPressureColor = intensityToColor;
