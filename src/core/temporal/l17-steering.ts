import { computeDriftScore, computeGoalAlignmentScore, computeTemporalMetastabilityIndex } from './l17-metrics';
import type {
  TemporalState,
  TimeCrystalVector,
  TemporalSteeringDecision,
  TemporalAxesState,
} from './l17-types';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

const normalizeDelta = (delta: TemporalAxesState): TemporalAxesState => {
  const maxAbs = Math.max(Math.abs(delta.inner), Math.abs(delta.social), Math.abs(delta.cosmic), 1e-6);
  const scale = Math.min(1, 0.5 / maxAbs);
  return {
    inner: delta.inner * scale,
    social: delta.social * scale,
    cosmic: delta.cosmic * scale,
  };
};

export const buildTimeCrystalVector = (state: TemporalState): TimeCrystalVector => {
  const tmi = computeTemporalMetastabilityIndex(state);
  const drift = computeDriftScore(state);
  const alignment = computeGoalAlignmentScore(state);

  if (!state.now) {
    return {
      deltaAxes: { inner: 0, social: 0, cosmic: 0 },
      targetPhase: 0.5,
      confidence: 0,
      horizonSteps: 0,
      tmi,
      drift,
      alignment,
    };
  }

  const now = state.now;
  const target = now.goalProjection?.targetAxes;
  const deltaAxes: TemporalAxesState = target
    ? {
        inner: target.inner - now.axes.inner,
        social: target.social - now.axes.social,
        cosmic: target.cosmic - now.axes.cosmic,
      }
    : { inner: 0, social: 0, cosmic: 0 };

  const normalizedDelta = normalizeDelta(deltaAxes);

  let targetPhase = now.phase;
  if (tmi.value > 2) {
    targetPhase = 0.5;
  } else if (alignment.value < 0.4 && tmi.value < 1.5) {
    targetPhase = Math.min(1, now.phase + 0.1);
  }

  const confidence = clamp01(
    (1 - Math.min(tmi.value / 3, 1)) * 0.4 + alignment.value * 0.6,
  );

  const horizonSteps = now.goalProjection?.horizonSteps ?? 5;

  return {
    deltaAxes: normalizedDelta,
    targetPhase,
    confidence,
    horizonSteps,
    tmi,
    drift,
    alignment,
  };
};

export const proposeTemporalSteeringDecision = (state: TemporalState): TemporalSteeringDecision => {
  const vector = buildTimeCrystalVector(state);
  const { tmi, drift, alignment } = vector;

  let mode: TemporalSteeringDecision['mode'] = 'consolidate';
  let warningLevel: TemporalSteeringDecision['warningLevel'] = 'low';
  let safeToAdjust = true;

  if (tmi.value > 2.5) {
    mode = 'stabilize';
    warningLevel = 'high';
    safeToAdjust = false;
  } else if (tmi.value > 1.5 || drift.value > 0.6) {
    mode = 'stabilize';
    warningLevel = 'medium';
  } else if (alignment.value < 0.4) {
    mode = 'explore';
    warningLevel = 'medium';
  }

  return {
    vector,
    safeToAdjust,
    mode,
    warningLevel,
  };
};
