export type AxisId = 'L' | 'S' | 'C';

export interface AxisState {
  id: AxisId;
  value: number;
  nourishment: number;
  pressure: number;
}

export interface TriAxisState {
  L: AxisState;
  S: AxisState;
  C: AxisState;
}

export interface PolaritySnapshot {
  yinLevel: number;
  yangLevel: number;
  taoLevel: number;
}

export interface OntogenesisVectorL9State {
  totalEnergy: number;
  totalStress: number;
  totalRecovery: number;
  mode: string;
  stressIndex?: number;
  recoveryScore?: number;
  overloadRisk?: number;
  overloadAxes?: AxisId[];
  note?: string;
}

export interface OntogenesisVector {
  L0?: unknown;
  L1?: unknown;
  L2?: unknown;
  L3?: unknown;
  L4?: unknown;
  L5?: unknown;
  L6?: unknown;
  L7?: {
    triAxis: TriAxisState;
    globalNourishmentIndex: number;
    globalPressureIndex: number;
  };
  L8?: {
    integrityIndex: number;
    coherenceIndex: number;
    planAlignmentIndex: number;
    crystalStabilityIndex: number;
    note?: string;
  };
  L9?: OntogenesisVectorL9State;
  timestamp?: number;
}

export interface OntogenesisTimelineEntry {
  timestamp: number;
  vector: OntogenesisVector;
}
