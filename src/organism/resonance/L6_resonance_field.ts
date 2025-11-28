import type { AxisCouplingSnapshot } from '../orientation/L0_axis_coupling';
import type { CerebellumSnapshot } from '../orientation/L0_cerebellum';
import type { ResonancePreset } from './presets';

export type ResonanceAxis = 'L' | 'S' | 'C';

export interface ResonanceConfig {
  preset: ResonancePreset;
  autoAdapt: boolean;
  maxAmplitude: number;
  recoveryBias: number;
}

export interface AxisWave {
  phase: number; // [0..2π)
  amplitude: number; // 0..1
  energy: number; // 0..1
  value: number; // -1..1
}

export interface ResonanceSnapshot {
  t: number;
  waves: Record<ResonanceAxis, AxisWave>;
  beatIndex: number;
  coherenceIndex: number;
  energyBalance: number;
  preset: ResonancePreset['name'];
  adaptedReason: string;
  note: string;
}

interface AxisTone {
  resonance: number;
  holding: number;
  baseline: number;
}

const TWO_PI = Math.PI * 2;

export function runResonanceStep(
  t: number,
  prev: ResonanceSnapshot | null,
  cfg: ResonanceConfig,
  cerebellum: CerebellumSnapshot,
  coupling: AxisCouplingSnapshot,
  adaptConfig: (cfg: ResonanceConfig, cere: CerebellumSnapshot, acl: AxisCouplingSnapshot) => ResonanceConfig,
): ResonanceSnapshot {
  const dt = Math.max(0.001, prev ? Math.max(0.001, t - prev.t) : 1);
  const effectiveCfg = cfg.autoAdapt ? adaptConfig(cfg, cerebellum, coupling) : cfg;

  const L = stepAxisWave('L', dt, prev?.waves.L, effectiveCfg, cerebellum, coupling, 0, effectiveCfg.preset.lWeight);
  const S = stepAxisWave(
    'S',
    dt,
    prev?.waves.S,
    effectiveCfg,
    cerebellum,
    coupling,
    effectiveCfg.preset.phaseShiftLS,
    effectiveCfg.preset.sWeight,
  );
  const C = stepAxisWave(
    'C',
    dt,
    prev?.waves.C,
    effectiveCfg,
    cerebellum,
    coupling,
    effectiveCfg.preset.phaseShiftLC,
    effectiveCfg.preset.cWeight,
  );

  const coherenceIndex = computeCoherence(L, S, C);
  const beatIndex = computeBeats(L, S, C);
  const energyBalance = computeEnergyBalance(L, S, C, cerebellum, coupling);

  const note =
    `L6: preset=${effectiveCfg.preset.name} coh=${coherenceIndex.toFixed(2)} beat=${beatIndex.toFixed(2)} ` +
    `energy=${energyBalance.toFixed(2)} ` +
    `L(a=${L.amplitude.toFixed(2)} φ=${L.phase.toFixed(2)}) ` +
    `S(a=${S.amplitude.toFixed(2)} φ=${S.phase.toFixed(2)}) ` +
    `C(a=${C.amplitude.toFixed(2)} φ=${C.phase.toFixed(2)})`;

  return {
    t,
    waves: { L, S, C },
    beatIndex,
    coherenceIndex,
    energyBalance,
    preset: effectiveCfg.preset.name,
    adaptedReason: effectiveCfg.preset.name !== cfg.preset.name ? 'auto-adapt' : '',
    note,
  };
}

export function defaultAdaptation(
  cfg: ResonanceConfig,
  cere: CerebellumSnapshot,
  coupling: AxisCouplingSnapshot,
  presets: Record<string, ResonancePreset>,
): ResonanceConfig {
  const risk = cere.overshootRisk;
  const coh = coupling.stabilityIndex ?? 0.5;
  const flow = coupling.resonanceFlow ?? 0.5;

  let preset = cfg.preset;
  if (risk > 0.65 && presets.soft) {
    preset = presets.soft;
  } else if (coh < 0.35 && presets.balanced) {
    preset = presets.balanced;
  } else if (flow > 0.65 && presets.focus) {
    preset = presets.focus;
  }

  return preset === cfg.preset ? cfg : { ...cfg, preset };
}

