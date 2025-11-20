export type ExternalSignalKind =
  | 'environmentPressure'
  | 'threatDetected'
  | 'externalOpportunity'
  | 'syncLoss'
  | 'upstreamDelaySpike'
  | 'resourceRisk'
  | 'telemetry';

export interface ExternalSignal {
  id: string;
  ts: number;
  source: string;
  kind: ExternalSignalKind;
  intensity: number; // normalized 0..1
  payload?: Record<string, unknown>;
}

export type PerceptionLevel = 'calm' | 'watch' | 'alert' | 'critical';

export interface PerceptionSummary {
  pressure: number;
  threatScore: number;
  opportunityScore: number;
  noiseLevel: number;
  status: PerceptionLevel;
  lastUpdated: number;
  signalsProcessed: number;
}

export interface PerceptionState {
  summary: PerceptionSummary;
  events: ExternalSignal[];
}
