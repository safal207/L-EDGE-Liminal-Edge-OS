import { HeartbeatState } from '../core/types';
import { HomeostasisState } from '../core/homeostasisManager';
import { InteroceptionSummary } from '../interoception/contracts';
import { EmotionSnapshot } from '../emotion/contracts';
import { PerceptionSummary } from '../perception/types';
import { PlasticityState } from '../plasticity/contracts';
import { SocialResonanceSummary } from '../social/contracts';
import { IntentState } from '../intent/types';
import { ReflexAction, ReflexEvent, ReflexState } from '../reflex/types';
import { MetaState } from '../meta/types';

export interface EpisodeContext {
  heartbeat?: HeartbeatState;
  homeostasis: HomeostasisState;
  interoception: InteroceptionSummary;
  emotion: EmotionSnapshot;
  perception: PerceptionSummary;
  plasticity?: PlasticityState;
  social?: SocialResonanceSummary;
  intent?: IntentState;
  reflex?: ReflexState;
  meta?: MetaState;
}

export interface EpisodeOutcome {
  stressDelta: number;
  homeostasisScore: number;
  emotionScore: number;
  socialScore?: number;
}

export interface Episode {
  id: string;
  timestamp: number;
  context: EpisodeContext;
  intent: IntentState['decision'] | null;
  reflexes: (ReflexEvent | ReflexAction)[];
  outcome: EpisodeOutcome;
}

export interface IdentityTraits {
  riskTaking: number;
  calmRecovery: number;
  patternSeeking: number;
  avoidantUnderLoad: number;
  socialOrientation: number;
  reflexReliance: number;
  exploration: number;
}

export interface NarrativeArc {
  id: string;
  label: string;
  occurrences: number;
  lastSeen: number;
  confidence: number;
}

export interface SelfModelState {
  episodes: Episode[];
  traits: IdentityTraits;
  arcs: NarrativeArc[];
  identitySummary: string;
  lastUpdated: number;
  volatility: number;
}

export interface SelfModelSummary {
  traits: IdentityTraits;
  identitySummary: string;
  arcCount: number;
  lastUpdated: number;
  volatility: number;
}

export interface SelfModelEngineOptions {
  maxHistory?: number;
  traitDecay?: number;
}

export interface SelfModelContext extends EpisodeContext {}
