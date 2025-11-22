import { HomeostasisState } from '../core/homeostasisManager';
import { MemoryState } from '../memory/memoryTypes';
import { ReplayState } from '../replay/types';
import { ReflexState } from '../reflex/types';
import { PerceptionSummary } from '../perception/types';
import { InteroceptionState } from '../interoception/contracts';
import { EmotionState } from '../emotion/contracts';
import { FieldSnapshot } from '../field/contracts';
import { NoosphereSnapshot } from '../noosphere/contracts';

export interface IntentSocialHint {
  summary: {
    recommendation: { action: string };
    fieldResonance: { status: string; dissonance: number };
    selfResonance: { tension: number };
  };
}

export type IntentMode = 'CALM' | 'FOCUSED' | 'HEALING' | 'DEGRADED' | 'CRITICAL';

export type IntentFieldAlignment = 'aligned' | 'neutral' | 'against_field';

export interface IntentDecision {
  allowHeavyTasks: boolean;
  throttleNonCritical: boolean;
  preferCache: boolean;
  forceSleepSoon: boolean;
  degradedMode: boolean;
  boostTransmutation?: boolean;
  fieldAlignment?: IntentFieldAlignment;
  noosphereSupport?: number;
  noosphereTension?: number;
}

export interface IntentContext {
  homeostasis: HomeostasisState;
  reflex: ReflexState;
  replay: ReplayState;
  memory: MemoryState;
  perception?: PerceptionSummary;
  interoception?: InteroceptionState;
  emotion?: EmotionState;
  social?: IntentSocialHint;
  field?: FieldSnapshot;
  noosphere?: NoosphereSnapshot;
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
