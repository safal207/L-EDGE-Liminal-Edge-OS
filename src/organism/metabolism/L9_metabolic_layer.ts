import type { TriAxisState } from '@/core/types/ontogenesis';
import type {
  AxisMetabolicState,
  MetabolicInputs,
  MetabolicMode,
  MetabolicSnapshot,
} from './L9_metabolic_types';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const decideMetabolicMode = (totalStress: number, totalRecovery: number): MetabolicMode => {
  if (totalStress < 0.35) return 'normal';

  if (totalStress < 0.7) {
    return totalRecovery >= 0.5 ? 'recovery' : 'overload';
  }

  if (totalRecovery >= 0.6) return 'recovery';
  return 'deep_recovery';
};

const computeAxisMetabolism = (
  axisId: 'L' | 'S' | 'C',
  axisState: TriAxisState['L'],
  globalLoadIndex: number,
): AxisMetabolicState => {
  const energy = clamp01(0.6 * axisState.nourishment - 0.2 * axisState.pressure + 0.6);
  const stress = clamp01(0.5 * axisState.pressure + 0.5 * globalLoadIndex);
  const recovery = clamp01(0.5 * axisState.nourishment - 0.3 * axisState.pressure + 0.3);

  return { axisId, energy, stress, recovery };
};

export const runL9MetabolicStep = (inputs: MetabolicInputs): MetabolicSnapshot => {
  const { triAxis, loadIndex, resonanceQuality = 0.5, recentRecoveryIndex = 0.5 } = inputs;

  const axisL = computeAxisMetabolism('L', triAxis.L, loadIndex);
  const axisS = computeAxisMetabolism('S', triAxis.S, loadIndex);
  const axisC = computeAxisMetabolism('C', triAxis.C, loadIndex);

  const axes: AxisMetabolicState[] = [axisL, axisS, axisC];

  const totalEnergy = clamp01((axisL.energy + axisS.energy + axisC.energy) / 3);
  const totalStress = clamp01((axisL.stress + axisS.stress + axisC.stress) / 3);
  const totalRecovery = clamp01(((axisL.recovery + axisS.recovery + axisC.recovery) / 3) * 0.7 + recentRecoveryIndex * 0.3);

  const mode = decideMetabolicMode(totalStress, totalRecovery);
  const overloadAxes = axes.filter((axis) => axis.stress > 0.7).map((axis) => axis.axisId);
  const recommendedSlowdown = mode === 'overload' || mode === 'recovery' || mode === 'deep_recovery';
  const recommendedDeepRest = mode === 'deep_recovery';

  const note = `L9: mode=${mode}, energy=${totalEnergy.toFixed(2)}, stress=${totalStress.toFixed(2)}, recovery=${totalRecovery.toFixed(2)}, resonance=${resonanceQuality.toFixed(2)}`;

  return {
    mode,
    totalEnergy,
    totalStress,
    totalRecovery,
    axes,
    overloadAxes,
    recommendedSlowdown,
    recommendedDeepRest,
    note,
  };
};

export type { AxisMetabolicState, MetabolicSnapshot, MetabolicMode } from './L9_metabolic_types';

