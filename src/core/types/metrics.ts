export type ScalarMetricDirection = 'good-up' | 'good-down' | 'neutral';

export interface ScalarMetric {
  id: string;
  label: string;
  value: number; // 0..1
  direction: ScalarMetricDirection;
}

export interface MetricBundle {
  groupId: string;
  metrics: ScalarMetric[];
}
import type { MetabolicSnapshot } from '@/organism/metabolism/L9_metabolic_layer';
import type { L10CrystalSnapshot } from '@/organism/crystal/L10_crystal_types';

const clamp01 = (value: number): number => {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

export const metabolismToMetricBundle = (metabolic: MetabolicSnapshot): MetricBundle => {
  return {
    groupId: 'metabolism',
    metrics: [
      {
        id: 'stressIndex',
        label: 'Stress Index',
        value: clamp01(metabolic.stressIndex),
        direction: 'good-down',
      },
      {
        id: 'recoveryScore',
        label: 'Recovery Score',
        value: clamp01(metabolic.recoveryScore),
        direction: 'good-up',
      },
      {
        id: 'overloadRisk',
        label: 'Overload Risk',
        value: clamp01(metabolic.overloadRisk),
        direction: 'good-down',
      },
    ],
  };
};

export const crystalToMetricBundle = (crystal: L10CrystalSnapshot): MetricBundle => {
  return {
    groupId: 'crystal',
    metrics: [
      {
        id: 'harmonyIndex',
        label: 'Harmony',
        value: clamp01(crystal.harmony.harmonyIndex),
        direction: 'good-up',
      },
      {
        id: 'growthMomentum',
        label: 'Growth Momentum',
        value: clamp01(crystal.growth.growthMomentum),
        direction: 'good-up',
      },
      {
        id: 'stabilityIndex',
        label: 'Stability',
        value: clamp01(crystal.growth.stabilityIndex),
        direction: 'good-up',
      },
      {
        id: 'overallScore',
        label: 'Overall Score',
        value: clamp01(crystal.overallScore),
        direction: 'good-up',
      },
    ],
  };
};
