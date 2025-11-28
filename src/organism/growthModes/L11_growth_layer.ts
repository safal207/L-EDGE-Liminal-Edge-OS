import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import type {
  GrowthMode,
  GrowthModeSnapshot,
  GrowthModeRecommendations,
  GrowthModeReason,
} from './L11_growth_types';

const clamp01 = (value: number): number => {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const pickReasonConfidence = (score: number, stability: number): number => {
  return clamp01((score * 0.6 + stability * 0.4) || 0);
};

const baseRecommendations = (mode: GrowthMode, overloadRisk: number): GrowthModeRecommendations => {
  switch (mode) {
    case 'frozen':
      return { throttle: true, pauseNonCritical: true, preferShortTasks: true, preferAsync: true };
    case 'therapeutic':
      return { throttle: true, pauseNonCritical: true, preferShortTasks: true };
    case 'stabilizing':
      return { throttle: true, preferShortTasks: true };
    case 'exploratory':
      return { allowExploration: true, preferAsync: true };
    case 'intensive':
      return overloadRisk > 0.4
        ? { throttle: true, preferShortTasks: true }
        : { allowExploration: true };
    case 'gentle':
    default:
      return { allowExploration: true };
  }
};

const computeConfidence = (
  mode: GrowthMode,
  {
    stress,
    recovery,
    harmony,
    growth,
    stability,
    overload,
  }: {
    stress: number;
    recovery: number;
    harmony: number;
    growth: number;
    stability: number;
    overload: number;
  },
): number => {
  switch (mode) {
    case 'frozen':
      return clamp01((overload * 0.7 + (1 - harmony) * 0.3) || 0);
    case 'therapeutic':
      return clamp01(((overload + (1 - recovery)) / 2) || 0);
    case 'exploratory':
      return clamp01(((harmony + growth + recovery) / 3) || 0);
    case 'intensive':
      return clamp01(((growth + harmony + stability) / 3) || 0);
    case 'stabilizing':
      return clamp01(((stability + harmony + (1 - overload)) / 3) || 0);
    case 'gentle':
    default:
      return clamp01(((1 - stress) + recovery + harmony) / 3);
  }
};

const decideReason = (mode: GrowthMode, fallback: GrowthModeReason): GrowthModeReason => {
  switch (mode) {
    case 'gentle':
      return 'balanced_low_stress';
    case 'intensive':
      return 'high_growth_capacity';
    case 'therapeutic':
      return 'needs_deep_recovery';
    case 'stabilizing':
      return 'stability_priority';
    case 'exploratory':
      return 'room_for_exploration';
    case 'frozen':
      return 'overload_or_chaos';
    default:
      return fallback;
  }
};

export const decideGrowthMode = (snapshot: OrganismSnapshot): GrowthModeSnapshot => {
  const stress = snapshot.metabolism?.stressIndex ?? 0.5;
  const recovery = snapshot.metabolism?.recoveryScore ?? 0.5;
  const overload = snapshot.metabolism?.overloadRisk ?? 0.5;
  const harmony = snapshot.crystal?.harmony.harmonyIndex ?? 0.5;
  const growthMomentum = snapshot.crystal?.growth.growthMomentum ?? 0.5;
  const stability = snapshot.crystal?.growth.stabilityIndex ?? 0.5;
  const overall = snapshot.crystal?.overallScore ?? (harmony + growthMomentum + stability) / 3;

  let mode: GrowthMode = 'gentle';
  let reason: GrowthModeReason = 'balanced_low_stress';

  if (overload > 0.8 || harmony < 0.3) {
    mode = 'frozen';
    reason = 'overload_or_chaos';
  } else if (recovery < 0.4 && overload > 0.5) {
    mode = 'therapeutic';
    reason = 'needs_deep_recovery';
  } else if (harmony > 0.7 && growthMomentum > 0.65 && recovery >= 0.5) {
    if (stress < 0.45 && overload < 0.4) {
      mode = 'exploratory';
      reason = 'room_for_exploration';
    } else {
      mode = 'intensive';
      reason = 'high_growth_capacity';
    }
  } else if (stability < 0.45 || overload > 0.6) {
    mode = 'stabilizing';
    reason = 'stability_priority';
  } else if (stress < 0.45 && overload < 0.4) {
    mode = 'gentle';
    reason = 'balanced_low_stress';
  }

  const confidence = computeConfidence(mode, {
    stress,
    recovery,
    harmony,
    growth: growthMomentum,
    stability,
    overload,
  });

  const recommendations = baseRecommendations(mode, overload);

  return {
    mode,
    confidence: pickReasonConfidence(confidence, overall),
    reason: decideReason(mode, reason),
    recommendations,
  };
};
