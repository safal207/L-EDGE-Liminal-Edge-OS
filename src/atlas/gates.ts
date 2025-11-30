export interface GateLevel {
  id: number;
  label: string;
  complexity: number; // 0..1
  entropy: number; // 0..1
}

const normalize = (value: number, max: number): number => Number((value / max).toFixed(4));

export const GATE_LEVELS: GateLevel[] = Array.from({ length: 50 }, (_, index) => {
  const id = index + 1;
  const complexity = normalize(id, 50);
  const entropy = normalize(Math.sin(id / 5) * 0.5 + 0.5, 1);

  return {
    id,
    label: `Gate-${id.toString().padStart(2, '0')}`,
    complexity,
    entropy,
  };
});

export const selectGateByScore = (score: number): GateLevel => {
  const clamped = Math.min(1, Math.max(0, score));
  const index = Math.min(GATE_LEVELS.length - 1, Math.round(clamped * (GATE_LEVELS.length - 1)));
  return GATE_LEVELS[index];
};
