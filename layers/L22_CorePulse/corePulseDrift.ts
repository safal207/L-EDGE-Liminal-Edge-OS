import {
  type CorePulseDrift,
  type CorePulseDriftContext,
  type CorePulseState,
} from "./types";

const DEFAULT_MAX_WINDOW = 6;
const STEP_TOLERANCE = 0.02;
const TREND_THRESHOLD = 0.07;
const IRREGULAR_FLIP_THRESHOLD = 0.08;

function computeSignalLevel(state: CorePulseState): number {
  const { baseline, current, overloadLevel } = state;
  const metrics = [baseline.intensity, current.intensity, current.variability, overloadLevel];
  const bounded = metrics.map((value) => Math.max(0, Math.min(1, value)));
  const average = bounded.reduce((sum, value) => sum + value, 0) / bounded.length;
  return average;
}

export function computeCorePulseDrift(ctx: CorePulseDriftContext): CorePulseDrift {
  const { history } = ctx;
  if (!history || history.length < 2) {
    return "stable";
  }

  const maxWindow = ctx.maxWindow ?? DEFAULT_MAX_WINDOW;
  const sampleSize = Math.max(2, Math.min(maxWindow, history.length));
  const window = history.slice(-sampleSize);
  const levels = window.map(computeSignalLevel);

  let increasing = true;
  let decreasing = true;
  let flips = 0;
  let lastSign = 0;

  for (let i = 1; i < levels.length; i += 1) {
    const diff = levels[i] - levels[i - 1];

    if (diff < -STEP_TOLERANCE) {
      increasing = false;
    }
    if (diff > STEP_TOLERANCE) {
      decreasing = false;
    }

    const sign = diff > IRREGULAR_FLIP_THRESHOLD ? 1 : diff < -IRREGULAR_FLIP_THRESHOLD ? -1 : 0;
    if (sign !== 0 && lastSign !== 0 && sign !== lastSign) {
      flips += 1;
    }
    if (sign !== 0) {
      lastSign = sign;
    }
  }

  const totalChange = levels[levels.length - 1] - levels[0];

  if (flips >= 2) {
    return "irregular";
  }
  if (increasing && totalChange > TREND_THRESHOLD) {
    return "rising";
  }
  if (decreasing && -totalChange > TREND_THRESHOLD) {
    return "falling";
  }

  return "stable";
}

export function analyzeCorePulseDrift(ctx: CorePulseDriftContext): CorePulseDrift {
  // Thin alias kept for readability when core pulse is consumed externally.
  return computeCorePulseDrift(ctx);
}

export function enrichPulseWithDrift(history: CorePulseState[]): CorePulseState {
  const drift = computeCorePulseDrift({ history });
  const latest = history[history.length - 1];
  return { ...latest, drift };
}
