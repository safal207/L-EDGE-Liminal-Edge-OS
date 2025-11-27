import type { OrientationSnapshot } from './L0_center';
import type { AxisPolarity, PolaritySnapshot } from './L0_polarity';
import type { LoadProfile } from './L0_load_profile';
import type { AxisCouplingSnapshot } from './L0_axis_coupling';
import type { AxisFuzzyBands, FuzzyBoundsSnapshot } from './L0_fuzzy_bounds';

export type CerebellumMode = 'soft' | 'balanced' | 'strict';

export interface CerebellumConfig {
  mode: CerebellumMode;
  smoothingFactor: number; // 0..1 — how strongly we move toward targets
  maxCorrectionPerStep: number; // 0..1 — caps per-step adjustments
  inertia: number; // 0..1 — placeholder for future smoothing via history
}

export interface AxisMicroCorrection {
  yinDelta: number;
  yangDelta: number;
  tauDelta: number;
  smoothnessGain: number; // 0..1 — how much the axis motion was damped
}

export interface CerebellumSnapshot {
  config: CerebellumConfig;
  adjustedPolarity: PolaritySnapshot;
  adjustedLoadProfile: LoadProfile;
  microCorrections: {
    L: AxisMicroCorrection;
    S: AxisMicroCorrection;
    C: AxisMicroCorrection;
  };
  totalCorrectionMagnitude: number; // 0..1
  overshootRisk: number; // 0..1
  axisImbalanceIndex: number; // 0..1
  stabilityScore: number; // 0..1
  smoothnessScore: number; // 0..1
  axisCoupling?: AxisCouplingSnapshot;
  note: string;
}

export const SOFT_CEREBELLUM_CONFIG: CerebellumConfig = {
  mode: 'soft',
  smoothingFactor: 0.25,
  maxCorrectionPerStep: 0.08,
  inertia: 0.85,
};

export const BALANCED_CEREBELLUM_CONFIG: CerebellumConfig = {
  mode: 'balanced',
  smoothingFactor: 0.35,
  maxCorrectionPerStep: 0.15,
  inertia: 0.7,
};

export const STRICT_CEREBELLUM_CONFIG: CerebellumConfig = {
  mode: 'strict',
  smoothingFactor: 0.5,
  maxCorrectionPerStep: 0.25,
  inertia: 0.5,
};

export const DEFAULT_CEREBELLUM_CONFIG = BALANCED_CEREBELLUM_CONFIG;

export function resolveCerebellumConfigFromMode(mode: string | undefined): CerebellumConfig {
  switch (mode) {
    case 'soft':
      return SOFT_CEREBELLUM_CONFIG;
    case 'strict':
      return STRICT_CEREBELLUM_CONFIG;
    case 'balanced':
    default:
      return BALANCED_CEREBELLUM_CONFIG;
  }
}

interface AxisTarget {
  yin: number;
  yang: number;
  tau: number;
}

