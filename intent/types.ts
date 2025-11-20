import { HomeostasisState } from '../core/homeostasisManager';
import { MemoryState } from '../memory/memoryTypes';
import { ReplayState } from '../replay/types';
import { ReflexState } from '../reflex/types';
import { PerceptionSummary } from '../perception/types';
import { InteroceptionState } from '../interoception/contracts';
import { EmotionState } from '../emotion/contracts';

export type IntentMode = 'CALM' | 'FOCUSED' | 'HEALING' | 'DEGRADED' | 'CRITICAL';

export interface IntentDecision {
  allowHeavyTasks: boolean;
  throttleNonCritical: boolean;
  preferCache: boolean;
  forceSleepSoon: boolean;
  degradedMode: boolean;
  boostTransmutation?: boolean;
}

export interface IntentContext {
  homeostasis: HomeostasisState;
  reflex: ReflexState;
  replay: ReplayState;
  memory: MemoryState;
  perception?: PerceptionSummary;
  interoception?: InteroceptionState;
  emotion?: EmotionState;
}

export interface IntentState {
  mode: IntentMode;
  decision: IntentDecision;
  lastEvaluatedAt: number;
  context: IntentContext;
  overrideActive: boolean;
}

export interface IntentOverride {
  mode: IntentMode;
  decision?: IntentDecision;
  setAt: number;
}
