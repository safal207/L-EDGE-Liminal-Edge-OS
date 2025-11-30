import { ContextSignal } from "./ContextSignal";
import { ContextPressure } from "./ContextPressure";

export type PhaseShiftDirection =
  | "towards_solid"
  | "towards_liquid"
  | "towards_vapor";

export interface ContextPhaseImpact {
  phaseShift: PhaseShiftDirection;
  impactStrength: number; // 0..1
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const choosePhaseShift = (
  signal: ContextSignal,
  pressure: ContextPressure
): PhaseShiftDirection => {
  if (pressure.pressureType === "support" && pressure.intensity < 0.3) {
    return "towards_vapor";
  }

  if (pressure.pressureType === "challenge" && pressure.intensity > 0.75) {
    return "towards_solid";
  }

  if (signal.type === "change") {
    return "towards_liquid";
  }

  return "towards_liquid";
};

export const evaluatePhaseImpact = (
  signal: ContextSignal,
  pressure: ContextPressure
): ContextPhaseImpact => {
  const phaseShift = choosePhaseShift(signal, pressure);
  const impactStrength = clamp01(
    pressure.intensity * 0.7 + signal.confidence * 0.2
  );

  return { phaseShift, impactStrength };
};
