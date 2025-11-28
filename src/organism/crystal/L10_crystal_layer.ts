import type { TriAxisState } from '@/core/types/ontogenesis';
import type {
  CrystalAdjustment,
  L10CrystalInputs,
  L10CrystalSnapshot,
} from './L10_crystal_types';

const clamp01 = (value: number): number => {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const normalizeDeviation = (deviation: number): number => clamp01(deviation / 0.5);

const computeAxisImbalance = (triAxis: TriAxisState) => {
  const levels = [triAxis.L.value, triAxis.S.value, triAxis.C.value];
  const avg = (levels[0] + levels[1] + levels[2]) / 3;

  const devL = Math.abs(triAxis.L.value - avg);
  const devS = Math.abs(triAxis.S.value - avg);
  const devC = Math.abs(triAxis.C.value - avg);

  return {
    L: normalizeDeviation(devL),
    S: normalizeDeviation(devS),
    C: normalizeDeviation(devC),
  };
};

const computeHarmony = (inputs: L10CrystalInputs) => {
  const { triAxis, metabolism } = inputs;
  const axisImbalance = computeAxisImbalance(triAxis);
  const meanImbalance = (axisImbalance.L + axisImbalance.S + axisImbalance.C) / 3;
  const metabolicTension = clamp01(metabolism.stressIndex * (1 - metabolism.recoveryScore));

  const harmonyIndex = clamp01(1 - (0.6 * meanImbalance + 0.4 * metabolicTension));

  return {
    harmonyIndex,
    axisImbalance,
    metabolicTension,
  };
};

const decideAdjustments = (inputs: L10CrystalInputs, harmonyIndex: number): CrystalAdjustment[] => {
  const { triAxis, metabolism } = inputs;
  const adjustments: CrystalAdjustment[] = [];

  if (metabolism.overloadRisk > 0.7 && harmonyIndex < 0.5) {
    adjustments.push('deep_rest');
  }

  const axisLevels = {
    L: triAxis.L.value,
    S: triAxis.S.value,
    C: triAxis.C.value,
  } as const;
  const sortedAxes = Object.entries(axisLevels).sort((a, b) => a[1] - b[1]);
  const lowestAxis = sortedAxes[0];

  if (lowestAxis[1] < 0.4) {
    adjustments.push(`support_${lowestAxis[0]}` as CrystalAdjustment);
  }

  if (axisLevels.C > 0.7 && axisLevels.S < 0.4) {
    adjustments.push('social_grounding');
  }

  if (axisLevels.S > 0.7 && axisLevels.L < 0.4) {
    adjustments.push('inner_focus');
  }

  if (harmonyIndex > 0.75 && metabolism.mode === 'normal') {
    adjustments.push('expand_cosmic');
  }

  return Array.from(new Set(adjustments));
};

export const runL10CrystalStep = (inputs: L10CrystalInputs): L10CrystalSnapshot => {
  const harmony = computeHarmony(inputs);
  const adjustments = decideAdjustments(inputs, harmony.harmonyIndex);
  const { metabolism, observerLevel } = inputs;

  const growthMomentum = clamp01(harmony.harmonyIndex * 0.5 + metabolism.recoveryScore * 0.3 + observerLevel * 0.2);
  const meanImbalance = (harmony.axisImbalance.L + harmony.axisImbalance.S + harmony.axisImbalance.C) / 3;
  const stabilityIndex = clamp01(1 - (metabolism.overloadRisk * 0.6 + meanImbalance * 0.4));

  const overallScore = clamp01(harmony.harmonyIndex * 0.4 + growthMomentum * 0.3 + stabilityIndex * 0.3);

  const note = `L10: harmony=${harmony.harmonyIndex.toFixed(2)}, growth=${growthMomentum.toFixed(2)}, stability=${stabilityIndex.toFixed(2)}, overall=${overallScore.toFixed(2)}`;

  return {
    harmony,
    growth: {
      growthMomentum,
      stabilityIndex,
      preferredAdjustments: adjustments,
    },
    overallScore,
    note,
  };
};

export type { L10CrystalSnapshot } from './L10_crystal_types';
