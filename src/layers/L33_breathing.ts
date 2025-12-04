import type { OrganismTone } from '@/layers/shared/organismTone';
import { deriveOrganismTone, setCurrentOrganismTone } from '@/layers/shared/organismTone';
import type { BreathingCouplingSnapshot, CorePulseState } from '../../layers/L22_CorePulse/types';

export type BreathingPhase = "inhale" | "exhale" | "hold";

export interface RetrospectiveMetrics {
  avgSurprise: number;
  avgLearningSignal: number;
  calibrationMismatchRate: number;
  outcomeVolatility: number;
}

export type BreathingMode = "ground" | "steady" | "expand";

export type BreathingRate = "slow" | "medium" | "fast";

export type BreathingCouplingLevel = "coherent" | "expansive" | "protective" | "neutral";

export interface BreathingCoupling {
  level: BreathingCouplingLevel;
  stability: number;
  suggestedMode: BreathingMode;
  suggestedRate: BreathingRate;
  patternTag: string;
}

export interface BreathingCouplingState {
  level: BreathingCouplingLevel;
  stability: number;
}

export interface BreathingInput extends RetrospectiveMetrics {
  corePulse?: CorePulseState;
  modeHint?: BreathingMode;
  rateHint?: BreathingRate;
  patternHint?: string;
}

export interface FuzzyState {
  fuzzChaos: number;
  fuzzStability: number;
  fuzzGrowth: number;
  fuzzFatigue: number;
}

export interface BreathingSnapshot {
  phase: BreathingPhase;
  cycleIndex: number;

  avgSurprise: number;
  avgLearningSignal: number;
  calibrationMismatchRate: number;
  outcomeVolatility: number;

  confidenceScaleFactor: number;
  luckSensitivityFactor: number;
  insightThresholdFactor: number;

  fuzzChaos: number;
  fuzzStability: number;
  fuzzGrowth: number;
  fuzzFatigue: number;

  luckSynergyScore: number;

  mode: BreathingMode;
  rate: BreathingRate;
  pattern: string;

  coreCoupling: BreathingCouplingState;
  /** Compact snapshot for coupling back into L22. */
  coreCouplingSnapshot?: BreathingCouplingSnapshot;

  tone?: OrganismTone;

  createdAt: string;
}

export type BreathingState = Pick<
  BreathingSnapshot,
  "mode" | "rate" | "coreCoupling" | "coreCouplingSnapshot" | "phase"
>;

const breathingLog: BreathingSnapshot[] = [];
let cycleCounter = 0;

export function computeFuzzyState(metrics: RetrospectiveMetrics): FuzzyState {
  const { avgSurprise, avgLearningSignal, calibrationMismatchRate, outcomeVolatility } = metrics;

  const fuzzChaos = clamp01(0.5 * outcomeVolatility + 0.5 * Math.max(0, avgSurprise - 0.4));

  const fuzzStability = clamp01(1 - outcomeVolatility - 0.5 * calibrationMismatchRate);

  const fuzzGrowth = clamp01(0.5 * Math.max(0, avgLearningSignal) + 0.3 * avgSurprise);

  const fuzzFatigue = clamp01(Math.max(0, -avgLearningSignal) + 0.3 * calibrationMismatchRate);

  return { fuzzChaos, fuzzStability, fuzzGrowth, fuzzFatigue };
}

export function computeLuckSynergyScore(
  metrics: RetrospectiveMetrics,
  fuzzy: FuzzyState,
): number {
  const { avgSurprise, avgLearningSignal, calibrationMismatchRate } = metrics;
  const { fuzzChaos, fuzzStability, fuzzGrowth } = fuzzy;

  const pleasantSurprise = clamp01(1 - Math.abs(avgSurprise - 0.5) * 2);
  const positiveLearning = clamp01((avgLearningSignal + 1) / 2);
  const goodCalibration = clamp01(1 - calibrationMismatchRate);
  const stabilityOrFlow = clamp01(0.5 * fuzzStability + 0.5 * fuzzGrowth);
  const chaosPenalty = clamp01(1 - fuzzChaos);

  const raw =
    0.25 * pleasantSurprise +
    0.25 * positiveLearning +
    0.25 * goodCalibration +
    0.15 * stabilityOrFlow +
    0.1 * chaosPenalty;

  return clamp01(raw);
}

