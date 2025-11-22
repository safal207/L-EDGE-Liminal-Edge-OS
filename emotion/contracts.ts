import { HomeostasisState } from '../core/homeostasisManager';
import { InteroceptionState } from '../interoception/contracts';
import { MetaState } from '../meta/types';
import { PerceptionSummary } from '../perception/types';
import { ReflexState } from '../reflex/types';
import { IntentState } from '../intent/types';
import { ReplayState } from '../replay/types';

export type EmotionKind =
  | 'calmReady'
  | 'focusThreat'
  | 'exploreOpportunity'
  | 'overloadProtect'
  | 'recovering'
  | 'alert'
  | 'expanding'
  | 'contracting';

export interface EmotionSnapshot {
  state: EmotionKind;
  confidence: number;
  contributors: {
    tension: number;
    threat: number;
    opportunity: number;
    fatigue: number;
    readiness: number;
  };
  annotations: string[];
  volatility: number;
  lastUpdated: number;
}

export interface EmotionState {
  current: EmotionSnapshot;
  history: EmotionSnapshot[];
}

export interface EmotionContext {
  homeostasis: HomeostasisState;
  interoception?: InteroceptionState;
  reflex?: ReflexState;
  perception?: PerceptionSummary;
  intent?: IntentState;
  meta?: MetaState;
  replay?: ReplayState;
}

export interface EmotionEngineOptions {
  maxHistory?: number;
}
