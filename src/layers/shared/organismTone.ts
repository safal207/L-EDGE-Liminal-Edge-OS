import type { BreathingSnapshot, BreathingPhase } from '@/layers/L33_breathing';

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

export function getCurrentOrganismTone(): OrganismTone | null {
  return currentTone;
}

export function setCurrentOrganismTone(tone: OrganismTone | null): void {
  currentTone = tone;
}
