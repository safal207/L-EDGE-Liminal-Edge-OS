import type { CrystalObserverSnapshot } from '@/organism/observer/L8_crystal_observer';
import type { L10CrystalSnapshot } from '@/organism/crystal/L10_crystal_types';
import type { OrientationSnapshot } from '@/organism/orientation/L0_center';
import type { GrowthModeSnapshot } from '@/organism/growthModes/L11_growth_types';
import type { MetabolicSnapshot } from '@/organism/metabolism/L9_metabolic_types';
import type { ResponseFrame } from '@/nerve/L13_response_types';
import type { AutopoieticSnapshot } from '@/organism/autopoietic/L16_autopoietic_types';

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

export interface MetabolismVectorState {
  stressIndex: number;
  recoveryScore: number;
  overloadRisk: number;
  mode: MetabolicSnapshot['mode'];
  overloadAxes: AxisId[];
  note?: string;
}

export interface OntogenesisVector {
  triAxis: TriAxisState;
  stage: number; // L0..L9 (и далее)
  orientation?: OrientationSnapshot;
  observer?: CrystalObserverSnapshot;
  crystal?: L10CrystalSnapshot;
  metabolism?: MetabolismVectorState;
  growthMode?: GrowthModeSnapshot;
  responseFrame?: ResponseFrame;
  autopoietic?: AutopoieticSnapshot;
  timestamp?: number;
}

export interface OntogenesisTimelineEntry {
  timestamp: number;
  vector: OntogenesisVector;
}
