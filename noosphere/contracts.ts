import { FieldSnapshot } from '../field/contracts';
import { EmotionSnapshot } from '../emotion/contracts';
import { HomeostasisState } from '../core/homeostasisManager';
import { SelfModelSummary } from '../self/contracts';
import { PerceptionSummary } from '../perception/types';

export type WorldImprintSource = 'config' | 'model' | 'remote';
export type WorldImprintScope = 'local' | 'global';
export type WorldImprintDirection = 'past' | 'future';

export interface WorldImprintMatch {
  requiresCorridor?: boolean;
  requiresTrap?: boolean;
  requiresLoop?: boolean;
  maxStress?: number;
  minStress?: number;
  maxEntropy?: number;
  minConfidence?: number;
  minOpportunity?: number;
  threatAbove?: number;
  minVolatility?: number;
  maxVolatility?: number;
}

export interface WorldImprint {
  id: string;
  source: WorldImprintSource;
  scope: WorldImprintScope;
  direction: WorldImprintDirection;
  tags: string[];
  baseWeight?: number;
  match?: WorldImprintMatch;
}

export interface NoosphereSnapshot {
  activeImprints: Array<WorldImprint & { weight: number }>;
  dominantTag?: string;
  supportLevel: number;
  tensionLevel: number;
  lastUpdated: number;
}

export type NoosphereMode = 'supportive' | 'neutral' | 'high_tension';

export interface NoosphereReport {
  noosphere: {
    support: number;
    tension: number;
    mode: NoosphereMode;
    dominantTag?: string;
  };
  field: {
    pastEntropy: number;
    futureConfidence: number;
    topPatterns: FieldSnapshot['futureField']['candidatePatterns'];
  };
  intentHint: {
    recommendedMode: string;
    comment: string;
  };
  timestamp: number;
}

export interface NoosphereContext {
  field?: FieldSnapshot;
  self?: SelfModelSummary;
  emotion?: EmotionSnapshot;
  homeostasis?: HomeostasisState;
  perception?: PerceptionSummary;
}

export interface NoosphereState {
  snapshot: NoosphereSnapshot;
  imprints: WorldImprint[];
}

export interface NoosphereBridgeOptions {
  historyLimit?: number;
  weightFloor?: number;
}
