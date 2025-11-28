export type ExternalSignalSource =
  | 'network'
  | 'storage'
  | 'sensor'
  | 'llm_backend'
  | 'user_activity'
  | 'system';

export interface ExternalSignal {
  source: ExternalSignalSource;
  kind: string;
  intensity: number;
  stressImpact?: number;
  recoveryImpact?: number;
  explorationImpact?: number;
  metrics?: Record<string, number>;
  tags?: Record<string, string>;
  timestamp: number;
}

export interface ExternalSignalsAggregate {
  externalStress: number;
  externalRecovery: number;
  externalExploration: number;
  lastStrongSignal?: ExternalSignal;
}
