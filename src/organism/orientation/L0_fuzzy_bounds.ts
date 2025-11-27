import type { OrientationSnapshot } from './L0_center';
import type { AxisPolarity, PolaritySnapshot } from './L0_polarity';

export interface FuzzyBand {
  minimin: number; // "red zone" minimum — falling below signals breakdown risk
  minimax: number; // safe baseline under worst case
  maximax: number; // upper reasonable bound before drift/overload
}

export interface AxisFuzzyBands {
  yin: FuzzyBand;
  yang: FuzzyBand;
  tau: FuzzyBand;
}

export interface FuzzyBoundsSnapshot {
  L: AxisFuzzyBands;
  S: AxisFuzzyBands;
  C: AxisFuzzyBands;
  globalMiniminIndex: number; // how far we are from bottom bounds across axes
  globalMinimaxIndex: number; // adherence to safe bands
  globalMaximaxIndex: number; // proximity to upper bounds
  note: string;
}

/**
 * Compute fuzzy safety bands (minimin/minimax/maximax) for yin/yang/tau on each axis.
 * Wider bands reflect higher stability (tau + balance), while fragile states narrow the corridor.
 */
export function computeFuzzyBounds(
  polarity: PolaritySnapshot,
  orientation: OrientationSnapshot,
): FuzzyBoundsSnapshot {
  const L = computeAxisBounds(polarity.L, orientation.balanceIndex);
  const S = computeAxisBounds(polarity.S, orientation.balanceIndex);
  const C = computeAxisBounds(polarity.C, orientation.balanceIndex);

  const miniminIndex = avg([
    L.yin.minimin,
    L.yang.minimin,
    L.tau.minimin,
    S.yin.minimin,
    S.yang.minimin,
    S.tau.minimin,
    C.yin.minimin,
    C.yang.minimin,
    C.tau.minimin,
  ]);

  const minimaxIndex = avg([
    L.yin.minimax,
    L.yang.minimax,
    L.tau.minimax,
    S.yin.minimax,
    S.yang.minimax,
    S.tau.minimax,
    C.yin.minimax,
    C.yang.minimax,
    C.tau.minimax,
  ]);

  const maximaxIndex = avg([
    L.yin.maximax,
    L.yang.maximax,
    L.tau.maximax,
    S.yin.maximax,
    S.yang.maximax,
    S.tau.maximax,
    C.yin.maximax,
    C.yang.maximax,
    C.tau.maximax,
  ]);

  const note =
    `Fuzzy bounds: ` +
    `L[ yin=${fmt(L.yin)} yang=${fmt(L.yang)} tau=${fmt(L.tau)} ], ` +
    `S[ yin=${fmt(S.yin)} yang=${fmt(S.yang)} tau=${fmt(S.tau)} ], ` +
    `C[ yin=${fmt(C.yin)} yang=${fmt(C.yang)} tau=${fmt(C.tau)} ]; ` +
    `global minimin=${miniminIndex.toFixed(2)}, minimax=${minimaxIndex.toFixed(2)}, maximax=${maximaxIndex.toFixed(2)}.`;

  return {
    L,
    S,
    C,
    globalMiniminIndex: clamp01(miniminIndex),
    globalMinimaxIndex: clamp01(minimaxIndex),
    globalMaximaxIndex: clamp01(maximaxIndex),
    note,
  };
}

function computeAxisBounds(axis: AxisPolarity, balanceIndex: number): AxisFuzzyBands {
  // tau captures stability for the axis; balance adds system-wide steadiness.
  const stability = clamp01(axis.tau * 0.7 + balanceIndex * 0.3);

  return {
    yin: makeBand(axis.yin, stability),
    yang: makeBand(axis.yang, stability),
    tau: makeBand(axis.tau, stability),
  };
}

function makeBand(value: number, stability: number): FuzzyBand {
  const width = 0.15 + 0.25 * stability; // 0.15..0.4
  const half = width / 2;

  const minimax = clamp01(value);
  const minimin = clamp01(minimax - half);
  const maximax = clamp01(minimax + half);

  return { minimin, minimax, maximax };
}

function avg(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function fmt(b: FuzzyBand): string {
  return `(${b.minimin.toFixed(2)}|${b.minimax.toFixed(2)}|${b.maximax.toFixed(2)})`;
}
