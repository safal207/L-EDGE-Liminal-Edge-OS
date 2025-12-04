import { analyzeCorePulseDrift } from "../../../layers/L22_CorePulse/corePulseDrift";
import { computePulseModulation } from "../../../layers/L22_CorePulse/corePulseModulation";
import type {
  BreathingCouplingSnapshot,
  CorePulseDrift,
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

const clamp01 = (value: number): number => clamp(value, 0, 1);

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
    breathing: input.breathing,
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

  const baseDrift = analyzeCorePulseDrift({ history: [...historyStates, latestState] });

  const overloadLevel = clamp(
    (latestState.current.overloadRisk ?? 0.1) * 0.6 +
      latestState.current.variability * 0.25 +
      (1 - latestState.baseline.stability) * 0.15,
    0,
    1,
  );

  const drift = adjustDriftWithBreathing(baseDrift, latest.breathing, overloadLevel);
  const modulation = computePulseModulation(drift, latest.modulationInput ?? {});

  const breathingAwareOverload = adjustOverloadWithBreathing(overloadLevel, latest.breathing, drift);

  const readiness = adjustReadinessWithBreathing(
    clamp(
      latestState.baseline.stability * 0.6 +
        (1 - breathingAwareOverload) * 0.3 +
        (drift === "rising" ? 0.07 : drift === "falling" ? -0.05 : 0),
      0,
      1,
    ),
    breathingAwareOverload,
    drift,
    latest.breathing,
  );

  const readinessBand: CorePulseState["readinessBand"] =
    readiness > 0.65 ? "high" : readiness > 0.35 ? "medium" : "low";

  // Drift guides modulation stability; overload and readiness remain bounded for safety.
  return {
    ...latestState,
    modulation,
    overloadLevel: breathingAwareOverload,
    readiness,
    readinessBand,
    drift,
  };
}

function adjustDriftWithBreathing(
  baseDrift: CorePulseDrift,
  breathing: BreathingCouplingSnapshot | undefined,
  overload: number,
): CorePulseDrift {
  if (!breathing) return baseDrift;

  const { mode, stability, rate } = breathing;

  // Protective or highly irregular breathing tips the drift toward caution.
  if (mode === "irregular") return "irregular";

  if (mode === "protective" && stability < 0.5 && rate > 0.55) {
    if (baseDrift === "rising") return overload > 0.5 ? "irregular" : "falling";
    if (baseDrift === "stable") return "irregular";
  }

  // Coherent breathing stabilizes borderline drifts when cadence is calm.
  if (mode === "coherent" && stability > 0.65 && rate < 0.75) {
    if (baseDrift === "rising" || baseDrift === "falling") {
      return stability > 0.8 && overload < 0.6 ? "stable" : baseDrift;
    }
    if (baseDrift === "irregular" && stability > 0.85 && overload < 0.5) return "stable";
  }

  // Expansive breathing supports upward drift without letting it spike into chaos.
  if (mode === "expansive" && stability > 0.55 && rate > 0.55) {
    if (baseDrift === "stable") return "rising";
    if (baseDrift === "falling" && rate > 0.7) return "stable";
  }

  return baseDrift;
}

function adjustOverloadWithBreathing(
  baseOverload: number,
  breathing: BreathingCouplingSnapshot | undefined,
  drift: CorePulseDrift,
): number {
  if (!breathing) return baseOverload;

  let overload = baseOverload;
  const { mode, stability, rate } = breathing;

  if (mode === "coherent" && stability > 0.6) {
    // Coherence and stability gently downshift perceived overload.
    overload -= 0.08 * stability;
  } else if (mode === "expansive" && stability > 0.55) {
    // Allow growth but cap runaway overload when the breath is expansive yet steady.
    overload -= 0.04 * stability;
    overload = Math.min(overload, drift === "rising" ? 0.82 : 0.9);
  } else if (mode === "protective" && rate > 0.55 && stability < 0.5) {
    // Protective but shaky breathing warns about potential overload.
    overload += 0.08;
  } else if (mode === "irregular") {
    overload += 0.1;
  }

  return clamp01(overload);
}

function adjustReadinessWithBreathing(
  baseReadiness: number,
  overload: number,
  drift: CorePulseDrift,
  breathing: BreathingCouplingSnapshot | undefined,
): number {
  if (!breathing) return baseReadiness;

  let readiness = baseReadiness;
  const { mode, stability } = breathing;

  if (mode === "coherent" && stability > 0.65) {
    // Stable coherent breathing lifts readiness slightly by easing the system.
    readiness += 0.08 * stability;
  }

  if (mode === "expansive" && stability > 0.55 && drift === "rising") {
    readiness += 0.04;
  }

  if ((mode === "protective" || mode === "irregular") && (overload > 0.55 || drift === "irregular")) {
    // Guardrails: protective or erratic breathing caps readiness until overload eases.
    readiness -= 0.12 + overload * 0.06;
    if (overload > 0.6) {
      readiness -= 0.03;
    }
  }

  if ((mode === "protective" || mode === "irregular") && overload > 0.65) {
    readiness = Math.min(readiness, 0.55);
  }

  if ((mode === "protective" || mode === "irregular") && overload > 0.7) {
    readiness -= 0.05;
    readiness = Math.min(readiness, 0.4);
  }

  return clamp01(readiness);
}

export interface CorePulseSnapshot {
  drift?: CorePulseDrift;
  overloadLevel?: number;
  readiness?: number;
  readinessBand?: CorePulseState["readinessBand"];
  modulationLevel?: number;
  baselineLevel?: number;
  phase?: CorePulseState["current"]["phase"];
  current?: CorePulseState["current"];
  baseline?: CorePulseState["baseline"];
  breathing?: BreathingCouplingSnapshot;
}

export { computePulseModulation };
export type {
  BreathingCouplingSnapshot,
  CorePulseState,
  PulseModulationInput,
  PulseModulationState,
};
