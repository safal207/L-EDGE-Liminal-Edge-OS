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
