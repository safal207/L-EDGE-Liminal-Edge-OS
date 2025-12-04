export type PulsePhase = "rest" | "rise" | "peak" | "recovery";

export interface PulseBaseline {
  /** 0..1 normalized baseline intensity (resting tone). */
  intensity: number;
  /** 0..1 normalized stability of the baseline. */
  stability: number;
}

export interface CorePulseSignal {
  /** 0..1 instantaneous intensity of the pulse. */
  intensity: number;
  /** 0..1 variability / jitter of the pulse over a short window. */
  variability: number;
  /** Current phase of the pulse cycle. */
  phase: PulsePhase;
  /** Optional hint whether the organism is approaching overload. */
  overloadRisk?: number; // 0..1
}

export interface PulseModulation {
  /** Contribution from breathing / L33. */
  breathingInfluence: number;
  /** Contribution from luck / L21 + L24 decision window. */
  luckInfluence: number;
  /** Contribution from emotional / interoceptive tone. */
  emotionalInfluence: number;
}

export interface CorePulseState {
  baseline: PulseBaseline;
  current: CorePulseSignal;
  modulation: PulseModulation;
  /** 0..1 readiness level for taking new commitments / decisions. */
  readiness: number;
  /** 0..1 perceived overload level (higher = closer to overload). */
  overloadLevel: number;
}
