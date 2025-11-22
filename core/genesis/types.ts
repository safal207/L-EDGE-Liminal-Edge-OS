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
  mode: string;
  ready: GenesisSeed[];
  deferred: GenesisSeed[];
  summary: string;
}

export interface GenesisUpdateInput {
  origin: import('../origin/types').OriginState;
  pathway: import('../pathway/types').PathwayState;
  fuzzy: import('../fuzzyEvolution/types').FuzzyEvolutionState;
  tuning?: import('../resonanceTuner/types').ResonanceTuningPlan | null;
}
