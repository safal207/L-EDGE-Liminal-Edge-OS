import { ExternalSignalKind, PerceptionLevel, PerceptionSummary } from './types';

export interface PerceptionEngineOptions {
  maxHistory?: number;
  pressureWeights?: Partial<Record<ExternalSignalKind, number>>;
  threatWeights?: Partial<Record<ExternalSignalKind, number>>;
  opportunityWeights?: Partial<Record<ExternalSignalKind, number>>;
}

export interface PerceptionClassification {
  level: PerceptionLevel;
  summary: PerceptionSummary;
}
