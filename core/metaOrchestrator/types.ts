import type { HeartbeatState, HeartbeatIntent } from '../types';
import type { FieldSnapshot } from '../../field/contracts';
import type { CollectiveResonanceSnapshot } from '../../resonance/collectiveContracts';
import type { IntentState } from '../../intent/types';
import type { NoosphereSnapshot } from '../../noosphere/contracts';

export interface MetaSystemSnapshot {
  timestamp: number;
  organism: {
    stressLevel?: number;
    stability?: number;
    lastHeartbeatId?: string;
  };
  field?: {
    pastEntropy?: number;
    futureConfidence?: number;
    mode?: FieldMode;
  };
  intent?: {
    lastIntentId?: string;
    kind?: HeartbeatIntent['mode'];
    fieldAlignment?: HeartbeatIntent['fieldAlignment'] | 'unknown';
  };
  resonance?: {
    primaryMode?: CollectiveResonanceSnapshot['primaryMode'] | 'unknown';
    topMirrorId?: string;
    topSeedId?: string;
  };
  meta: {
    coherence: number;
    tension: number;
    comment?: string;
  };
}

export type FieldMode = 'supportive' | 'neutral' | 'high_tension' | 'unknown';

export interface MetaOrchestratorDeps {
  getLastHeartbeat: () => HeartbeatState | null | undefined;
  getLastFieldSnapshot?: () => FieldSnapshot | null | undefined;
  getLastCollectiveResonance?: () => CollectiveResonanceSnapshot | null | undefined;
  getLastIntent?: () => IntentState | null | undefined;
  getLastNoosphere?: () => NoosphereSnapshot | null | undefined;
}

export interface MetaOrchestratorContext {
  heartbeat?: HeartbeatState | null;
  field?: FieldSnapshot | null;
  collective?: CollectiveResonanceSnapshot | null;
  intent?: IntentState | null;
  noosphere?: NoosphereSnapshot | null;
}

export const defaultUnknownSnapshot: MetaSystemSnapshot = {
  timestamp: Date.now(),
  organism: {},
  field: { mode: 'unknown' },
  intent: { fieldAlignment: 'unknown' },
  resonance: { primaryMode: 'unknown' },
  meta: { coherence: 0, tension: 0, comment: 'Meta snapshot not yet initialized' },
};
