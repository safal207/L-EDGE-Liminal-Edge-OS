import type { CrystalObserverSnapshot } from '@/organism/observer/L8_crystal_observer';
import type { L10CrystalSnapshot } from '@/organism/crystal/L10_crystal_types';
import type { GrowthModeSnapshot } from '@/organism/growthModes/L11_growth_types';
import type { OrientationSnapshot } from '@/organism/orientation/L0_center';
import type { MetabolicSnapshot } from '@/organism/metabolism/L9_metabolic_layer';
import type { ExternalSignalsAggregate } from '@/nerve/L12_external_signals_types';
import type { TriAxisState } from './ontogenesis';

export interface OrganismSnapshot {
  triAxis: TriAxisState;
  stage: number;
  orientation?: OrientationSnapshot;
  observer?: CrystalObserverSnapshot;
  externalSignals?: ExternalSignalsAggregate;
  metabolism?: MetabolicSnapshot;
  crystal?: L10CrystalSnapshot;
  growthMode?: GrowthModeSnapshot;
  timestamp: number;
}
