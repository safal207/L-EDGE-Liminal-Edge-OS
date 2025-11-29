export interface BehavioralModulator {
  id: number;
  label: string;
  modulationStrength: number; // 0..1
}

const MODULATOR_LABELS = [
  'Initiator',
  'Stabilizer',
  'Connector',
  'Diverger',
  'Synthesizer',
  'Realizer',
  'Harmonizer',
  'Analyst',
  'Navigator',
  'Catalyst',
  'Conservator',
  'Executor',
];

export const BEHAVIORAL_MODULATORS: BehavioralModulator[] = MODULATOR_LABELS.map((label, index) => ({
  id: index + 1,
  label,
  modulationStrength: Number((0.45 + index * 0.03).toFixed(3)) % 1,
}));

export const selectBehavioralModulator = (score: number): BehavioralModulator => {
  const clamped = Math.min(1, Math.max(0, score));
  const index = Math.min(BEHAVIORAL_MODULATORS.length - 1, Math.round(clamped * (BEHAVIORAL_MODULATORS.length - 1)));
  return BEHAVIORAL_MODULATORS[index];
};