function stepAxisWave(
  axis: ResonanceAxis,
  dt: number,
  prev: AxisWave | undefined,
  cfg: ResonanceConfig,
  cerebellum: CerebellumSnapshot,
  coupling: AxisCouplingSnapshot,
  phaseShift: number,
  axisWeight: number,
): AxisWave {
  const tone = resolveAxisTone(axis, coupling);
  const prevPhase = prev?.phase ?? 0;
  const prevAmp = prev?.amplitude ?? 0.25;
  const prevEnergy = prev?.energy ?? 0.2;

  const freqMultiplier = 1 + cfg.preset.couplingGain * tone.resonance - 0.5 * (cerebellum.overshootRisk ?? 0);
  const freq = Math.max(0.001, cfg.preset.baseFreqHz * freqMultiplier);
  const phase = normalizePhase(prevPhase + TWO_PI * freq * dt + phaseShift);

  const stabilityLift = 0.05 * (cerebellum.stabilityScore ?? 0.5) - 0.03 * (cerebellum.totalCorrectionMagnitude ?? 0);
  const holdingLift = 0.02 * tone.holding;
  const weightLift = 0.01 * axisWeight;
  const amplitude = clamp01(Math.min(cfg.maxAmplitude, prevAmp + stabilityLift + holdingLift + weightLift));

  const value = amplitude * Math.sin(phase);
  const energy = clamp01(0.7 * prevEnergy + 0.3 * amplitude * (1 + tone.baseline));

  return { phase, amplitude, energy, value };
}

function resolveAxisTone(axis: ResonanceAxis, coupling: AxisCouplingSnapshot): AxisTone {
  const pairs: Record<ResonanceAxis, [AxisCouplingSnapshot['LS'], AxisCouplingSnapshot['LC']]> = {
    L: [coupling.LS, coupling.LC],
    S: [coupling.LS, coupling.SC],
    C: [coupling.LC, coupling.SC],
  };
  const [a, b] = pairs[axis];
  const resonance = clamp01(avg([a.resonance, b.resonance]));
  const holding = clamp01(avg([a.holding, b.holding]));
  const baseline = coupling.baselineFlow ?? 0;

  return { resonance, holding, baseline };
}

function computeCoherence(L: AxisWave, S: AxisWave, C: AxisWave): number {
  const pairs = [
    coherencePair(L.phase, S.phase),
    coherencePair(L.phase, C.phase),
    coherencePair(S.phase, C.phase),
  ];
  return clamp01(avg(pairs));
}

function coherencePair(a: number, b: number): number {
  return (Math.cos(a - b) + 1) / 2;
}

function computeBeats(L: AxisWave, S: AxisWave, C: AxisWave): number {
  const diffs = [Math.abs(L.value - S.value), Math.abs(L.value - C.value), Math.abs(S.value - C.value)];
  return clamp01(avg(diffs));
}

function computeEnergyBalance(
  L: AxisWave,
  S: AxisWave,
  C: AxisWave,
  cerebellum: CerebellumSnapshot,
  coupling: AxisCouplingSnapshot,
): number {
  const baseline = coupling.baselineFlow ?? 0;
  const avgEnergy = avg([L.energy, S.energy, C.energy]);
  const stability = cerebellum.stabilityScore ?? 0.5;
  const overshootPenalty = cerebellum.overshootRisk ?? 0;
  return clamp01(avgEnergy * (0.8 + 0.2 * stability + baseline) - 0.1 * overshootPenalty);
}

function normalizePhase(phase: number): number {
  const mod = phase % TWO_PI;
  return mod < 0 ? mod + TWO_PI : mod;
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
