import type { AxisId } from '@/core/types/ontogenesis';
import type { OrientationSnapshot } from '../orientation/L0_center';
import type { LoadProfile } from '../orientation/L0_load_profile';
import type { CerebellumSnapshot } from '../orientation/L0_cerebellum';
import type { AxisCouplingSnapshot, AxisPair } from '../orientation/L0_axis_coupling';
import type { ResonanceSnapshot } from '../resonance/L6_resonance_field';

type Axis = AxisId;

export interface FlowConfig {
  sensitivity: number; // 0..1
  fatigueGain: number; // 0..1
  nourishmentGain: number; // 0..1
  maxHealthyPressure: number; // 0..1
  resonanceImpact: number; // 0..1
  couplingImpact: number; // 0..1
}

export interface AxisFlow {
  axis: Axis;
  inflow: number; // 0..1
  outflow: number; // 0..1
  netFlow: number; // -1..1
  pressure: number; // 0..1
  stagnation: number; // 0..1
  fatigueRisk: number; // 0..1
  nourishment: number; // 0..1
  role: 'donor' | 'receiver' | 'balanced';
}

export interface SuggestedShift {
  from: Axis[];
  to: Axis[];
  magnitude: number; // 0..1
  note: string;
}

export interface SomaFlowSnapshot {
  config: FlowConfig;
  flows: Record<Axis, AxisFlow>;
  globalPressureIndex: number;
  globalStagnationIndex: number;
  globalFatigueRisk: number;
  globalNourishmentIndex: number;
  suggestedShift: SuggestedShift;
  note: string;
}

interface AxisBaseSignal {
  activity: number;
  support: number;
}

interface AxisCoupledSignal extends AxisBaseSignal {
  coupledIn: number;
  coupledOut: number;
}

export const DEFAULT_FLOW_CONFIG: FlowConfig = {
  sensitivity: 0.7,
  fatigueGain: 0.8,
  nourishmentGain: 0.6,
  maxHealthyPressure: 0.65,
  resonanceImpact: 0.5,
  couplingImpact: 0.6,
};

export function computeSomaFlow(
  orientation: OrientationSnapshot,
  load: LoadProfile,
  cere: CerebellumSnapshot,
  coupling: AxisCouplingSnapshot,
  resonance: ResonanceSnapshot,
  config: FlowConfig = DEFAULT_FLOW_CONFIG,
): SomaFlowSnapshot {
  const baseL = deriveAxisBase('L', orientation, load, resonance);
  const baseS = deriveAxisBase('S', orientation, load, resonance);
  const baseC = deriveAxisBase('C', orientation, load, resonance);

  const withCouplingL = applyCouplingAndResonance('L', baseL, coupling, resonance, config);
  const withCouplingS = applyCouplingAndResonance('S', baseS, coupling, resonance, config);
  const withCouplingC = applyCouplingAndResonance('C', baseC, coupling, resonance, config);

  const flowL = computeAxisFlow('L', withCouplingL, config);
  const flowS = computeAxisFlow('S', withCouplingS, config);
  const flowC = computeAxisFlow('C', withCouplingC, config);

  const flows: Record<Axis, AxisFlow> = { L: flowL, S: flowS, C: flowC };

  const globalPressureIndex = clamp01(avg([flowL.pressure, flowS.pressure, flowC.pressure]));
  const globalStagnationIndex = clamp01(avg([flowL.stagnation, flowS.stagnation, flowC.stagnation]));
  const globalFatigueRisk = clamp01(avg([flowL.fatigueRisk, flowS.fatigueRisk, flowC.fatigueRisk]));
  const globalNourishmentIndex = clamp01(avg([flowL.nourishment, flowS.nourishment, flowC.nourishment]));

  const suggestedShift = suggestShift(flows, {
    globalPressureIndex,
    globalStagnationIndex,
    globalFatigueRisk,
    globalNourishmentIndex,
  });

  const note =
    `L7 SomaFlow: P=${globalPressureIndex.toFixed(2)} Stag=${globalStagnationIndex.toFixed(2)} ` +
    `Fatigue=${globalFatigueRisk.toFixed(2)} Nourish=${globalNourishmentIndex.toFixed(2)}; ` +
    `shift=${suggestedShift.note}`;

  return {
    config,
    flows,
    globalPressureIndex,
    globalStagnationIndex,
    globalFatigueRisk,
    globalNourishmentIndex,
    suggestedShift,
    note,
  };
}

