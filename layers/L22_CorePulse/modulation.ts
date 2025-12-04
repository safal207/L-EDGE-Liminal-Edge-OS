import {
  type CorePulseDrift,
  type PulseModulationInput,
  type PulseModulationState,
} from "./types";

const DRIFT_BASE_ADJUST: Record<CorePulseDrift, number> = {
  rising: 0.1,
  stable: 0,
  falling: -0.1,
  irregular: -0.15,
};

const MODULATION_CLAMP_MIN = 0;
const MODULATION_CLAMP_MAX = 1;
const PHASE_CLAMP_MIN = -1;
const PHASE_CLAMP_MAX = 1;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computePulseModulation(
  drift: CorePulseDrift,
  input: PulseModulationInput,
): PulseModulationState {
  const tension = input.senseTension ?? 0;
  const uplift = input.senseUplift ?? 0;
  const luck = input.luckResonance ?? 0;
  const breathing = input.breathingCoherence ?? 0;
  const foresight = input.foresightPhase ?? 0;

  const baseline = 0.5 + (DRIFT_BASE_ADJUST[drift] ?? 0);
  let modulationLevel = baseline;

  modulationLevel += uplift * 0.25;
  modulationLevel -= tension * 0.25;
  modulationLevel += luck * 0.15;
  modulationLevel += breathing * 0.05;

  modulationLevel = clamp(modulationLevel, MODULATION_CLAMP_MIN, MODULATION_CLAMP_MAX);

  const phaseCoefficient = clamp(luck * 0.4 + foresight * 0.4 - tension * 0.3, PHASE_CLAMP_MIN, PHASE_CLAMP_MAX);

  const stabilized = breathing >= 0.5 && drift !== "irregular" && modulationLevel <= 0.95;

  let recommendedRhythm: PulseModulationState["recommendedRhythm"] = "neutral";
  if (modulationLevel < 0.3) {
    recommendedRhythm = "slow";
  } else if (modulationLevel > 0.7) {
    recommendedRhythm = "fast";
  }

  return {
    modulationLevel,
    phaseCoefficient,
    stabilized,
    recommendedRhythm,
  };
}
