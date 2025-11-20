import { PerceptionStatus } from '../perception/types';

export type MemorySource =
  | 'circulation'
  | 'reflex'
  | 'sleep'
  | 'perception'
  | 'runtime'
  | 'edge'
  | 'homeostasis'
  | 'replay'
  | 'external';

export interface MemoryEvent {
  id: string;
  ts: number;
  source: MemorySource | string;
  type: string;
  intensity?: number; // normalized 0..1
  payload?: Record<string, unknown>;
}

export interface MemorySnapshot {
  id: string;
  ts: number;
  summary: string;
  dominantSources: string[];
  eventTypes: Record<string, number>;
  volume: number;
  lastEventAt?: number;
  averageIntensity?: number;
  stressScore?: number;
}

export interface MemoryState {
  shortTerm: MemoryEvent[];
  longTerm: MemorySnapshot[];
  lastConsolidatedAt: number;
  shortTermLimit: number;
  status: MemoryStatus;
}

export type MemoryStatus = 'idle' | 'learning' | 'consolidating' | 'saturated';

export interface RecallCriteria {
  source?: MemorySource | string;
  type?: string;
  since?: number;
  text?: string;
}

export interface RecallResult {
  events: MemoryEvent[];
  snapshots: MemorySnapshot[];
}

export interface MemoryPerceptionBridge {
  perceptionStatus: PerceptionStatus;
  anomalies: number;
  noiseLevel: number;
}
