import { MetaObservation, StressTrend } from './types';

export const computeStressTrend = (observations: MetaObservation[], window = 5): StressTrend => {
  if (observations.length < 2) return 'stable';
  const slice = observations.slice(-Math.max(2, window));
  const mid = Math.floor(slice.length / 2);
  const first = slice.slice(0, mid);
  const last = slice.slice(mid);
  const firstAvg = average(first.map((o) => o.stressScore));
  const lastAvg = average(last.map((o) => o.stressScore));
  const delta = lastAvg - firstAvg;
  if (delta > 0.05) return 'rising';
  if (delta < -0.05) return 'falling';
  return 'stable';
};

export const computeReflexFrequency = (observations: MetaObservation[], window = 6): number => {
  if (!observations.length) return 0;
  const slice = observations.slice(-Math.max(1, window));
  const totalActions = slice.reduce((sum, obs) => sum + obs.reflexActions, 0);
  return totalActions / slice.length;
};

export const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));

const average = (values: number[]): number => {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};
