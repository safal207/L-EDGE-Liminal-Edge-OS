import type { FuzzyLevel, StringMode } from '../fuzzyEvolution/types';

export type CivAgentKind = 'human' | 'team' | 'organization' | 'ai_agent' | 'service';

export type CivRelation = 'ally' | 'neutral' | 'opponent' | 'host' | 'unknown';

export interface CivAgent {
  id: string;
  name: string;
  kind: CivAgentKind;
  relation: CivRelation;
  resonance: FuzzyLevel;
  trust?: number;
  tension?: number;
  note?: string;
}

export interface CivilizationResonance {
  globalMode: StringMode;
  alliesCount: number;
  opponentsCount: number;
  neutralCount: number;
  comment: string;
}

export interface CivilizationState {
  timestamp: number;
  agents: CivAgent[];
  resonance: CivilizationResonance;
  summary: string;
}
