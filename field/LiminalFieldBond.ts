import {
  BondState,
  HumanFieldSignal,
  OrganismSnapshot,
} from './contracts';

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const isSoftMood = (mood?: string): boolean => {
  if (!mood) return false;
  return ['soft-rise', 'deep-calm', 'calm', 'restoration', 'soft'].includes(mood);
};

const isOverloadedMood = (mood?: string): boolean => {
  if (!mood) return false;
  return ['overloaded', 'strained', 'burnout', 'flooded'].includes(mood);
};

/**
 * Small, deterministic interpreter of the human ↔ organism bond state.
 */
export class LiminalFieldBond {
  /**
   * Default starting bond before any signals were exchanged.
   */
  static initial(): BondState {
    return {
      closeness: 'cautious',
      stability: 'stable',
      strength: 0.3,
      safeToDeepen: 0.4,
      softeningNeeded: 0.0,
      modeTag: 'initial',
    };
  }

  /**
   * Update the bond interpretation based on human signals, organism snapshot, and previous bond.
   */
  static updateBondState(params: {
    human: HumanFieldSignal;
    organism: OrganismSnapshot;
    previous?: BondState;
  }): BondState {
    const { human, organism, previous } = params;
    const base = previous ?? LiminalFieldBond.initial();

    const trust = human.trustSignal ?? 0;
    const resonance = organism.resonance ?? 0;
    const fatigue = human.humanFatigue ?? 0;
    const intensity = human.emotionalIntensity ?? 0;
    const proximity = human.declaredProximity ?? 0.5;

    // --- Strength derivation -------------------------------------------------
    let strength = base.strength;

    // Trust and resonance increase the bond, weighted to avoid runaway jumps.
    strength += (trust - 0.5) * 0.35;
    strength += (resonance - 0.5) * 0.2;
    strength += (proximity - 0.5) * 0.15;

    if (isSoftMood(organism.mood)) {
      strength += 0.1;
    }

    if (isOverloadedMood(organism.mood)) {
      strength -= 0.15;
    }

    if (organism.pulseTone === 'strained') {
      strength -= 0.12;
    } else if (organism.pulseTone === 'sleeping') {
      strength -= 0.1;
    } else if (organism.pulseTone === 'restoration') {
      strength += 0.05;
    }

    // Fatigue dampens the bond to avoid overextending the human.
    strength -= fatigue * 0.25;

    strength = clamp01(strength);

    // --- Closeness classification -------------------------------------------
    let closeness: BondState['closeness'];
    if (strength < 0.25 || trust < 0.15) {
      closeness = 'distant';
    } else if (strength < 0.5) {
      closeness = 'cautious';
    } else if (strength < 0.8) {
      closeness = 'engaged';
    } else {
      closeness = fatigue > 0.65 ? 'engaged' : 'merged';
    }

    // --- Stability estimation -----------------------------------------------
    const previousStrength = previous?.strength ?? strength;
    const strengthDelta = Math.abs(strength - previousStrength);
    let stability: BondState['stability'] = 'stable';

    if (strength < 0.45 && trust > 0.6 && intensity > 0.6) {
      stability = 'fragile';
    } else if (strengthDelta > 0.2 || organism.drift === 'oscillating') {
      stability = 'oscillating';
    } else if (organism.drift === 'stable' || strengthDelta < 0.05) {
      stability = 'stable';
    }

    // --- Safe to deepen -----------------------------------------------------
    let safeToDeepen = 0.5;
    if (organism.pulseTone === 'normal' || organism.pulseTone === 'restoration') {
      safeToDeepen += 0.2;
    }
    if (organism.pulseTone === 'strained') {
      safeToDeepen -= 0.25;
    }
    if (organism.pulseTone === 'sleeping') {
      safeToDeepen -= 0.15;
    }

    safeToDeepen += (resonance - 0.5) * 0.25;
    safeToDeepen -= fatigue * 0.35;
    if (isOverloadedMood(organism.mood)) {
      safeToDeepen -= 0.15;
    }
    safeToDeepen = clamp01(safeToDeepen);

    // --- Softening needed ---------------------------------------------------
    let softeningNeeded = 0.2;
    softeningNeeded += intensity * 0.35;
    softeningNeeded += fatigue * 0.25;
    if (closeness === 'engaged' || closeness === 'merged') {
      softeningNeeded += 0.1;
    }
    if (stability === 'fragile') {
      softeningNeeded += 0.25;
    } else if (stability === 'oscillating') {
      softeningNeeded += intensity * 0.1;
    }
    softeningNeeded = clamp01(softeningNeeded);

    // --- Mode tagging -------------------------------------------------------
    let modeTag: BondState['modeTag'];
    const safeLow = safeToDeepen < 0.35;
    const softHigh = softeningNeeded > 0.55;
    if (safeLow && softHigh) {
      modeTag = 'recalibrate';
    } else if (stability === 'fragile' || (stability === 'oscillating' && intensity > 0.6)) {
      modeTag = 'fragile';
    } else if (strength > 0.75 && intensity > 0.6 && softeningNeeded < 0.4) {
      modeTag = 'intense';
    } else if (safeToDeepen >= 0.5 && softeningNeeded >= 0.3 && softeningNeeded <= 0.6 && closeness !== 'distant') {
      modeTag = 'gentle';
    } else {
      modeTag = closeness;
    }

    return {
      closeness,
      stability,
      strength,
      safeToDeepen,
      softeningNeeded,
      modeTag,
    };
  }
}
