import type { CrystalObserverSnapshot } from '@/organism/observer/L8_crystal_observer';
import type { L10CrystalSnapshot } from '@/organism/crystal/L10_crystal_types';
import type { AutopoieticSnapshot } from '@/organism/autopoietic/L16_autopoietic_types';
import type { GrowthModeSnapshot } from '@/organism/growthModes/L11_growth_types';
import type { OrientationSnapshot } from '@/organism/orientation/L0_center';
import type { MetabolicSnapshot } from '@/organism/metabolism/L9_metabolic_layer';
import type { ExternalSignalsAggregate } from '@/nerve/L12_external_signals_types';
import type { ResponseFrame } from '@/nerve/L13_response_types';
import type { TriAxisState } from './ontogenesis';
import type {
  TemporalState,
  TemporalSteeringDecision,
  TimeCrystalVector,
} from '@/core/temporal/l17-types';

export interface TemporalSnapshotBundle {
  state: TemporalState;
  timeCrystal: TimeCrystalVector;
  decision: TemporalSteeringDecision;
}

export interface OrganismSnapshot {
  triAxis: TriAxisState;
  stage: number;
  orientation?: OrientationSnapshot;
  observer?: CrystalObserverSnapshot;
  externalSignals?: ExternalSignalsAggregate;
  metabolism?: MetabolicSnapshot;
  crystal?: L10CrystalSnapshot;
  growthMode?: GrowthModeSnapshot;
  responseFrame?: ResponseFrame;
  autopoietic?: AutopoieticSnapshot;
  temporal?: TemporalSnapshotBundle;
  timestamp: number;
}
