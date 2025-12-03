import type { EmotionalGradient, SenseState, TemporalDrift } from './types';

const trendScore = (gradient: EmotionalGradient): number => {
  return (
    gradient.uplift * 0.35 +
    gradient.curiosity * 0.25 +
    gradient.calm * 0.2 +
    gradient.confidence * 0.2 -
    gradient.fatigue * 0.3 -
    gradient.tension * 0.25
  );
};

export const detectTemporalDrift = (
  previousStates: SenseState[] | undefined,
  currentGradient: EmotionalGradient,
): TemporalDrift => {
  if (!previousStates || previousStates.length === 0) return 'stable';

  const historyScores = previousStates.map((state) => trendScore(state.emotionalGradient));
  const currentScore = trendScore(currentGradient);
  const lastScore = historyScores[historyScores.length - 1];
  const lastDelta = currentScore - lastScore;

  if (historyScores.length >= 2) {
    const prevDelta = historyScores[historyScores.length - 1] - historyScores[historyScores.length - 2];
    const signChange = lastDelta !== 0 && prevDelta !== 0 && lastDelta * prevDelta < 0 && Math.abs(lastDelta) > 0.08;
    if (signChange) {
      return 'oscillating';
    }
  }

  if (lastDelta > 0.08) {
    return 'rising';
  }

  if (lastDelta < -0.08) {
    return 'falling';
  }

  return 'stable';
};
