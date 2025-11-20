export type PerceptionSignalType = 'telemetry' | 'alert' | 'anomaly' | 'noise' | 'event';

export interface PerceptionSignal {
  id: string;
  ts: number;
  source: string;
  type: PerceptionSignalType;
  intensity: number; // normalized 0..1
  payload?: Record<string, unknown>;
}

export type PerceptionStatus = 'ok' | 'noisy' | 'degraded' | 'critical';

export interface PerceptionSnapshot {
  noiseLevel: number;
  signalLevel: number;
  anomalies: number;
  signalsProcessed: number;
  status: PerceptionStatus;
  lastUpdated: number;
}
