import { analyzeCorePulseDrift } from "../../../layers/L22_CorePulse/corePulseDrift";
import { computePulseModulation } from "../../../layers/L22_CorePulse/corePulseModulation";
import type {
  CorePulseInput,
  CorePulseState,
  PulseModulationInput,
  PulseModulationState,
} from "../../../layers/L22_CorePulse/types";

export const CORE_PULSE_LAYER_ID = "L22_CorePulse";

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const NEUTRAL_MODULATION = {
  breathingInfluence: 0,
  luckInfluence: 0,
  emotionalInfluence: 0,
};

function toStateSnapshot(input: CorePulseInput, fallbackBaseline: { intensity: number; stability: number }): CorePulseState {
  const baseline = {
    intensity: clamp(input.baselineIntensity ?? fallbackBaseline.intensity, 0, 1),
    stability: clamp(input.baselineStability ?? fallbackBaseline.stability, 0, 1),
  };

  return {
    baseline,
    current: {
      intensity: clamp(input.intensity, 0, 1),
      variability: clamp(input.variability ?? 0.15, 0, 1),
      phase: input.phase ?? "rest",
      overloadRisk: clamp(input.overloadRisk ?? 0.1, 0, 1),
    },
    modulation: { ...NEUTRAL_MODULATION },
    readiness: 0.5,
    overloadLevel: clamp(input.overloadRisk ?? 0.1, 0, 1),
  };
}

function deriveBaseline(history: CorePulseInput[], latest: CorePulseInput): {
  intensity: number;
  stability: number;
} {
  const historyIntensity = history.length
    ? history.reduce((sum, sample) => sum + clamp(sample.intensity, 0, 1), 0) / history.length
    : 0.5;

  return {
    intensity: clamp(latest.baselineIntensity ?? historyIntensity ?? 0.5, 0, 1),
    stability: clamp(latest.baselineStability ?? 0.7, 0, 1),
  };
}

/**
 * Computes a deterministic CorePulseState snapshot from raw inputs and short history.
 * - Derives drift from the trend of recent samples.
 * - Applies gentle modulation coefficients.
 * - Produces a fully populated state ready for downstream consumers.
 */
export function computeCorePulseSnapshot(history: CorePulseInput[], latest: CorePulseInput): CorePulseState {
  const fallbackBaseline = deriveBaseline(history, latest);

  const historyStates = history.map((sample) => toStateSnapshot(sample, fallbackBaseline));
  const latestState = toStateSnapshot(latest, fallbackBaseline);

  const drift = analyzeCorePulseDrift({ history: [...historyStates, latestState] });
  const modulation = computePulseModulation(drift, latest.modulationInput ?? {});

  const overloadLevel = clamp(
    (latestState.current.overloadRisk ?? 0.1) * 0.6 + latestState.current.variability * 0.25 + (1 - latestState.baseline.stability) * 0.15,
    0,
    1,
  );

  const readiness = clamp(
    latestState.baseline.stability * 0.6 + (1 - overloadLevel) * 0.3 + (drift === "rising" ? 0.07 : drift === "falling" ? -0.05 : 0),
    0,
    1,
  );

  // Drift guides modulation stability; overload and readiness remain bounded for safety.
  return {
    ...latestState,
    modulation,
    overloadLevel,
    readiness,
    drift,
  };
}

export { computePulseModulation };
export type { PulseModulationInput, PulseModulationState };
