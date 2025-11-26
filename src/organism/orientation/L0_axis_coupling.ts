import type { OrientationSnapshot } from './L0_center';
import type { AxisPolarity, PolaritySnapshot } from './L0_polarity';

export type Axis = 'L' | 'S' | 'C';

export interface AxisCouplingChannel {
  direct: number; // positive influence / feedforward
  reverse: number; // braking influence / feedback
  holding: number; // stabilizing tone between axes
  resonance: number; // combined resonance (direct * holding)
  overloadRisk: number; // risk of overactivation or suppression
  flow: number; // net flow direction after accounting for risk
  note: string;
}

export interface AxisCouplingSnapshot {
  LS: AxisCouplingChannel;
  LC: AxisCouplingChannel;
  SC: AxisCouplingChannel;
  resonanceFlow: number; // average flow across pairings
  stabilityIndex: number; // average holding dampened by overload risk
  note: string;
}

export interface AxisCouplingConfig {
  directWeight?: number;
  reverseWeight?: number;
  holdingWeight?: number;
}

const DEFAULT_COUPLING_CONFIG: Required<AxisCouplingConfig> = {
  directWeight: 0.45,
  reverseWeight: 0.25,
  holdingWeight: 0.3,
};

/**
 * Axis Coupling Layer (ACL) – builds a simple resonance/tension map between L/S/C axes.
 * It interprets polarity and orientation, then returns stabilizing vs. braking influences
 * for each pair: L–S, L–C, S–C.
 */
export function computeAxisCoupling(
  orientation: OrientationSnapshot,
  polarity: PolaritySnapshot,
  config: AxisCouplingConfig = {},
): AxisCouplingSnapshot {
  const weights = { ...DEFAULT_COUPLING_CONFIG, ...config };

  const LS = pairCoupling(
    orientation.L_level,
    orientation.S_level,
    polarity.L,
    polarity.S,
    weights,
  );
  const LC = pairCoupling(
    orientation.L_level,
    orientation.C_level,
    polarity.L,
    polarity.C,
    weights,
  );
  const SC = pairCoupling(
    orientation.S_level,
    orientation.C_level,
    polarity.S,
    polarity.C,
    weights,
  );

  const resonanceFlow = clamp01(avg([LS.flow, LC.flow, SC.flow]));
  const stabilityIndex = clamp01(
    avg([LS.holding, LC.holding, SC.holding]) - avg([LS.overloadRisk, LC.overloadRisk, SC.overloadRisk]) * 0.25,
  );

  const note =
    `Axis coupling: LS(${LS.note}), LC(${LC.note}), SC(${SC.note}); ` +
    `resonanceFlow=${resonanceFlow.toFixed(2)}, stability=${stabilityIndex.toFixed(2)}`;

  return { LS, LC, SC, resonanceFlow, stabilityIndex, note };
}

function pairCoupling(
  aLevel: number,
  bLevel: number,
  aPolarity: AxisPolarity,
  bPolarity: AxisPolarity,
  weights: Required<AxisCouplingConfig>,
): AxisCouplingChannel {
  const strength = clamp01((aLevel + bLevel) / 2);
  const coherence = clamp01((aPolarity.tau + bPolarity.tau) / 2);
  const tension = clamp01(Math.abs(aPolarity.ratio - bPolarity.ratio));

  const direct = clamp01(weights.directWeight * strength + 0.35 * coherence + 0.2 * (1 - tension));
  const reverse = clamp01(weights.reverseWeight * tension + 0.15 * (1 - coherence));
  const holding = clamp01(weights.holdingWeight * coherence + 0.25 * (1 - Math.abs(aLevel - bLevel)) + 0.1);

  const resonance = clamp01(direct * holding);
  const overloadRisk = clamp01(reverse * (1 - holding) + tension * 0.1);
  const flow = clamp01(resonance - overloadRisk * 0.5);

  const note =
    `dir=${direct.toFixed(2)} rev=${reverse.toFixed(2)} hold=${holding.toFixed(2)} ` +
    `res=${resonance.toFixed(2)} risk=${overloadRisk.toFixed(2)} flow=${flow.toFixed(2)}`;

  return { direct, reverse, holding, resonance, overloadRisk, flow, note };
}

function avg(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
