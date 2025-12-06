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
import type { ResourceState } from '../src/layers/L25_cell_kernel';
import type { MineralProfile } from '../src/layers/L27_mineral_buffer';

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
  bodyFatigue?: BodyFatigueSnapshot;
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
  resources?: ResourceState;
  minerals?: MineralProfile;
}

export interface BodyFatigueSnapshot {
  fatigueLevel: number; // 0..1 — subjective tiredness
  depletionLevel: number; // 0..1 — longer-term reserve burn
  recoveryNeed: number; // 0..1 — urgency for restorative sleep
  suggestedSleepMode: 'light' | 'deep' | 'integrative' | 'emergency';
}
