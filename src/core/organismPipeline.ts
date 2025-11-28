import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import type { TriAxisState } from '@/core/types/ontogenesis';
import type { ExternalSignalsAggregate } from '@/nerve/L12_external_signals_types';
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
  externalSignals?: ExternalSignalsAggregate | null;
}

const fallback = (value: number | undefined, defaultValue: number): number => {
  if (typeof value === 'number') return value;
  return defaultValue;
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

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
    externalSignals,
  } = inputs;

  const externalStress = externalSignals?.externalStress ?? 0;
  const externalRecovery = externalSignals?.externalRecovery ?? 0;
  const externalExploration = externalSignals?.externalExploration ?? 0;

  const effectiveLoadIndex = clamp01(fallback(loadIndex, 0.4) + externalStress * 0.3);
  const effectiveRecentRecovery = clamp01(fallback(recentRecoveryIndex, 0.5) + externalRecovery * 0.3);

  const metabolicSnapshot =
    metabolism ??
    runL9MetabolicStep({
      triAxis,
      loadIndex: effectiveLoadIndex,
      resonanceQuality: fallback(resonanceQuality, 0.5),
      recentRecoveryIndex: effectiveRecentRecovery,
    });

  const observerLevel = observer?.crystalStabilityIndex ?? 0.5;

  const rawCrystalSnapshot =
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

  const shouldBoostGrowth = !crystal && externalExploration > 0;
  const boostedGrowthMomentum = shouldBoostGrowth
    ? clamp01((rawCrystalSnapshot?.growth.growthMomentum ?? 0.5) + externalExploration * 0.1)
    : rawCrystalSnapshot?.growth.growthMomentum;

  const crystalSnapshot = rawCrystalSnapshot
    ? shouldBoostGrowth && boostedGrowthMomentum !== undefined
      ? {
          ...rawCrystalSnapshot,
          growth: { ...rawCrystalSnapshot.growth, growthMomentum: boostedGrowthMomentum },
          overallScore: clamp01(
            rawCrystalSnapshot.overallScore ??
              (rawCrystalSnapshot.harmony.harmonyIndex +
                boostedGrowthMomentum +
                rawCrystalSnapshot.growth.stabilityIndex) /
                3,
          ),
        }
      : rawCrystalSnapshot
    : undefined;

  const snapshot: OrganismSnapshot = {
    triAxis,
    stage,
    orientation: orientation ?? undefined,
    observer: observer ?? undefined,
    externalSignals: externalSignals ?? undefined,
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
