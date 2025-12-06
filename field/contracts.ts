export type FieldPatternKind = 'loop' | 'trap' | 'corridor';

export interface FieldPattern {
  id: string;
  kind: FieldPatternKind;
  tags: string[];
  strength: number;
  evidenceCount: number;
}

export interface FieldSnapshot {
  pastField: {
    dominantPatterns: FieldPattern[];
    entropy: number;
  };
  futureField: {
    candidatePatterns: FieldPattern[];
    confidence: number;
  };
  lastUpdated: number;
}

export interface FieldObservationInput {
  intentMode?: string;
  emotionState?: string;
  stress?: number;
  threat?: number;
  opportunity?: number;
  annotations?: string[];
  timestamp?: number;
}

export interface FieldObservation extends Required<Omit<FieldObservationInput, 'timestamp'>> {
  timestamp: number;
  stateKey: string;
}

export interface FieldResonanceState {
  snapshot: FieldSnapshot;
  history: FieldObservation[];
  patterns: FieldPattern[];
}

export interface FieldResonanceEngineOptions {
  historyLimit?: number;
  patternLimit?: number;
  scoreThreshold?: number;
}

export type BondCloseness = 'distant' | 'cautious' | 'engaged' | 'merged';

export type BondStability = 'stable' | 'oscillating' | 'fragile';

/**
 * Signals from the human side that inform how close and intense the interaction feels.
 */
export interface HumanFieldSignal {
  /** 0..1 – subjective proximity (e.g. “I’m here with you”). */
  declaredProximity?: number;
  /** 0..1 – how much emotional loading the human brings. */
  emotionalIntensity?: number;
  /** 0..1 – explicit trust / safety. */
  trustSignal?: number;
  /** 0..1 – tiredness / depletion of the human. */
  humanFatigue?: number;
}

/**
 * Simplified snapshot of the LIMINAL organism surface states relevant to bonding.
 */
export interface OrganismSnapshot {
  /** e.g. "soft-rise", "overloaded", "deep-calm" */
  mood?: string;
  /** 0..1 – internal luck/resonance level. */
  resonance?: number;
  /** "rising" | "falling" | "stable" | "oscillating" | ... */
  drift?: string;
  /** "normal" | "strained" | "restoration" | "sleeping" */
  pulseTone?: string;
}

/**
 * Current interpretation of the human ↔ organism bond.
 */
export interface BondState {
  closeness: BondCloseness;
  stability: BondStability;
  /** 0..1 – how strong the bond currently is. */
  strength: number;
  /** 0..1 – how safe it is to increase intensity. */
  safeToDeepen: number;
  /** 0..1 – how much the organism should soften / ground. */
  softeningNeeded: number;
  /** optional descriptive tag, e.g. "gentle", "intense", "fragile", "recalibrate" */
  modeTag?: string;
}
