export interface StabilizationMode {
  id: number;
  label: string;
  influence: number; // 0..1
}

export const STABILIZATION_MODES: StabilizationMode[] = [
  { id: 1, label: 'Coherence Mode', influence: 0.72 },
  { id: 2, label: 'Expansion Mode', influence: 0.68 },
  { id: 3, label: 'Protection Mode', influence: 0.74 },
  { id: 4, label: 'Integration Mode', influence: 0.7 },
];

export const selectStabilizationMode = (score: number): StabilizationMode => {
  const clamped = Math.min(1, Math.max(0, score));
  const index = Math.min(STABILIZATION_MODES.length - 1, Math.round(clamped * (STABILIZATION_MODES.length - 1)));
  return STABILIZATION_MODES[index];
};
