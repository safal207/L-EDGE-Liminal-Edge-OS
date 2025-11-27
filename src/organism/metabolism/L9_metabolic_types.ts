import type { AxisId, TriAxisState } from '@/core/types/ontogenesis';

export type MetabolicMode = 'normal' | 'overload' | 'recovery' | 'deep_recovery';

export interface AxisMetabolicState {
  axisId: AxisId;
  energy: number; // 0..1 — доступный ресурс
  stress: number; // 0..1 — перегрузка по оси
  recovery: number; // 0..1 — восстановление по оси
}

export interface MetabolicSnapshot {
  mode: MetabolicMode;

  totalEnergy: number; // 0..1
  totalStress: number; // 0..1
  totalRecovery: number; // 0..1

  axes: AxisMetabolicState[];

  overloadAxes: AxisId[];
  recommendedSlowdown: boolean;
  recommendedDeepRest: boolean;

  note?: string;
}

export interface MetabolicInputs {
  triAxis: TriAxisState;
  loadIndex: number; // 0..1
  resonanceQuality?: number; // 0..1
  recentRecoveryIndex?: number; // 0..1
}