/**
 * Translate the current core pulse snapshot into a breathing-coupling suggestion.
 * Keeps heuristics simple and deterministic so the breathing layer remains stable.
 */
export function deriveBreathingCouplingFromPulse(pulse: CorePulseState): BreathingCoupling {
  const overload = clamp01(pulse.overloadLevel ?? pulse.current.overloadRisk ?? 0);
  const drift = pulse.drift ?? "stable";
  const phase = pulse.current.phase;
  const readiness = clamp01(pulse.readiness);
  const variability = clamp01(pulse.current.variability);

  let level: BreathingCouplingLevel = "neutral";
  let stability = 0.5;
  let suggestedMode: BreathingMode = "steady";
  let suggestedRate: BreathingRate = "medium";
  let patternTag = "baseline";

  // Overload or choppy variability biases toward grounding / protection.
  if (overload > 0.7 || variability > 0.65 || phase === "recovery") {
    level = "protective";
    suggestedMode = "ground";
    suggestedRate = "slow";
    patternTag = "downshift";
    stability = 0.4;
  } else if ((drift === "rising" || phase === "rise" || phase === "peak") && overload < 0.5) {
    // Opening pulse: allow breath to widen while keeping coherence.
    level = "expansive";
    suggestedMode = "expand";
    suggestedRate = readiness > 0.65 ? "fast" : "medium";
    patternTag = "wave-rise";
    stability = 0.7;
  } else if (drift === "stable" && overload < 0.4) {
    // Calm pulse enables coherent steady breathing.
    level = "coherent";
    suggestedMode = "steady";
    suggestedRate = "medium";
    patternTag = "coherent-steady";
    stability = 0.82;
  } else if (drift === "irregular" || phase === "recovery") {
    // Mildly unsettled or closing phases favor protection without fully slowing down.
    level = "protective";
    suggestedMode = "ground";
    suggestedRate = "slow";
    patternTag = "stabilize";
    stability = 0.45;
  }

  return { level, stability, suggestedMode, suggestedRate, patternTag };
}

export function decidePhase(
  metrics: RetrospectiveMetrics,
  fuzzy: FuzzyState,
): BreathingPhase {
  const { fuzzChaos, fuzzStability, fuzzGrowth, fuzzFatigue } = fuzzy;

  if (fuzzChaos > 0.6 && fuzzGrowth > 0.4) {
    return "inhale";
  }

  if (fuzzStability > 0.6 && fuzzChaos < 0.4) {
    return "exhale";
  }

  if (fuzzFatigue > 0.6) {
    return "hold";
  }

  return "hold";
}

function computeModulationFactors(
  luckSynergyScore: number,
  fuzzy: FuzzyState,
): Pick<
  BreathingSnapshot,
  "confidenceScaleFactor" | "luckSensitivityFactor" | "insightThresholdFactor"
> {
  const confidenceScaleFactor = clamp(
    0.9 + 0.3 * luckSynergyScore - 0.2 * fuzzy.fuzzChaos + 0.1 * fuzzy.fuzzStability,
    0.5,
    1.6,
  );

  const luckSensitivityFactor = clamp(
    0.8 + 0.5 * luckSynergyScore + 0.1 * fuzzy.fuzzGrowth,
    0.5,
    1.7,
  );

  const insightThresholdFactor = clamp(
    1 - 0.2 * luckSynergyScore - 0.2 * fuzzy.fuzzFatigue + 0.15 * fuzzy.fuzzGrowth,
    0.5,
    1.5,
  );

  return { confidenceScaleFactor, luckSensitivityFactor, insightThresholdFactor };
}