export function runCerebellumStep(
  orientation: OrientationSnapshot,
  polarity: PolaritySnapshot,
  load: LoadProfile,
  fuzzy: FuzzyBoundsSnapshot,
  coupling?: AxisCouplingSnapshot,
  config: CerebellumConfig = DEFAULT_CEREBELLUM_CONFIG,
): CerebellumSnapshot {
  const { smoothingFactor, maxCorrectionPerStep } = config;

  const targetL = buildAxisTarget(polarity.L, fuzzy.L);
  const targetS = buildAxisTarget(polarity.S, fuzzy.S);
  const targetC = buildAxisTarget(polarity.C, fuzzy.C);

  const [newL, corrL] = smoothAxis(polarity.L, targetL, smoothingFactor, maxCorrectionPerStep);
  const [newS, corrS] = smoothAxis(polarity.S, targetS, smoothingFactor, maxCorrectionPerStep);
  const [newC, corrC] = smoothAxis(polarity.C, targetC, smoothingFactor, maxCorrectionPerStep);

  const recalculated = rebuildPolaritySnapshot({ ...polarity, L: newL, S: newS, C: newC });

  const smoothnessScore = clamp01(
    (corrL.smoothnessGain + corrS.smoothnessGain + corrC.smoothnessGain) / 3,
  );
  const stabilityScore = computeStabilityScore(recalculated, orientation, coupling);

  const totalCorrectionMagnitude = clamp01(
    avg([axisCorrectionMagnitude(corrL), axisCorrectionMagnitude(corrS), axisCorrectionMagnitude(corrC)]),
  );
  const overshootRisk = clamp01(
    totalCorrectionMagnitude *
      (1 - clamp01(recalculated.globalTau ?? recalculated.tauMaturityIndex ?? 0)),
  );
  const axisImbalanceIndex = clamp01(axisImbalanceFromCorrections(corrL, corrS, corrC));

  const adjustedLoad = adjustLoadProfileWithCerebellum(
    load,
    recalculated,
    stabilityScore,
    coupling,
  );

  const note =
    `Cerebellum(mode=${config.mode}): ` +
    `L(dY=${corrL.yinDelta.toFixed(3)},dJ=${corrL.yangDelta.toFixed(3)},dT=${corrL.tauDelta.toFixed(3)}) ` +
    `S(dY=${corrS.yinDelta.toFixed(3)},dJ=${corrS.yangDelta.toFixed(3)},dT=${corrS.tauDelta.toFixed(3)}) ` +
    `C(dY=${corrC.yinDelta.toFixed(3)},dJ=${corrC.yangDelta.toFixed(3)},dT=${corrC.tauDelta.toFixed(3)}); ` +
    `stability=${stabilityScore.toFixed(2)}, smoothness=${smoothnessScore.toFixed(2)}, ` +
    `totalCorr=${totalCorrectionMagnitude.toFixed(2)}, overshootRisk=${overshootRisk.toFixed(2)}, ` +
    `axisImbalance=${axisImbalanceIndex.toFixed(2)}.`;

  return {
    config,
    adjustedPolarity: recalculated,
    adjustedLoadProfile: adjustedLoad,
    microCorrections: {
      L: corrL,
      S: corrS,
      C: corrC,
    },
    axisCoupling: coupling,
    totalCorrectionMagnitude,
    overshootRisk,
    axisImbalanceIndex,
    stabilityScore,
    smoothnessScore,
    note,
  };
}

function buildAxisTarget(axis: AxisPolarity, bands: AxisFuzzyBands): AxisTarget {
  return {
    yin: bands.yin.minimax,
    yang: bands.yang.minimax,
    tau: bands.tau.minimax,
  };
}

function smoothAxis(
  current: AxisPolarity,
  target: AxisTarget,
  smoothingFactor: number,
  maxDelta: number,
): [AxisPolarity, AxisMicroCorrection] {
  const yinDeltaRaw = (target.yin - current.yin) * smoothingFactor;
  const yangDeltaRaw = (target.yang - current.yang) * smoothingFactor;
  const tauDeltaRaw = (target.tau - current.tau) * smoothingFactor;

  const yinDelta = clampDelta(yinDeltaRaw, maxDelta);
  const yangDelta = clampDelta(yangDeltaRaw, maxDelta);
  const tauDelta = clampDelta(tauDeltaRaw, maxDelta);

  const newYin = clamp01(current.yin + yinDelta);
  const newYang = clamp01(current.yang + yangDelta);
  const newTau = clamp01(current.tau + tauDelta);

  const smoothnessGain = 1 - avg([
    Math.abs(yinDeltaRaw - yinDelta),
    Math.abs(yangDeltaRaw - yangDelta),
    Math.abs(tauDeltaRaw - tauDelta),
  ]);

  const updated: AxisPolarity = {
    ...current,
    yin: newYin,
    yang: newYang,
    tau: newTau,
  };

  const corr: AxisMicroCorrection = {
    yinDelta,
    yangDelta,
    tauDelta,
    smoothnessGain: clamp01(smoothnessGain),
  };

  return [updated, corr];
}

