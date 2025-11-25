export interface AxisPolarity {
  yin: number; // 0..1 — integration, rest, reflection
  yang: number; // 0..1 — action, expression, activity
  ratio: number; // yin / (yang + eps)
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
  const globalRatio = avg(ratios);
  const yinYangDrift = clampMinus1to1(Math.log2(globalRatio || 1));

  const note =
    `Polarity: L=${L.ratio.toFixed(2)} S=${S.ratio.toFixed(2)} C=${C.ratio.toFixed(2)}, ` +
    `globalRatio=${globalRatio.toFixed(2)}, drift=${yinYangDrift.toFixed(2)}.`;

  return { L, S, C, globalRatio, yinYangDrift, note };
}

function computeAxisPolarity(yinSignals: number[], yangSignals: number[]): AxisPolarity {
  const yin = clamp01(avg(yinSignals));
  const yang = clamp01(avg(yangSignals));
  const ratio = (yin + EPS) / (yang + EPS);
  return { yin, yang, ratio };
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
