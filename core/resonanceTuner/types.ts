export type TuningTarget =
  | 'load'
  | 'field'
  | 'memory'
  | 'growth'
  | 'rest'
  | 'exploration';

export type TuningDirection = 'increase' | 'decrease' | 'stabilize' | 'pause';

export interface TuningAction {
  id: string;
  target: TuningTarget;
  direction: TuningDirection;
  intensity: 'soft' | 'medium' | 'strong';
  rationale: string;
}

export type GlobalMode = 'deep_rest' | 'integration' | 'steady_growth' | 'rapid_expansion' | 'careful_exploration';

export interface ResonanceTuningPlan {
  timestamp: number;
  mode: GlobalMode;
  actions: TuningAction[];
  summary: string;
}

export interface ResonanceTunerConfig {
  idPrefix?: string;
}
