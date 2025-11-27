import type { AxisId } from '@/core/types/ontogenesis';
import type { OntogenesisVector } from '@/organism/ontogenesis3d';
import type { PolaritySnapshot } from '../orientation/L0_polarity';
import type { SomaFlowSnapshot } from '../flow/L7_soma_flow';
import type { ResonanceSnapshot } from '../resonance/L6_resonance_field';

type Axis = AxisId;

export interface TimeHorizonConfig {
  pastWindowSize: number;
  futureProjectionHorizon: number;
}

export interface PlanProfile {
  targetL: number;
  targetS: number;
  targetC: number;
  targetPolarity: 'yin' | 'yang' | 'tao' | 'balanced';
  targetFlowBalance: {
    maxGlobalPressure: number;
    minNourishment: number;
  };
}

export interface CrystalObserverConfig {
  time: TimeHorizonConfig;
  plan: PlanProfile;
  sensitivity: number;
  strictness: number;
}

export type DominantPolarity = 'yin' | 'yang' | 'tao' | 'mixed';

export interface TemporalAlignment {
  trendAlignment: number;
  presentVsPlan: number;
  driftFromPast: number;
}

export interface PolarityCrystalState {
  dominant: DominantPolarity;
  yinLevel: number;
  yangLevel: number;
  taoLevel: number;
  symmetryIndex: number;
}

export interface CrystalSignal {
  target: 'resonance' | 'flow' | 'axes' | 'all';
  type: 'soft_hint' | 'warning' | 'critical_guard';
  message: string;
  intensity: number;
}

export interface CrystalObserverSnapshot {
  temporal: TemporalAlignment;
  polarity: PolarityCrystalState;
  integrityIndex: number;
  coherenceIndex: number;
  planAlignmentIndex: number;
  crystalStabilityIndex: number;
  signals: CrystalSignal[];
  note: string;
}

export const DEFAULT_CRYSTAL_OBSERVER_CONFIG: CrystalObserverConfig = {
  time: { pastWindowSize: 128, futureProjectionHorizon: 16 },
  plan: {
    targetL: 0.34,
    targetS: 0.33,
    targetC: 0.33,
    targetPolarity: 'balanced',
    targetFlowBalance: {
      maxGlobalPressure: 0.7,
      minNourishment: 0.35,
    },
  },
  sensitivity: 0.7,
  strictness: 0.6,
};

export function runCrystalObserver(
  history: OntogenesisVector[],
  polarity: PolaritySnapshot,
  resonance: ResonanceSnapshot | null,
  flow: SomaFlowSnapshot | null,
  cfg: CrystalObserverConfig = DEFAULT_CRYSTAL_OBSERVER_CONFIG,
): CrystalObserverSnapshot {
  const temporal = computeTemporalAlignment(history, cfg.plan, cfg.time);
  const polarityState = computePolarityCrystal(polarity);

  const integrityIndex = computeIntegrity(flow, polarityState);
  const coherenceIndex = computeCoherence(resonance, flow);
  const planAlignmentIndex = computePlanAlignment(temporal, polarityState, cfg.plan);
  const crystalStabilityIndex = computeCrystalStability(integrityIndex, coherenceIndex, polarityState.symmetryIndex);

  const signals = buildCrystalSignals({
    temporal,
    polarityState,
    integrityIndex,
    coherenceIndex,
    planAlignmentIndex,
    crystalStabilityIndex,
    cfg,
  });

  const note =
    `L8 CrystalObserver: integ=${integrityIndex.toFixed(2)} ` +
    `coh=${coherenceIndex.toFixed(2)} plan=${planAlignmentIndex.toFixed(2)} ` +
    `stab=${crystalStabilityIndex.toFixed(2)} trendAlign=${temporal.trendAlignment.toFixed(2)} ` +
    `pol=${polarityState.dominant} sym=${polarityState.symmetryIndex.toFixed(2)}`;

  return {
    temporal,
    polarity: polarityState,
    integrityIndex,
    coherenceIndex,
    planAlignmentIndex,
    crystalStabilityIndex,
    signals,
    note,
  };
}

