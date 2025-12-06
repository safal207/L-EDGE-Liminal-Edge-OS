export interface BodyFatigueSnapshot {
  fatigueLevel: number; // 0–1
  depletionLevel: number; // 0–1
  recoveryNeed: 'low' | 'medium' | 'high';
  suggestedSleepMode: 'light' | 'deep' | 'integrative';
}

export interface FatigueContext {
  resources?: { energy: number; stability: number };
  minerals?: { trace: number; density: number };
  emotionalLoad?: number; // optional
  entropyLevel?: number; // optional
}

const clamp01 = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

export function computeBodyFatigueSnapshot(ctx: FatigueContext): BodyFatigueSnapshot {
  const energy = clamp01(ctx.resources?.energy ?? 0.6);
  const stability = clamp01(ctx.resources?.stability ?? 0.6);
  const mineralDensity = clamp01(ctx.minerals?.density ?? 0.6);
  const mineralTrace = clamp01(ctx.minerals?.trace ?? 0.5);
  const emotionalLoad = clamp01(ctx.emotionalLoad ?? 0.4);
  const entropyLevel = clamp01(ctx.entropyLevel ?? 0.4);

  const energyFatigue = 1 - energy;
  const mineralFatigue = 1 - mineralDensity;
  const emotionalFatigue = emotionalLoad * 0.8;
  const entropyFatigue = entropyLevel * 0.7;
  const stabilityRelief = (1 - stability) * 0.2;

  const fatigueLevel = clamp01(
    energyFatigue * 0.35 +
      mineralFatigue * 0.25 +
      emotionalFatigue * 0.2 +
      entropyFatigue * 0.2 +
      stabilityRelief,
  );

  const depletionLevel = clamp01(energyFatigue * 0.6 + (1 - mineralTrace) * 0.4);

  let recoveryNeed: BodyFatigueSnapshot['recoveryNeed'] = 'low';
  if (fatigueLevel > 0.7 || depletionLevel > 0.7) {
    recoveryNeed = 'high';
  } else if (fatigueLevel > 0.4 || depletionLevel > 0.4) {
    recoveryNeed = 'medium';
  }

  let suggestedSleepMode: BodyFatigueSnapshot['suggestedSleepMode'] = 'light';
  if (fatigueLevel > 0.7) {
    suggestedSleepMode = 'deep';
  } else if (fatigueLevel > 0.4 || depletionLevel > 0.4) {
    suggestedSleepMode = 'integrative';
  }

  return {
    fatigueLevel,
    depletionLevel,
    recoveryNeed,
    suggestedSleepMode,
  } satisfies BodyFatigueSnapshot;
}
