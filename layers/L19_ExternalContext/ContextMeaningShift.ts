import { ContextSignal } from "./ContextSignal";
import { ContextPressure } from "./ContextPressure";

export type MeaningAxis = "inner" | "outer" | "goal";

export interface ContextMeaningShift {
  deltaMeaning: number; // -1..1 (positive: expands meaning, negative: constricts)
  affectedAxis: MeaningAxis;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const inferAxis = (signal: ContextSignal): MeaningAxis => {
  if (signal.source === "user") return "inner";
  if (signal.source === "system") return "outer";
  if (signal.source === "environment" || signal.source === "network") {
    return "goal";
  }
  return "outer";
};

export const calculateMeaningShift = (
  signal: ContextSignal,
  pressure: ContextPressure
): ContextMeaningShift => {
  const axis = inferAxis(signal);
  const polarity = pressure.pressureType === "support" ? 1 : -1;

  const confidenceWeight = signal.confidence * 0.2;
  const pressureWeight = pressure.intensity * 0.6;
  const baseline = 0.05;

  const deltaMeaning = clamp(
    polarity * (baseline + confidenceWeight + pressureWeight),
    -1,
    1
  );

  return { deltaMeaning, affectedAxis: axis };
};