function computeTemporalAlignment(
  history: OntogenesisVector[],
  plan: PlanProfile,
  timeCfg: TimeHorizonConfig,
): TemporalAlignment {
  if (!history.length) {
    return { trendAlignment: 0.5, presentVsPlan: 0.5, driftFromPast: 0 };
  }

  const window = history.slice(-timeCfg.pastWindowSize);
  const present = window[window.length - 1];
  const pastVectors = window.slice(0, -1);

  const pastAggregate = pastVectors.length ? pastVectors : [present];

  const pastWeights = averageAxisWeights(pastAggregate);
  const currentWeights = extractAxisWeights(present);
  const trendVec = normalize([
    currentWeights.L - pastWeights.L,
    currentWeights.S - pastWeights.S,
    currentWeights.C - pastWeights.C,
  ]);

  const planVec = normalize([plan.targetL, plan.targetS, plan.targetC]);
  const currentVec = normalize([currentWeights.L, currentWeights.S, currentWeights.C]);
  const pastVec = normalize([pastWeights.L, pastWeights.S, pastWeights.C]);

  const trendAlignment = mapTo01(cosineSimilarity(trendVec, planVec));
  const presentVsPlan = mapTo01(cosineSimilarity(currentVec, planVec));
  const driftFromPast = clamp01(1 - cosineSimilarity(trendVec, pastVec));

  return { trendAlignment, presentVsPlan, driftFromPast };
}

function computePolarityCrystal(polarity: PolaritySnapshot): PolarityCrystalState {
  const yinLevel = clamp01(avg([polarity.L.yin, polarity.S.yin, polarity.C.yin]));
  const yangLevel = clamp01(avg([polarity.L.yang, polarity.S.yang, polarity.C.yang]));
  const taoLevel = clamp01(avg([polarity.L.tau, polarity.S.tau, polarity.C.tau]));
  const mean = (yinLevel + yangLevel + taoLevel) / 3;
  const variance =
    ((yinLevel - mean) ** 2 + (yangLevel - mean) ** 2 + (taoLevel - mean) ** 2) / 3;
  const symmetryIndex = clamp01(1 - variance * 3);

  let dominant: DominantPolarity = 'mixed';
  const maxVal = Math.max(yinLevel, yangLevel, taoLevel);
  if (maxVal === yinLevel) dominant = 'yin';
  else if (maxVal === yangLevel) dominant = 'yang';
  else if (maxVal === taoLevel) dominant = 'tao';

  return { dominant, yinLevel, yangLevel, taoLevel, symmetryIndex };
}

function computeIntegrity(flow: SomaFlowSnapshot | null, polarity: PolarityCrystalState): number {
  if (!flow) return polarity.symmetryIndex * 0.5 + 0.25;
  const flowBalance = flow.globalNourishmentIndex * (1 - flow.globalPressureIndex);
  const polBalance = polarity.symmetryIndex;
  return clamp01(0.6 * flowBalance + 0.4 * polBalance);
}

function computeCoherence(resonance: ResonanceSnapshot | null, flow: SomaFlowSnapshot | null): number {
  if (!resonance || !flow) return 0.5;
  const resonanceCoh = resonance.coherenceIndex ?? 0.5;
  const pressure = flow.globalPressureIndex ?? 0.5;
  return clamp01(1 - Math.abs(pressure - resonanceCoh));
}

function computePlanAlignment(
  temporal: TemporalAlignment,
  polarity: PolarityCrystalState,
  plan: PlanProfile,
): number {
  const trendScore = temporal.trendAlignment;
  const presentScore = temporal.presentVsPlan;

  let polScore = 0.5;
  if (plan.targetPolarity === 'tao') {
    polScore = polarity.symmetryIndex;
  } else if (plan.targetPolarity === polarity.dominant) {
    polScore = 1;
  } else if (plan.targetPolarity === 'balanced') {
    polScore = clamp01(1 - Math.abs(polarity.yinLevel - polarity.yangLevel));
  } else {
    polScore = 0.3;
  }

  return clamp01(0.5 * trendScore + 0.3 * presentScore + 0.2 * polScore);
}

