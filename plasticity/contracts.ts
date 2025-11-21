import { HomeostasisState } from '../core/homeostasisManager';
import { ReflexState } from '../reflex/types';
import { EmotionState } from '../emotion/contracts';
import { IntentState } from '../intent/types';
import { SocialResonanceState } from '../social/contracts';
import { PerceptionSummary } from '../perception/types';
import { InteroceptionState } from '../interoception/contracts';
import { MetaState } from '../meta/types';
import { IntentDecision } from '../intent/types';

type PlasticityStatus = 'learning' | 'stable';

export interface PlasticityContext {
  homeostasis: HomeostasisState;
  reflex: ReflexState;
  intent: IntentState;
  emotion?: EmotionState;
  social?: SocialResonanceState;
  perception?: PerceptionSummary;
  interoception?: InteroceptionState;
  meta?: MetaState;
}

export interface AdaptationEpisode {
  ts: number;
  stressBefore: number;
  stressAfter: number;
  reflexDelta: number;
  intentMode: string;
  emotionState?: string;
  socialCoherence?: number;
  outcome: number;
  note?: string;
}

export interface AdaptationSuggestions {
  stressSensitivity: number;
  reflexPriorityBias: number;
  intentBias: {
    HEALING: number;
    FOCUSED: number;
    DEGRADED: number;
  };
  perceptionNoiseTolerance: number;
  notes: string[];
}

export interface PlasticityState {
  episodes: AdaptationEpisode[];
  suggestions: AdaptationSuggestions;
  status: PlasticityStatus;
  lastUpdated: number;
  volatility: number;
}

export interface PlasticityEngineOptions {
  maxHistory?: number;
}

export interface AdaptedIntentDecision {
  decision: IntentDecision;
  adapted: boolean;
  appliedBias?: string;
}
