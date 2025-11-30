import type {
  DriftScore,
  GoalAlignmentScore,
  TemporalMetastabilityIndex,
  TemporalSnapshot,
  TemporalState,
} from './l17-types';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

const takeLastSnapshots = (past: TemporalSnapshot[], count: number): TemporalSnapshot[] => {
  if (past.length <= count) return past;
  return past.slice(-count);
};

export const computeDriftScore = (state: TemporalState): DriftScore => {
  const window = takeLastSnapshots(state.past, 5);
  if (!state.now || window.length === 0) {
    return { value: 0 };
  }

  let totalDelta = 0;
  let steps = 0;

  for (let i = 1; i < window.length; i += 1) {
    const prev = window[i - 1].axes;
    const curr = window[i].axes;
    const dInner = Math.abs(curr.inner - prev.inner);
    const dSocial = Math.abs(curr.social - prev.social);
    const dCosmic = Math.abs(curr.cosmic - prev.cosmic);
    totalDelta += (dInner + dSocial + dCosmic) / 3;
    steps += 1;
  }

  const avgDelta = steps > 0 ? totalDelta / steps : 0;
  return { value: clamp01(avgDelta) };
};

export const computeGoalAlignmentScore = (state: TemporalState): GoalAlignmentScore => {
  const now = state.now;
  if (!now || !now.goalProjection) {
    return { value: 0.5 };
  }

  const target = now.goalProjection.targetAxes;
  const current = now.axes;

  const dInner = Math.abs(target.inner - current.inner);
  const dSocial = Math.abs(target.social - current.social);
  const dCosmic = Math.abs(target.cosmic - current.cosmic);

  const avgDelta = (dInner + dSocial + dCosmic) / 3;
  return { value: clamp01(1 - avgDelta) };
};

export const computeTemporalMetastabilityIndex = (
  state: TemporalState,
): TemporalMetastabilityIndex => {
  const now = state.now;
  if (!now) {
    return {
      value: 0,
      stabilityComponent: 0,
      driftComponent: 0,
      feelingComponent: 0,
    };
  }

  const drift = computeDriftScore(state).value;
  const instability = clamp01(1 - now.stability);
  const recoveryComponent = clamp01(now.recoveryTime / 10000);
  const stabilityComponent = clamp01((instability + recoveryComponent) / 2);
  const feelingComponent = clamp01(now.feeling.intensity);

  const raw = 0.4 * stabilityComponent + 0.3 * drift + 0.3 * feelingComponent;

  return {
    value: raw * 3,
    stabilityComponent,
    driftComponent: drift,
    feelingComponent,
  };
};
