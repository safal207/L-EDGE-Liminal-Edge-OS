export interface ForesightInput {
  pastLoops: number[];
  presentSignals: number[];
  futureBranches: number[][];
}

export interface ForesightResult {
  direction: number;
  confidence: number;
  attractor: 'growth' | 'contraction' | 'neutral';
}

export function computeForesight(input: ForesightInput): ForesightResult {
  const pastInfluence = average(input.pastLoops);
  const presentEnergy = average(input.presentSignals);
  const futurePull = average(input.futureBranches.map((branch) => average(branch)));

  const direction = pastInfluence * 0.25 + presentEnergy * 0.5 + futurePull * 0.25;
  const confidence = Math.min(1, Math.abs(direction));

  const attractor: ForesightResult['attractor'] =
    direction > 0.5 ? 'growth' : direction < -0.5 ? 'contraction' : 'neutral';

  return { direction, confidence, attractor };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}
