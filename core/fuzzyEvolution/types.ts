import type { MetaSystemSnapshot } from '../metaOrchestrator/types';
import type { OriginState } from '../origin/types';
import type { PathwayState } from '../pathway/types';

export interface FuzzyLevel {
  low: number;
  medium: number;
  high: number;
}

export type StringMode = 'ground' | 'resonant' | 'chaotic' | 'damped';

export interface FuzzyPressure {
  tension: FuzzyLevel;
  coherence: FuzzyLevel;
  alignment: FuzzyLevel;
}

export interface StringFieldState {
  globalMode: StringMode;
  comment: string;
}

export interface FuzzySuggestion {
  id: string;
  message: string;
  severity: 'soft' | 'medium' | 'strong';
}

export interface FuzzyEvolutionState {
  timestamp: number;
  cyclesObserved: number;
  pressure: FuzzyPressure;
  strings: StringFieldState;
  suggestions: FuzzySuggestion[];
  summary: string;
}

export interface FuzzyEvolutionHistory {
  meta: MetaSystemSnapshot[];
  origin: OriginState[];
  pathway: PathwayState[];
}

export interface FuzzyEvolutionUpdateInput {
  meta: MetaSystemSnapshot;
  origin: OriginState;
  pathway: PathwayState;
}

export interface FuzzyEvolutionConfig {
  maxHistory?: number;
}
