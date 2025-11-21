import { HomeostasisState } from '../core/homeostasisManager';
import { EmotionSnapshot } from '../emotion/contracts';
import { IntentState } from '../intent/types';
import { InteroceptionState } from '../interoception/contracts';
import { MetaState } from '../meta/types';
import { PerceptionSummary } from '../perception/types';

export type SocialRecommendationAction = 'align' | 'detach' | 'observe' | 'amplify' | 'shield';

export interface SocialRecommendation {
  action: SocialRecommendationAction;
  priority: number;
  reason: string;
  targetPeerId?: string;
}

export interface SelfResonance {
  score: number;
  coherence: number;
  tension: number;
  annotations: string[];
}

export interface FieldResonance {
  pressure: number;
  opportunity: number;
  dissonance: number;
  status: 'calm' | 'charged' | 'overloaded';
}

export interface PeerResonance {
  id: string;
  alignment: number;
  syncPotential: number;
  tension: number;
  lastSeen: number;
  tags: string[];
}

export interface SocialResonanceSummary {
  selfResonance: SelfResonance;
  peerResonance: PeerResonance[];
  fieldResonance: FieldResonance;
  recommendation: SocialRecommendation;
  lastUpdated: number;
}

export interface SocialResonanceState {
  summary: SocialResonanceSummary;
  peers: PeerResonance[];
  history: SocialResonanceSummary[];
}

export interface PeerSnapshotInput {
  id: string;
  alignment?: number;
  syncPotential?: number;
  tension?: number;
  lastSeen?: number;
  tags?: string[];
}

export interface SocialResonanceContext {
  homeostasis?: HomeostasisState;
  emotion?: EmotionSnapshot;
  intent?: IntentState;
  perception?: PerceptionSummary;
  interoception?: InteroceptionState['summary'];
  meta?: MetaState;
  peers?: PeerSnapshotInput[];
}

export interface SocialResonanceEngineOptions {
  maxHistory?: number;
  maxPeers?: number;
}
