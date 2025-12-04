import type { BreathingSnapshot, BreathingPhase } from '@/layers/L33_breathing';
import type { CorePulseState } from '../L22_core_pulse/types';

export interface OrganismTone {
  phase: BreathingPhase;
  fuzzChaos: number; // 0..1
  fuzzStability: number; // 0..1
  fuzzGrowth: number; // 0..1
  fuzzFatigue: number; // 0..1
  luckSynergyScore: number; // 0..1
  isInFlow: boolean;
  isOverwhelmed: boolean;
  needsRecovery: boolean;
  corePulse?: CorePulseState;
}

let currentTone: OrganismTone | null = null;

export function deriveOrganismTone(snapshot: BreathingSnapshot): OrganismTone {
  const { phase, fuzzChaos, fuzzStability, fuzzGrowth, fuzzFatigue, luckSynergyScore } = snapshot;

  const isInFlow =
    fuzzStability > 0.5 &&
    fuzzGrowth > 0.4 &&
    luckSynergyScore > 0.6 &&
    fuzzChaos < 0.6;

  const isOverwhelmed = fuzzChaos > 0.7 && fuzzFatigue > 0.5;

  const needsRecovery = fuzzFatigue > 0.6 && fuzzGrowth < 0.3;

  const tone: OrganismTone = {
    phase,
    fuzzChaos,
    fuzzStability,
    fuzzGrowth,
    fuzzFatigue,
    luckSynergyScore,
    isInFlow,
    isOverwhelmed,
    needsRecovery,
  };

  currentTone = tone;

  return tone;
}

const clamp = (value: number, min = 0, max = 1): number => Math.min(Math.max(value, min), max);

/**
 * Returns a new organism tone enriched with subtle hints from the core pulse snapshot.
 * Keeps updates small so downstream consumers remain stable even when the pulse shifts.
 */
export function enrichToneWithCorePulse(tone: OrganismTone, pulse: CorePulseState): OrganismTone {
  const adjustedChaos = clamp(
    tone.fuzzChaos + (pulse.drift === 'irregular' ? 0.08 : pulse.drift === 'falling' ? 0.04 : -0.03) + (pulse.overloadLevel ?? 0) * 0.1,
  );
  const adjustedStability = clamp(
    tone.fuzzStability + (pulse.drift === 'rising' ? 0.05 : pulse.drift === 'falling' ? -0.05 : 0) - (pulse.overloadLevel ?? 0) * 0.05,
  );
  const adjustedGrowth = clamp(
    tone.fuzzGrowth + (pulse.drift === 'rising' ? 0.06 : pulse.drift === 'falling' ? -0.04 : 0) + (pulse.readiness - 0.5) * 0.1,
  );
  const adjustedFatigue = clamp(tone.fuzzFatigue + (pulse.drift === 'falling' ? 0.05 : pulse.drift === 'irregular' ? 0.03 : -0.02));

  const enriched: OrganismTone = {
    ...tone,
    fuzzChaos: adjustedChaos,
    fuzzStability: adjustedStability,
    fuzzGrowth: adjustedGrowth,
    fuzzFatigue: adjustedFatigue,
    luckSynergyScore: tone.luckSynergyScore,
    corePulse: pulse,
    isInFlow: adjustedStability > 0.5 && adjustedGrowth > 0.4 && tone.luckSynergyScore > 0.6 && adjustedChaos < 0.6,
    isOverwhelmed: adjustedChaos > 0.7 && adjustedFatigue > 0.5,
    needsRecovery: adjustedFatigue > 0.6 && adjustedGrowth < 0.3,
  };

  // The core pulse adds a gentle bias toward stability when rising, or grounding when falling.
  return enriched;
}

export function getCurrentOrganismTone(): OrganismTone | null {
  return currentTone;
}

export function setCurrentOrganismTone(tone: OrganismTone | null): void {
  currentTone = tone;
}
