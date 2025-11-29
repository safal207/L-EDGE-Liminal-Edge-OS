export interface CompetenceVector {
  id: number;
  label: string;
  capability: number; // 0..1
  activationCost: number; // 0..1
}

const labels = [
  'Adaptation',
  'Protection',
  'Navigation',
  'Synthesis',
  'Analysis',
  'Recovery',
  'Filtering',
  'Integration',
  'Decisioning',
];

export const COMPETENCE_VECTORS: CompetenceVector[] = Array.from({ length: 72 }, (_, index) => {
  const id = index + 1;
  const label = `${labels[index % labels.length]}-${id.toString().padStart(2, '0')}`;
  const capability = Number(((0.35 + (id % labels.length) * 0.07) % 1).toFixed(3));
  const activationCost = Number(((0.25 + (id * 0.013)) % 1).toFixed(3));

  return {
    id,
    label,
    capability,
    activationCost,
  };
});

export const selectCompetenceVector = (score: number): CompetenceVector => {
  const clamped = Math.min(1, Math.max(0, score));
  const index = Math.min(COMPETENCE_VECTORS.length - 1, Math.round(clamped * (COMPETENCE_VECTORS.length - 1)));
  return COMPETENCE_VECTORS[index];
};
