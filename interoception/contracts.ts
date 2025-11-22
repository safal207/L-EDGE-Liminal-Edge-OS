import { HomeostasisState } from '../core/homeostasisManager';
import { HeartbeatState } from '../core/types';
import { IntentState } from '../intent/types';
import { MemoryState } from '../memory/memoryTypes';
import { PerceptionSummary } from '../perception/types';
import { ReflexState } from '../reflex/types';
import { ReplayState } from '../replay/types';
import { SleepMetrics } from '../sleep/sleepCycle';
import { CirculationSnapshot } from '../core/types';
import { TransmutationMetrics } from '../transmutation/contracts';
import { MetaState } from '../meta/types';

export type InteroceptionStatus = 'stable' | 'strained' | 'depleted' | 'critical';

export interface InteroceptionSignal {
  id: string;
  ts: number;
  source: string;
  kind: string;
  intensity: number;
  payload?: Record<string, unknown>;
}

export interface InteroceptionSummary {
  fatigue: number;
  tension: number;
  entropyPressure: number;
  readiness: number;
  clarity: number;
  overload: number;
  status: InteroceptionStatus;
  annotations: string[];
  lastUpdated: number;
}

export interface InteroceptionState {
  signals: InteroceptionSignal[];
  summary: InteroceptionSummary;
}

export interface InteroceptionContext {
  homeostasis: HomeostasisState;
  sleep: SleepMetrics;
  reflex: ReflexState;
  replay: ReplayState;
  transmutation: TransmutationMetrics;
  perception: PerceptionSummary;
  intent: IntentState;
  circulation?: CirculationSnapshot;
  memory?: MemoryState;
  heartbeat?: HeartbeatState;
  meta?: MetaState;
}
