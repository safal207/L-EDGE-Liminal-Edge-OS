export type GrowthMode =
  | 'gentle'
  | 'intensive'
  | 'therapeutic'
  | 'stabilizing'
  | 'exploratory'
  | 'frozen';

export type GrowthModeReason =
  | 'balanced_low_stress'
  | 'high_growth_capacity'
  | 'needs_deep_recovery'
  | 'stability_priority'
  | 'room_for_exploration'
  | 'overload_or_chaos';

export interface GrowthModeRecommendations {
  throttle?: boolean;
  pauseNonCritical?: boolean;
  preferAsync?: boolean;
  preferShortTasks?: boolean;
  allowExploration?: boolean;
}

export interface GrowthModeSnapshot {
  mode: GrowthMode;
  confidence: number; // 0..1
  reason: GrowthModeReason;
  recommendations?: GrowthModeRecommendations;
}
