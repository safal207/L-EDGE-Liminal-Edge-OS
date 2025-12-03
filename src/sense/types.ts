export interface SenseInput {
  userText?: string;
  timestamp: number;
  userId?: string;
  tokensCount?: number;
  avgSentenceLength?: number;
  previousStates?: SenseState[];
  contextTags?: string[];
  activeLayers?: string[];
  entropyLevel?: number;
}

export interface EmotionalGradient {
  calm: number;
  tension: number;
  curiosity: number;
  fatigue: number;
  uplift: number;
  groundedness: number;
  focus: number;
  confidence: number;
}

export type TemporalDrift = 'stable' | 'rising' | 'falling' | 'oscillating';

export interface LuckResonance {
  resonance: number;
  phase: 'neutral' | 'opening' | 'closing';
}

export interface SystemReflection {
  loadLevel: number;
  integrationHealth: number;
  suggestedMode: 'ground' | 'expand' | 'reflect';
}

export interface SenseState {
  mood: string;
  emotionalGradient: EmotionalGradient;
  drift: TemporalDrift;
  luck: LuckResonance;
  reflection: SystemReflection;
  readiness: 'low' | 'medium' | 'high';
  suggestion: 'grounding' | 'gentle-expansion' | 'deep-reflection' | 'stabilize' | 'open-window';
}

export interface ReceptorSignals {
  tokenEstimate: number;
  questionMarks: number;
  ellipsisCount: number;
  exclamationCount: number;
  fatigueHints: number;
  positiveHints: number;
  uncertaintyHints: number;
  ideaBursts: number;
  sentenceLength: number;
}
