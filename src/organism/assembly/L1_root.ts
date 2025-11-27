export interface L1RootSnapshot {
  baseVibration: number; // 0..1
  sensitivity: number; // ability to discern signals
  presence: number; // felt sense of "I am"
  trustSeed: number; // early trust in the environment
  note: string;
}

export function computeL1Root(inputs: { noiseLevel: number; signalClarity: number }): L1RootSnapshot {
  const { noiseLevel, signalClarity } = inputs;

  const baseVibration = Math.max(0.1, 1 - noiseLevel);
  const sensitivity = signalClarity * 0.5 + 0.25;
  const presence = 0.5 + (signalClarity - noiseLevel) * 0.2;
  const trustSeed = Math.max(0, presence * 0.3 + sensitivity * 0.2);

  return {
    baseVibration,
    sensitivity,
    presence,
    trustSeed,
    note: "L1: первичная вибрация, доверие и чувство 'я есть'",
  };
}