export function computeBreathingState(
  input: BreathingInput,
  meta?: { cycleIndex?: number; createdAt?: string },
): BreathingSnapshot {
  const { corePulse, modeHint, rateHint, patternHint, ...metrics } = input;
  const fuzzy = computeFuzzyState(metrics);
  const luckSynergyScore = computeLuckSynergyScore(metrics, fuzzy);
  const phase = decidePhase(metrics, fuzzy);
  const modulation = computeModulationFactors(luckSynergyScore, fuzzy);

  const coupling = corePulse ? deriveBreathingCouplingFromPulse(corePulse) : null;
  const mode: BreathingMode = modeHint ?? coupling?.suggestedMode ?? "steady";
  const rate: BreathingRate = rateHint ?? coupling?.suggestedRate ?? "medium";
  const basePattern = patternHint ?? "baseline";
  const pattern = coupling ? `${basePattern}:${coupling.patternTag}` : basePattern;
  const coreCoupling: BreathingCouplingState = coupling
    ? { level: coupling.level, stability: coupling.stability }
    : { level: "neutral", stability: 0.5 };

  const coreCouplingSnapshot = toBreathingCouplingSnapshot({
    coreCoupling,
    rate,
    fuzzChaos: fuzzy.fuzzChaos,
    fuzzStability: fuzzy.fuzzStability,
  });

  return {
    phase,
    cycleIndex: meta?.cycleIndex ?? 0,
    avgSurprise: clamp01(metrics.avgSurprise),
    avgLearningSignal: clamp(metrics.avgLearningSignal, -1, 1),
    calibrationMismatchRate: clamp01(metrics.calibrationMismatchRate),
    outcomeVolatility: clamp01(metrics.outcomeVolatility),
    ...modulation,
    ...fuzzy,
    luckSynergyScore,
    mode,
    rate,
    pattern,
    coreCoupling,
    coreCouplingSnapshot,
    createdAt: meta?.createdAt ?? new Date().toISOString(),
  };
}

type BreathingCouplingSource = Pick<BreathingSnapshot, "coreCoupling" | "rate" | "fuzzChaos" | "fuzzStability">;

/**
 * Reduce a full breathing snapshot into the minimal coupling state expected by L22 CorePulse.
 * Keeps the mapping deterministic and explained for reproducibility.
 */
export function toBreathingCouplingSnapshot(source: BreathingCouplingSource): BreathingCouplingSnapshot {
  const rateValue: Record<BreathingRate, number> = {
    slow: 0.35,
    medium: 0.6,
    fast: 0.85,
  };

  const mode: BreathingCouplingSnapshot["mode"] =
    source.coreCoupling.level === "neutral"
      ? source.fuzzChaos > 0.6
        ? "irregular"
        : "coherent"
      : source.coreCoupling.level;

  const rate = rateValue[source.rate];

  // Stability leans on the core coupling stability but is tempered by fuzz stability to stay realistic.
  const stability = clamp01(0.65 * source.coreCoupling.stability + 0.35 * clamp01(source.fuzzStability));

  return { mode, rate, stability };
}

export function runBreathingCycle(
  metrics: RetrospectiveMetrics,
  options?: Omit<BreathingInput, keyof RetrospectiveMetrics>,
): BreathingSnapshot {
  const snapshot = computeBreathingState({ ...metrics, ...options }, {
    cycleIndex: cycleCounter++,
    createdAt: new Date().toISOString(),
  });

  const tone = deriveOrganismTone(snapshot);
  snapshot.tone = tone;
  setCurrentOrganismTone(tone);

  breathingLog.push(snapshot);
  if (breathingLog.length > 1000) {
    breathingLog.shift();
  }

  return snapshot;
}

export function getBreathingHistory(limit = 50): BreathingSnapshot[] {
  return breathingLog.slice(-limit);
}

export function resetBreathingState(): void {
  breathingLog.length = 0;
  cycleCounter = 0;
  setCurrentOrganismTone(null);
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
