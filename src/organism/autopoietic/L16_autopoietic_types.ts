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

export type PhaseDirection = "toward_rigidity" | "toward_fluidity" | "toward_chaos";

export interface AxisVector {
  inner: number;
  social: number;
  cosmic: number;
}

/**
 * Feeling = sensor of a phase transition.
 * "How strongly did the organism feel this transition?"
 */
export interface TransitionFeeling {
  /** 0..1 — насколько сильно система чувствует переход */
  intensity: number;

  /** направление фазового сдвига */
  direction: PhaseDirection;

  /** смена фазы: φ_after - φ_before */
  deltaPhase: number;

  /** скорость фазового перехода: |deltaPhase| / Δt */
  rate: number;

  /** изменение акцентов по осям */
  axisShift: AxisVector;

  /** фаза до и после (для визуализации/логирования) */
  phaseBefore: number;
  phaseAfter: number;
}

export interface AutopoieticSnapshot {
  timestamp: number;
  currentFrame: MultiframeConfig;
  targetFrame: MultiframeConfig;
  tensegrityPotential: number;
  immuneCycle: ImmuneCycleState;
  stability: StabilityMetrics;
  disturbanceHistory: DisturbanceScenario[];
  feeling: TransitionFeeling;
  note?: string;
}

export interface AutopoieticInputs {
  snapshot: OrganismSnapshot;
  previous?: AutopoieticSnapshot | null;
  config?: AutopoieticConfig;
  pendingDisturbance?: DisturbanceScenario | null;
  now?: number;
}
