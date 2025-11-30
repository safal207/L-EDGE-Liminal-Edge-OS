import type { OrganismSnapshot } from '@/core/types/organismSnapshot';

export type FrameId = 'near' | 'mid' | 'far';

export interface BalanceVector {
  inner: number;
  social: number;
  cosmic: number;
}

export interface YinYangTaoState {
  yin: number;
  yang: number;
  tao: number;
}

export interface MultiframeConfig {
  frameId: FrameId;
  balance: BalanceVector;
  yinYangTao: YinYangTaoState;
  tensegrityPotential: number;
}

export interface DisturbanceScenario {
  id: string;
  targetFrame: FrameId;
  magnitude: number;
  axisBias?: BalanceVector;
  durationMs: number;
  safeGuard: boolean;
}

export type ImmunePhase = 'Idle' | 'Detecting' | 'Compensating' | 'Stabilizing' | 'Integrating';

export interface StabilityMetrics {
  stabilityIndex: number;
  recoveryTimeMs: number;
  overshootLevel: number;
  learningGain: number;
}

export interface ImmuneCycleState {
  phase: ImmunePhase;
  activeDisturbance?: DisturbanceScenario;
  disturbanceStartedAt?: number;
  currentFrame: MultiframeConfig;
  previousFrame?: MultiframeConfig;
  metricsSnapshot?: StabilityMetrics;
  cycleStartMs?: number;
}

export interface AutopoieticConfig {
  frames: MultiframeConfig[];
  disturbance: {
    maxMagnitude: number;
    defaultDurationMs: number;
    safeGuard: boolean;
  };
  immuneCycle: {
    stabilityThreshold: number;
    maxRecoveryTimeMs: number;
    learningGainFactor: number;
  };
  tensegrityTolerance: number;
}

export interface AutopoieticSnapshot {
  currentFrame: MultiframeConfig;
  targetFrame: MultiframeConfig;
  tensegrityPotential: number;
  immuneCycle: ImmuneCycleState;
  stability: StabilityMetrics;
  disturbanceHistory: DisturbanceScenario[];
  note?: string;
}

export interface AutopoieticInputs {
  snapshot: OrganismSnapshot;
  previous?: AutopoieticSnapshot | null;
  config?: AutopoieticConfig;
  pendingDisturbance?: DisturbanceScenario | null;
  now?: number;
}
