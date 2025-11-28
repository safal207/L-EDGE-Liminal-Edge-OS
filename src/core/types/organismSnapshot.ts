import type { CrystalObserverSnapshot } from '@/organism/observer/L8_crystal_observer';
import type { L10CrystalSnapshot } from '@/organism/crystal/L10_crystal_types';
import type { OrientationSnapshot } from '@/organism/orientation/L0_center';
import type { MetabolicSnapshot } from '@/organism/metabolism/L9_metabolic_layer';
import type { TriAxisState } from './ontogenesis';

export interface OrganismSnapshot {
  triAxis: TriAxisState;
  stage: number;
  orientation?: OrientationSnapshot;
  observer?: CrystalObserverSnapshot;
  metabolism?: MetabolicSnapshot;
  crystal?: L10CrystalSnapshot;
  timestamp: number;
}
