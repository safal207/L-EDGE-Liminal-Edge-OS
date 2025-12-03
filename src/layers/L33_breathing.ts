export type BreathingPhase = "inhale" | "exhale" | "hold";

export interface RetrospectiveMetrics {
  avgSurprise: number;
  avgLearningSignal: number;
  calibrationMismatchRate: number;
  outcomeVolatility: number;
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

  createdAt: string;
}

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

export function runBreathingCycle(metrics: RetrospectiveMetrics): BreathingSnapshot {
  const fuzzy = computeFuzzyState(metrics);
  const luckSynergyScore = computeLuckSynergyScore(metrics, fuzzy);
  const phase = decidePhase(metrics, fuzzy);
  const modulation = computeModulationFactors(luckSynergyScore, fuzzy);

  const snapshot: BreathingSnapshot = {
    phase,
    cycleIndex: cycleCounter++,
    avgSurprise: clamp01(metrics.avgSurprise),
    avgLearningSignal: clamp(metrics.avgLearningSignal, -1, 1),
    calibrationMismatchRate: clamp01(metrics.calibrationMismatchRate),
    outcomeVolatility: clamp01(metrics.outcomeVolatility),
    ...modulation,
    ...fuzzy,
    luckSynergyScore,
    createdAt: new Date().toISOString(),
  };

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
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
