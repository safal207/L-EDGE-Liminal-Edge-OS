import type { TriAxisState } from '@/core/types/ontogenesis';

export interface CrystalHarmony {
  harmonyIndex: number;
  axisImbalance: {
    L: number;
    S: number;
    C: number;
  };
  metabolicTension: number;
}

export type CrystalAdjustment =
  | 'support_L'
  | 'support_S'
  | 'support_C'
  | 'slowdown_L'
  | 'slowdown_S'
  | 'slowdown_C'
  | 'deep_rest'
  | 'expand_cosmic'
  | 'social_grounding'
  | 'inner_focus';

export interface CrystalGrowthVector {
  growthMomentum: number;
  stabilityIndex: number;
  preferredAdjustments: CrystalAdjustment[];
}

export interface L10CrystalSnapshot {
  harmony: CrystalHarmony;
  growth: CrystalGrowthVector;
  overallScore: number;
  note?: string;
}

export interface L10CrystalInputs {
  triAxis: TriAxisState;
  stage: number;
  metabolism: {
    stressIndex: number;
    recoveryScore: number;
    overloadRisk: number;
    mode: 'normal' | 'recovery' | 'deep_recovery' | 'overload';
  };
  observerLevel: number;
}