function adjustLoadProfileWithCerebellum(
  load: LoadProfile,
  polarity: PolaritySnapshot,
  stabilityScore: number,
  coupling?: AxisCouplingSnapshot,
): LoadProfile {
  let {
    globalStress,
    embodimentFocus,
    playExplorationFocus,
    skillDrillFocus,
    meaningReflectionFocus,
    socialFocus,
    cosmicExplorationFocus,
    yinBias,
    tauSupport,
    note,
  } = load;

  const stability = clamp01(stabilityScore);
  globalStress -= 0.05 * stability;
  playExplorationFocus += 0.03 * stability;
  meaningReflectionFocus += 0.03 * stability;

  const instability = clamp01(1 - stability);
  skillDrillFocus -= 0.03 * instability;
  socialFocus -= 0.02 * instability;

  const updatedNote = note
    ? `${note} | cerebellumAdjusted(stability=${stability.toFixed(2)}` +
      `${coupling ? `, couplingFlow=${coupling.resonanceFlow.toFixed(2)}` : ''})`
    : `cerebellumAdjusted(stability=${stability.toFixed(2)}` +
      `${coupling ? `, couplingFlow=${coupling.resonanceFlow.toFixed(2)}` : ''})`;

  return {
    globalStress: clamp01(globalStress),
    embodimentFocus: clamp01(embodimentFocus),
    playExplorationFocus: clamp01(playExplorationFocus),
    skillDrillFocus: clamp01(skillDrillFocus),
    meaningReflectionFocus: clamp01(meaningReflectionFocus),
    socialFocus: clamp01(socialFocus),
    cosmicExplorationFocus: clamp01(cosmicExplorationFocus),
    yinBias,
    tauSupport,
    note: updatedNote,
  };
}

function computeStabilityScore(
  polarity: PolaritySnapshot,
  orientation: OrientationSnapshot,
  coupling?: AxisCouplingSnapshot,
): number {
  const driftPenalty = Math.abs(polarity.yinYangDrift ?? 0);
  const driftScore = 1 / (1 + driftPenalty);
  const tauScore = clamp01(polarity.globalTau ?? polarity.tauMaturityIndex ?? 0);
  const balanceScore = clamp01(orientation.balanceIndex ?? 0.5);
  const couplingScore = coupling ? clamp01(coupling.stabilityIndex) : 0.5;
  return clamp01(avg([driftScore, tauScore, balanceScore, couplingScore]));
}

function rebuildPolaritySnapshot(base: PolaritySnapshot): PolaritySnapshot {
  const ratios = [base.L.ratio, base.S.ratio, base.C.ratio];
  const taus = [base.L.tau, base.S.tau, base.C.tau];
  const globalRatio = avg(ratios);
  const yinYangDrift = clampMinus1to1(Math.log2(globalRatio || 1));
  const globalTau = avg(taus);
  const tauMaturityIndex = globalTau;

  const note =
    `Polarity: ` +
    `L(r=${base.L.ratio.toFixed(2)},τ=${base.L.tau.toFixed(2)},${base.L.state}) ` +
    `S(r=${base.S.ratio.toFixed(2)},τ=${base.S.tau.toFixed(2)},${base.S.state}) ` +
    `C(r=${base.C.ratio.toFixed(2)},τ=${base.C.tau.toFixed(2)},${base.C.state}); ` +
    `globalRatio=${globalRatio.toFixed(2)}, ` +
    `drift=${yinYangDrift.toFixed(2)}, ` +
    `globalTau=${globalTau.toFixed(2)}.`;

  return {
    ...base,
    globalRatio,
    yinYangDrift,
    globalTau,
    tauMaturityIndex,
    note,
  };
}

function axisCorrectionMagnitude(corr: AxisMicroCorrection): number {
  return clamp01(Math.abs(corr.yinDelta) + Math.abs(corr.yangDelta) + Math.abs(corr.tauDelta));
}

function axisImbalanceFromCorrections(
  L: AxisMicroCorrection,
  S: AxisMicroCorrection,
  C: AxisMicroCorrection,
): number {
  const mL = axisCorrectionMagnitude(L);
  const mS = axisCorrectionMagnitude(S);
  const mC = axisCorrectionMagnitude(C);
  const avgMag = avg([mL, mS, mC]);
  if (avgMag === 0) return 0;
  const spread = avg([Math.abs(mL - avgMag), Math.abs(mS - avgMag), Math.abs(mC - avgMag)]);
  return clamp01(spread / (avgMag + 1e-6));
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function clampMinus1to1(x: number): number {
  return Math.min(1, Math.max(-1, x));
}

function clampDelta(delta: number, maxAbs: number): number {
  if (delta > maxAbs) return maxAbs;
  if (delta < -maxAbs) return -maxAbs;
  return delta;
}

function avg(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
