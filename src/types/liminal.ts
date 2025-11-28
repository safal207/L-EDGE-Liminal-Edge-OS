/**
 * Shared foundational types for the layered LIMINAL architecture. These types
 * give upcoming refactors a common language across L0–L8 while keeping
 * semantics lightweight enough to adopt incrementally.
 */

/** Three-axis identity used across orientation and ontogenesis layers. */
export type LiminalAxis = 'L' | 'S' | 'C';

/** Normalized tri-axis vector with optional descriptive note. */
export interface TriAxisState {
  L: number;
  S: number;
  C: number;
  note?: string;
}

/**
 * Core temporal vector capturing past → present → trend aggregation. Values are
 * normalized to 0..1 for comparability across subsystems.
 */
export interface TemporalVector {
  past: TriAxisState;
  present: TriAxisState;
  trend: TriAxisState;
  note?: string;
}

/** Minimal observer snapshot shared by crystal/resonance guardians. */
export interface ObserverSnapshot {
  timestamp: number;
  axes: TriAxisState;
  integrity?: number;
  coherence?: number;
  note?: string;
}

/** Resonance field summary for L/S/C waves. */
export interface ResonanceField {
  coherenceIndex: number;
  beatIndex?: number;
  energyBalance?: number;
  note?: string;
}

/** System-level energy/circulation indicators used by soma flow layers. */
export interface SystemEnergy {
  pressure: number;
  stagnation?: number;
  nourishment?: number;
  fatigueRisk?: number;
  note?: string;
}

/** Orientation signal harmonizing polarity and axis alignment. */
export interface OrientationSignal {
  axisAlignment: TriAxisState;
  polarityDrift?: number;
  tauSupport?: number;
  note?: string;
}

/**
 * Generic ontogenesis layer state bundle so L0–L8 modules can expose
 * lightweight telemetry without depending on each other's internal schemas.
 */
export interface OntogenesisLayerState {
  axisVector?: TriAxisState;
  resonance?: ResonanceField;
  energy?: SystemEnergy;
  orientation?: OrientationSignal;
  observer?: ObserverSnapshot;
  note?: string;
}

/** Convenience export to avoid deep relative paths when importing types. */
export type { LiminalAxis as Axis };