function deriveAxisBase(
  axis: Axis,
  orientation: OrientationSnapshot,
  load: LoadProfile,
  resonance: ResonanceSnapshot,
): AxisBaseSignal {
  const waveEnergy = resonance.waves[axis]?.energy ?? 0.5;

  if (axis === 'L') {
    const activity = clamp01(avg([load.embodimentFocus, load.skillDrillFocus, load.globalStress]));
    const support = clamp01(avg([load.meaningReflectionFocus, load.embodimentFocus, waveEnergy]));
    return { activity, support };
  }

  if (axis === 'S') {
    const activity = clamp01(avg([load.socialFocus, load.globalStress]));
    const support = clamp01(avg([orientation.S_level, load.playExplorationFocus, waveEnergy]));
    return { activity, support };
  }

  const activity = clamp01(avg([load.cosmicExplorationFocus, load.meaningReflectionFocus]));
  const support = clamp01(avg([orientation.C_level, load.tauSupport, waveEnergy]));
  return { activity, support };
}

function applyCouplingAndResonance(
  axis: Axis,
  base: AxisBaseSignal,
  coupling: AxisCouplingSnapshot,
  resonance: ResonanceSnapshot,
  cfg: FlowConfig,
): AxisCoupledSignal {
  const pairs = resolvePairs(axis, coupling);
  const pairIn = avg(pairs.map((p) => p.direct + p.holding * 0.5 + (coupling.baselineFlow ?? 0)));
  const pairOut = avg(pairs.map((p) => p.reverse + p.overloadRisk * 0.5));
  const resonanceBoost = (resonance.waves[axis]?.energy ?? 0) * cfg.resonanceImpact;

  const activity = clamp01(base.activity + pairOut * cfg.couplingImpact * 0.3 + resonanceBoost * 0.2);
  const support = clamp01(
    base.support + pairIn * cfg.couplingImpact * 0.5 + resonanceBoost * 0.3 + (coupling.baselineFlow ?? 0) * 0.2,
  );

  return {
    activity,
    support,
    coupledIn: clamp01(pairIn * cfg.couplingImpact),
    coupledOut: clamp01(pairOut * cfg.couplingImpact),
  };
}

function resolvePairs(axis: Axis, coupling: AxisCouplingSnapshot) {
  const pairs: Record<Axis, AxisCouplingSnapshot[AxisPair][]> = {
    L: [coupling.LS, coupling.LC],
    S: [coupling.LS, coupling.SC],
    C: [coupling.LC, coupling.SC],
  };
  return pairs[axis];
}

function computeAxisFlow(axis: Axis, sig: AxisCoupledSignal, cfg: FlowConfig): AxisFlow {
  const inflow = clamp01(sig.support + sig.coupledIn * 0.5);
  const outflow = clamp01(sig.activity + sig.coupledOut * 0.5);
  const netFlow = clamp(-1, 1, inflow - outflow);

  const rawPressure = clamp01(outflow - inflow * 0.5);
  const pressure = clamp01(rawPressure * (0.5 + cfg.sensitivity));

  const stagnation = clamp01((1 - Math.abs(netFlow)) * (sig.activity * 0.7));

  const fatigueOverload =
    pressure > cfg.maxHealthyPressure ? (pressure - cfg.maxHealthyPressure) / (1 - cfg.maxHealthyPressure + 1e-6) : 0;
  const fatigueRisk = clamp01(cfg.fatigueGain * fatigueOverload + 0.5 * stagnation);

  const nourishment = clamp01(cfg.nourishmentGain * inflow * (1 - pressure) * (1 - fatigueRisk));
  const role: AxisFlow['role'] = netFlow > 0.1 ? 'receiver' : netFlow < -0.1 ? 'donor' : 'balanced';

  return {
    axis,
    inflow,
    outflow,
    netFlow,
    pressure,
    stagnation,
    fatigueRisk,
    nourishment,
    role,
  };
}

function suggestShift(
  flows: Record<Axis, AxisFlow>,
  global: {
    globalPressureIndex: number;
    globalStagnationIndex: number;
    globalFatigueRisk: number;
    globalNourishmentIndex: number;
  },
): SuggestedShift {
  const axes = [flows.L, flows.S, flows.C];
  const overloaded = axes.filter((a) => a.pressure > 0.7 || a.fatigueRisk > 0.7);
  const underfed = axes.filter((a) => a.nourishment < 0.35 && a.pressure < 0.6);

  if (!overloaded.length || !underfed.length) {
    return { from: [], to: [], magnitude: 0, note: 'balanced-or-no-clear-shift' };
  }

  const magnitude = clamp01(avg(overloaded.map((a) => a.pressure)) * (0.5 + global.globalFatigueRisk * 0.5));
  return {
    from: overloaded.map((a) => a.axis),
    to: underfed.map((a) => a.axis),
    magnitude,
    note: `from[${overloaded.map((a) => a.axis).join(',')}]→to[${underfed.map((a) => a.axis).join(',')}], magnitude=${magnitude.toFixed(2)}`,
  };
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

function clamp01(value: number): number {
  return clamp(0, 1, value);
}
