export type OrientationMode =
  | 'balanced'
  | 'L_overload'
  | 'S_overload'
  | 'C_overload'
  | 'L_starved'
  | 'S_starved'
  | 'C_starved';

export interface OrientationSnapshot {
  L_level: number;
  S_level: number;
  C_level: number;
  balanceIndex: number;
  dominantAxis: 'L' | 'S' | 'C' | 'none';
  starvedAxis: 'L' | 'S' | 'C' | 'none';
  mode: OrientationMode;
  note: string;
}

export interface OrientationInputs {
  L_metrics: number[];
  S_metrics: number[];
  C_metrics: number[];
}

export interface OrientationThresholds {
  /** balanceIndex >= balancedThreshold is treated as balanced */
  balancedThreshold: number;
  /** dominant axis must exceed others by this delta to be overload */
  overloadDelta: number;
  /** minimum gap to consider an axis starved (0 keeps previous behavior) */
  starvedDelta: number;
}

export interface OrientationConfig {
  thresholds?: Partial<OrientationThresholds>;
}

export const DEFAULT_ORIENTATION_THRESHOLDS: OrientationThresholds = {
  balancedThreshold: 0.8,
  overloadDelta: 0.2,
  starvedDelta: 0,
};

/**
 * L0 – Orientation Core. Reads L/S/C axis metrics and returns a balance snapshot.
 */
export function computeOrientationSnapshot(
  inputs: OrientationInputs,
  config: OrientationConfig = {},
): OrientationSnapshot {
  const thresholds = { ...DEFAULT_ORIENTATION_THRESHOLDS, ...config.thresholds };

  const L_level = clamp01(avg(inputs.L_metrics));
  const S_level = clamp01(avg(inputs.S_metrics));
  const C_level = clamp01(avg(inputs.C_metrics));

  const levels = [L_level, S_level, C_level];
  const balanceIndex = clamp01(1 - variance(levels));

  const dominantAxis = pickDominantAxis(L_level, S_level, C_level);
  const starvedAxis = pickStarvedAxis(L_level, S_level, C_level);
  const mode = pickMode(L_level, S_level, C_level, balanceIndex, thresholds);

  const note =
    `L0-center: balance=${balanceIndex.toFixed(2)}, ` +
    `dominant=${dominantAxis}, starved=${starvedAxis}, mode=${mode}.`;

  return {
    L_level,
    S_level,
    C_level,
    balanceIndex,
    dominantAxis,
    starvedAxis,
    mode,
    note,
  };
}

// helpers
function avg(xs: number[]): number {
  if (!xs.length) return 0;
  const sum = xs.reduce((a, b) => a + b, 0);
  return sum / xs.length;
}

function variance(xs: number[]): number {
  const m = avg(xs);
  const v = avg(xs.map((x) => (x - m) * (x - m)));
  return Math.min(1, Math.max(0, v));
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function pickDominantAxis(L: number, S: number, C: number): OrientationSnapshot['dominantAxis'] {
  const max = Math.max(L, S, C);
  if (max === 0) return 'none';
  if (max === L) return 'L';
  if (max === S) return 'S';
  return 'C';
}

function pickStarvedAxis(L: number, S: number, C: number): OrientationSnapshot['starvedAxis'] {
  const min = Math.min(L, S, C);
  if (min === 1) return 'none';
  if (min === L) return 'L';
  if (min === S) return 'S';
  return 'C';
}

function pickMode(
  L: number,
  S: number,
  C: number,
  balanceIndex: number,
  thresholds: OrientationThresholds,
): OrientationMode {
  if (balanceIndex >= thresholds.balancedThreshold) return 'balanced';

  if (L >= S + thresholds.overloadDelta && L >= C + thresholds.overloadDelta) return 'L_overload';
  if (S >= L + thresholds.overloadDelta && S >= C + thresholds.overloadDelta) return 'S_overload';
  if (C >= L + thresholds.overloadDelta && C >= S + thresholds.overloadDelta) return 'C_overload';

  const min = Math.min(L, S, C);
  const max = Math.max(L, S, C);
  if (max - min <= thresholds.starvedDelta) return 'balanced';
  if (min === L) return 'L_starved';
  if (min === S) return 'S_starved';
  return 'C_starved';
}
