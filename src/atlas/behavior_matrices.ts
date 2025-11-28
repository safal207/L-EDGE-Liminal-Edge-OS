export interface BehavioralMatrix {
  id: number;
  pattern: [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1];
  stabilityScore: number; // 0..1
}

const bitPattern = (value: number): [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1] => {
  const bits = value.toString(2).padStart(6, '0').split('').map((b) => (b === '1' ? 1 : 0)) as Array<0 | 1>;
  return [bits[0], bits[1], bits[2], bits[3], bits[4], bits[5]];
};

export const BEHAVIORAL_MATRICES: BehavioralMatrix[] = Array.from({ length: 64 }, (_, index) => {
  const pattern = bitPattern(index);
  const transitions = pattern.reduce<number>((acc, bit, idx, arr) => {
    if (idx === 0) return acc;
    return acc + (arr[idx - 1] === bit ? 0 : 1);
  }, 0);
  const stabilityScore = Number((1 - transitions / 6).toFixed(3));

  return {
    id: index + 1,
    pattern,
    stabilityScore,
  };
});

export const selectBehavioralMatrix = (score: number): BehavioralMatrix => {
  const clamped = Math.min(1, Math.max(0, score));
  const index = Math.min(BEHAVIORAL_MATRICES.length - 1, Math.round(clamped * (BEHAVIORAL_MATRICES.length - 1)));
  return BEHAVIORAL_MATRICES[index];
};