function computeCrystalStability(integrity: number, coherence: number, symmetry: number): number {
  return clamp01(0.4 * integrity + 0.3 * coherence + 0.3 * symmetry);
}

function buildCrystalSignals(ctx: {
  temporal: TemporalAlignment;
  polarityState: PolarityCrystalState;
  integrityIndex: number;
  coherenceIndex: number;
  planAlignmentIndex: number;
  crystalStabilityIndex: number;
  cfg: CrystalObserverConfig;
}): CrystalSignal[] {
  const signals: CrystalSignal[] = [];
  const { temporal, polarityState, integrityIndex, coherenceIndex, planAlignmentIndex, crystalStabilityIndex, cfg } = ctx;

  if (planAlignmentIndex < 0.6 && crystalStabilityIndex > 0.5) {
    signals.push({
      target: 'axes',
      type: 'soft_hint',
      intensity: clamp01(0.4 * cfg.sensitivity),
      message: 'trend deviates from plan; consider gentle reorientation of L/S/C weights',
    });
  }

  if (temporal.driftFromPast > 0.7 && integrityIndex < 0.5) {
    signals.push({
      target: 'all',
      type: 'warning',
      intensity: clamp01(0.7 * cfg.strictness),
      message: 'high drift and low integrity; ease social/output load and favor recovery resonance',
    });
  }

  if (crystalStabilityIndex < 0.3) {
    signals.push({
      target: 'all',
      type: 'critical_guard',
      intensity: 0.9,
      message: 'crystal unstable; enter recovery bias, increase L nourishment and tao polarity',
    });
  }

  if (polarityState.dominant === 'yang' && polarityState.yinLevel < 0.2) {
    signals.push({
      target: 'resonance',
      type: 'soft_hint',
      intensity: 0.5,
      message: 'excessive yang; slow waves, raise integration/yin support',
    });
  }

  return signals;
}

function extractAxisWeights(vector: OntogenesisVector): Record<Axis, number> {
  const load = vector.loadProfile;
  const orientation = vector.orientation;
  const l = averageNonNull([
    load?.embodimentFocus,
    load?.meaningReflectionFocus,
    load?.globalStress,
    orientation?.L_level,
  ]);
  const s = averageNonNull([load?.socialFocus, load?.globalStress, orientation?.S_level]);
  const c = averageNonNull([
    load?.cosmicExplorationFocus,
    load?.meaningReflectionFocus,
    orientation?.C_level,
  ]);

  const normalized = normalize([l, s, c]);
  return { L: normalized[0] ?? 0.33, S: normalized[1] ?? 0.33, C: normalized[2] ?? 0.34 };
}

function averageAxisWeights(history: OntogenesisVector[]): Record<Axis, number> {
  if (!history.length) return { L: 0.33, S: 0.33, C: 0.34 };
  const weights = history.map(extractAxisWeights);
  return {
    L: avg(weights.map((w) => w.L)),
    S: avg(weights.map((w) => w.S)),
    C: avg(weights.map((w) => w.C)),
  };
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length) return 0;
  const dot = a.reduce((acc, val, i) => acc + val * (b[i] ?? 0), 0);
  const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((acc, val) => acc + val * val, 0));
  if (!norm) return vec.map(() => 0);
  return vec.map((v) => v / norm);
}

function mapTo01(value: number): number {
  return clamp01((value + 1) / 2);
}

function averageNonNull(values: Array<number | undefined>): number {
  const filtered = values.filter((v): v is number => typeof v === 'number');
  if (!filtered.length) return 0.33;
  return avg(filtered.map(clamp01));
}

function avg(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
