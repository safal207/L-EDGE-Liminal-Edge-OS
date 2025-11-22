import type { MetaSystemSnapshot } from '../metaOrchestrator/types';

export type OriginTone = 'warm' | 'neutral' | 'bright' | 'deep';

export interface OriginState {
  timestamp: number;
  rootVector: {
    meaning: string;
    direction: string;
    tone: OriginTone;
  };
  lineage: {
    corePrinciples: string[];
    inheritedPatterns: string[];
    resolvedPatterns: string[];
  };
  intentionCore: {
    purpose: string;
    clarity: number; // 0..1
  };
  summary: string;
}

export interface OriginConfig {
  meaning?: string;
  direction?: string;
  tone?: OriginTone;
  corePrinciples?: string[];
  inheritedPatterns?: string[];
  purpose?: string;
  resolvedPatternsLimit?: number;
}

export interface OriginUpdateInput {
  metaSnapshot: MetaSystemSnapshot;
}
