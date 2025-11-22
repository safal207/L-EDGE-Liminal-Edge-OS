export type SeedKind =
  | 'soma_cell'
  | 'metric_probe'
  | 'resonance_agent'
  | 'memory_trace'
  | 'integration_task';

export interface GenesisSeed {
  id: string;
  kind: SeedKind;
  priority: 'low' | 'medium' | 'high';
  reason: string;
  suggestedShape: string;
}

export interface GenesisPlan {
  timestamp: number;
  ready: GenesisSeed[];
  deferred: GenesisSeed[];
  summary: string;
}
