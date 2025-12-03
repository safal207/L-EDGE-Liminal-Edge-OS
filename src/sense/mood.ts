import type { EmotionalGradient } from './types';

const high = (value: number) => value >= 0.65;
const low = (value: number) => value < 0.3;
const mid = (value: number) => value >= 0.3 && value <= 0.7;

export const deriveMoodFromGradient = (gradient: EmotionalGradient): string => {
  const { fatigue, tension, calm, groundedness, uplift, curiosity } = gradient;

  if (high(fatigue) && (tension > 0.2 || calm < 0.55)) return 'overloaded';
  if (uplift > 0.5 && curiosity > 0.35) return 'soft-rise';
  if (high(calm) && high(groundedness) && low(tension)) return 'deep-calm';
  if (high(curiosity) && mid(tension)) return 'searching';

  const midSpread = [calm, tension, curiosity, fatigue, uplift, groundedness].every((value) =>
    mid(value),
  );
  if (midSpread) return 'neutral';

  if (fatigue > 0.55 && tension > 0.45) return 'strained';
  if (uplift > 0.55 && calm > 0.5) return 'buoyant';

  return 'neutral';
};
