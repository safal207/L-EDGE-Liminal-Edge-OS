export type FlowQuality = "low" | "medium" | "high";

export type LuckTiming = "now" | "soon" | "later";

export type CooperativeMode = "solo" | "team" | "clustered";

export type FlowMode = "stabilize" | "explore" | "push" | "pivot" | "slow_down";

export interface L21FlowDashboardPayload {
  flow_alignment: {
    value: number; // 0..1
    quality: FlowQuality;
  };
  luck_window: {
    isOpen: boolean;
    openness: number; // 0..1
    timing: LuckTiming;
  };
  cooperative_field: {
    score: number; // 0..1
    mode: CooperativeMode;
  };
  flow_suggestion: {
    mode: FlowMode;
    confidence: number; // 0..1
  };
  flow_explain: string[];
  decision_before_flow?: {
    top_candidate: string;
    score: number;
  };
  decision_after_flow?: {
    top_candidate: string;
    score: number;
  };
  decision_delta_score?: number;
}

export interface L21FlowAlignmentState {
  alignment: {
    fai: number;
    quality: FlowQuality;
    inner_alignment?: number;
    social_alignment?: number;
    cosmic_alignment?: number;
    phase_fit?: number;
    context_fit?: number;
  };
  luck_window: {
    is_open: boolean;
    strength?: number;
    openness?: number;
    expected_duration_steps?: number;
    recommended_mode?: FlowMode;
    timing?: LuckTiming;
  };
  cooperative_field: {
    score: number;
    mode: CooperativeMode;
    cohesion?: number;
    spacing?: number;
    passing_lanes?: number;
    conflict_level?: number;
  };
  flow_suggestion: {
    mode: FlowMode;
    confidence: number;
    explain?: string[];
  };
  flow_explain?: string[];
}

export interface DecisionSummary {
  top_candidate: string;
  score: number;
}
