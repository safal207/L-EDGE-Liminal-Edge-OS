export interface AxisPolarity {
  yin: number; // 0..1 — integration, rest, reflection
  yang: number; // 0..1 — action, expression, activity
  ratio: number; // yin / (yang + eps)
  tau: number; // 0..1 — "gray state" strength when yin and yang are balanced
  state: 'yin-dominant' | 'yang-dominant' | 'tau-zone';
}

export interface PolaritySnapshot {
  L: AxisPolarity;
  S: AxisPolarity;
  C: AxisPolarity;
  /**
   * Average yin/yang ratio across axes. >1 leans yin, <1 leans yang.
   */
  globalRatio: number;
  /** Normalized drift in -1..1 (negative = yang-leaning, positive = yin-leaning). */
  yinYangDrift: number;
  /**
   * Average tau across axes. Higher means the organism is more often in the gray state
   * where yin ~= yang.
   */
  globalTau: number;
  /** Semantic alias for globalTau to highlight maturation of the gray-state capacity. */
  tauMaturityIndex: number;
  note: string;
}

export interface PolarityInputs {
  L_yinSignals: number[];
  L_yangSignals: number[];
  S_yinSignals: number[];
  S_yangSignals: number[];
  C_yinSignals: number[];
  C_yangSignals: number[];
}

const EPS = 1e-6;

export function computePolaritySnapshot(inputs: PolarityInputs): PolaritySnapshot {
  const L = computeAxisPolarity(inputs.L_yinSignals, inputs.L_yangSignals);
  const S = computeAxisPolarity(inputs.S_yinSignals, inputs.S_yangSignals);
  const C = computeAxisPolarity(inputs.C_yinSignals, inputs.C_yangSignals);

  const ratios = [L.ratio, S.ratio, C.ratio];
  const taus = [L.tau, S.tau, C.tau];
  const globalRatio = avg(ratios);
  const yinYangDrift = clampMinus1to1(Math.log2(globalRatio || 1));
  const globalTau = avg(taus);
  const tauMaturityIndex = globalTau;

  const note =
    `Polarity: ` +
    `L(r=${L.ratio.toFixed(2)},τ=${L.tau.toFixed(2)},${L.state}) ` +
    `S(r=${S.ratio.toFixed(2)},τ=${S.tau.toFixed(2)},${S.state}) ` +
    `C(r=${C.ratio.toFixed(2)},τ=${C.tau.toFixed(2)},${C.state}); ` +
    `globalRatio=${globalRatio.toFixed(2)}, ` +
    `drift=${yinYangDrift.toFixed(2)}, ` +
    `globalTau=${globalTau.toFixed(2)}.`;

  return { L, S, C, globalRatio, yinYangDrift, globalTau, tauMaturityIndex, note };
}

function computeAxisPolarity(yinSignals: number[], yangSignals: number[]): AxisPolarity {
  const yin = clamp01(avg(yinSignals));
  const yang = clamp01(avg(yangSignals));
  const ratio = (yin + EPS) / (yang + EPS);
  const drift = Math.log2(ratio || 1);
  const tau = clamp01(1 - Math.min(1, Math.abs(drift)));

  let state: AxisPolarity['state'];
  if (tau >= 0.7) {
    state = 'tau-zone';
  } else if (ratio > 1) {
    state = 'yin-dominant';
  } else {
    state = 'yang-dominant';
  }

  return { yin, yang, ratio, tau, state };
}

function avg(xs: number[]): number {
  if (!xs.length) return 0;
  const sum = xs.reduce((a, b) => a + b, 0);
  return sum / xs.length;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function clampMinus1to1(x: number): number {
  return Math.min(1, Math.max(-1, x));
}
