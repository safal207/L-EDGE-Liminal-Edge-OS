export type ReflexSeverity = 'info' | 'warning' | 'critical';

export interface ReflexEvent {
  id: string;
  ts: number;
  source: 'homeostasis' | 'heartbeat' | 'runtime' | 'circulation' | 'external';
  kind: string;
  details?: Record<string, unknown>;
}

export interface ReflexAction {
  id: string;
  ts: number;
  severity: ReflexSeverity;
  reason: string;
  commands: {
    throttleEdge?: boolean;
    forceSleep?: boolean;
    boostTransmutation?: boolean;
    openDegradedMode?: boolean;
  };
}

export interface ReflexState {
  lastEvents: ReflexEvent[];
  lastActions: ReflexAction[];
}
