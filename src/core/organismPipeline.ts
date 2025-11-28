import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import type { TriAxisState } from '@/core/types/ontogenesis';
import { runL10CrystalStep } from '@/organism/crystal/L10_crystal_layer';
import type { L10CrystalSnapshot } from '@/organism/crystal/L10_crystal_types';
import { decideGrowthMode } from '@/organism/growthModes/L11_growth_layer';
import type { GrowthModeSnapshot } from '@/organism/growthModes/L11_growth_types';
import type { CrystalObserverSnapshot } from '@/organism/observer/L8_crystal_observer';
import type { OrientationSnapshot } from '@/organism/orientation/L0_center';
import { runL9MetabolicStep } from '@/organism/metabolism/L9_metabolic_layer';
import type { MetabolicSnapshot } from '@/organism/metabolism/L9_metabolic_layer';

export interface OrganismPipelineInputs {
  triAxis: TriAxisState;
  stage: number;
  orientation?: OrientationSnapshot | null;
  observer?: CrystalObserverSnapshot | null;
  metabolism?: MetabolicSnapshot | null;
  crystal?: L10CrystalSnapshot | null;
  growthMode?: GrowthModeSnapshot | null;
  loadIndex?: number;
  resonanceQuality?: number;
  recentRecoveryIndex?: number;
}

const fallback = (value: number | undefined, defaultValue: number): number => {
  if (typeof value === 'number') return value;
  return defaultValue;
};

export const runOrganismPipeline = (inputs: OrganismPipelineInputs): OrganismSnapshot => {
  const {
    triAxis,
    stage,
    orientation,
    observer,
    metabolism,
    crystal,
    growthMode,
    loadIndex,
    resonanceQuality,
    recentRecoveryIndex,
  } = inputs;

  const metabolicSnapshot =
    metabolism ??
    runL9MetabolicStep({
      triAxis,
      loadIndex: fallback(loadIndex, 0.4),
      resonanceQuality: fallback(resonanceQuality, 0.5),
      recentRecoveryIndex: fallback(recentRecoveryIndex, 0.5),
    });

  const observerLevel = observer?.crystalStabilityIndex ?? 0.5;

  const crystalSnapshot =
    crystal ??
    runL10CrystalStep({
      triAxis,
      stage,
      metabolism: {
        stressIndex: metabolicSnapshot.stressIndex,
        recoveryScore: metabolicSnapshot.recoveryScore,
        overloadRisk: metabolicSnapshot.overloadRisk,
        mode: metabolicSnapshot.mode,
      },
      observerLevel,
    });

  const snapshot: OrganismSnapshot = {
    triAxis,
    stage,
    orientation: orientation ?? undefined,
    observer: observer ?? undefined,
    metabolism: metabolicSnapshot,
    crystal: crystalSnapshot,
    timestamp: Date.now(),
  };

  const growthModeSnapshot = growthMode ?? decideGrowthMode(snapshot);

  return {
    ...snapshot,
    growthMode: growthModeSnapshot,
  };
};
