export type ActionScope =
  | 'system'
  | 'network'
  | 'storage'
  | 'llm_runtime'
  | 'ui'
  | 'scheduling';

export type ActionKind =
  | 'throttle'
  | 'pause_non_critical'
  | 'resume_normal'
  | 'open_exploration_window'
  | 'close_exploration_window'
  | 'stabilize'
  | 'enter_recovery_mode'
  | 'enter_intensive_mode'
  | 'log_and_observe'
  | 'escalate_attention';

export type ActionUrgency = 'low' | 'normal' | 'high' | 'critical';

export type ActionStrength =
  | 'hint'
  | 'soft_recommendation'
  | 'strong_recommendation'
  | 'hard_limit';

export interface ActionIntent {
  id: string;
  scope: ActionScope;
  kind: ActionKind;
  urgency: ActionUrgency;
  strength: ActionStrength;
  confidence: number;
  reasonKey:
    | 'overload_risk'
    | 'deep_recovery_needed'
    | 'good_growth_window'
    | 'need_stability'
    | 'external_noise'
    | 'user_focus'
    | 'baseline_health_check'
    | 'unknown';
  params?: Record<string, number | string | boolean>;
  ttlMs?: number;
  tags?: Record<string, string>;
}

export interface ResponseFrame {
  timestamp: number;
  stage: number;
  growthMode?: string;
  overloadRisk?: number;
  harmonyIndex?: number;
  intents: ActionIntent[];
}
