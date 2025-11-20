import { HomeostasisState } from '../core/homeostasisManager';
import { SleepMetrics } from '../sleep/sleepCycle';
import { ReplayState } from '../replay/types';
import { ReflexState } from '../reflex/types';
import { IntentState } from '../intent/types';
import { TransmutationMetrics } from '../transmutation/contracts';
import { EmotionState } from '../emotion/contracts';

export type StressTrend = 'rising' | 'falling' | 'stable';
export type AdaptationPhase = 'steady-state' | 'escalation' | 'recovery';

export interface MetaObservation {
  ts: number;
  stressScore: number;
  intentMode: string;
  reflexActions: number;
  replayRelief: number;
  sleepRestoration: number;
}

export interface MetaSummary {
  coherence: number;
  stressTrend: StressTrend;
  adaptationPhase: AdaptationPhase;
  dominantIntent: string;
  anomalies: string[];
  lastUpdated: number;
  reflexFrequency: number;
  replayRelief: number;
}

export interface MetaState {
  observations: MetaObservation[];
  summary: MetaSummary;
}

export interface MetaContext {
  homeostasis: HomeostasisState;
  reflex: ReflexState;
  sleep: SleepMetrics;
  replay: ReplayState;
  intent: IntentState;
  transmutation?: TransmutationMetrics;
  emotion?: EmotionState;
}
