import type { AutopoieticSnapshot } from '@/organism/autopoietic/L16_autopoietic_types';
import type { TriAxisState } from '@/core/types/ontogenesis';

export interface TemporalAxesState {
  inner: number;
  social: number;
  cosmic: number;
}

export type FramePhaseDirection = 'toward_solid' | 'toward_fluidity' | 'toward_vapor' | 'neutral';

export interface TransitionFeeling {
  intensity: number; // 0..1
  direction: FramePhaseDirection;
  deltaPhase?: number;
  rate?: number;
  axisShift?: TemporalAxesState;
  phaseBefore?: number;
  phaseAfter?: number;
}

export interface TemporalGoalProjection {
  targetAxes: TemporalAxesState;
  horizonSteps: number;
}

export interface TemporalSnapshot {
  stepIndex: number;
  timestamp: number;
  axes: TemporalAxesState;
  phase: number;
  stability: number;
  recoveryTime: number;
  tension: number;
  feeling: TransitionFeeling;
  goalProjection?: TemporalGoalProjection;
}

export interface TemporalState {
  past: TemporalSnapshot[];
  now: TemporalSnapshot | null;
  future: TemporalSnapshot[];
  /** Optional reference to the autopoietic snapshot used for this temporal state */
  autopoietic?: AutopoieticSnapshot;
}

export interface TemporalMetastabilityIndex {
  value: number;
  stabilityComponent: number;
  driftComponent: number;
  feelingComponent: number;
}

export interface DriftScore {
  value: number;
}

export interface GoalAlignmentScore {
  value: number;
}

export interface TimeCrystalVector {
  deltaAxes: TemporalAxesState;
  targetPhase: number;
  confidence: number;
  horizonSteps: number;
  tmi: TemporalMetastabilityIndex;
  drift: DriftScore;
  alignment: GoalAlignmentScore;
}

export type TemporalSteeringMode = 'stabilize' | 'explore' | 'consolidate';
export type TemporalWarningLevel = 'low' | 'medium' | 'high';

export interface TemporalSteeringDecision {
  vector: TimeCrystalVector;
  safeToAdjust: boolean;
  mode: TemporalSteeringMode;
  warningLevel: TemporalWarningLevel;
}

export interface TemporalBuildInputs {
  triAxis: TriAxisState;
  stage: number;
  autopoietic?: AutopoieticSnapshot | null;
  metabolism?: { stressIndex?: number; recoveryScore?: number; overloadRisk?: number } | null;
  goalProjection?: TemporalGoalProjection;
  temporalHistory?: TemporalSnapshot[];
  now?: number;
}
