import type { EmotionalGradient, ReceptorSignals } from './types';

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const balanceScore = (signals: ReceptorSignals) => {
  const punctuationBalance = 1 - clamp((signals.exclamationCount + signals.questionMarks) / Math.max(1, signals.tokenEstimate));
  const hesitationPenalty = clamp(signals.ellipsisCount * 0.1);
  return clamp(0.6 * punctuationBalance + 0.4 * (1 - hesitationPenalty));
};

export const buildEmotionalGradient = (
  signals: ReceptorSignals,
  entropyLevel?: number,
): EmotionalGradient => {
  const entropy = entropyLevel ?? 0.5;
  const energy = clamp((signals.tokenEstimate / 120) + signals.ideaBursts * 0.3 + (1 - entropy) * 0.2);
  const curiosity = clamp(
    signals.questionMarks * 0.2 +
      signals.uncertaintyHints * 0.3 +
      energy * 0.25 +
      signals.ideaBursts * 0.25 +
      signals.positiveHints * 0.3 +
      0.05,
  );
  const fatigue = clamp(signals.fatigueHints + (signals.tokenEstimate > 150 ? 0.2 : 0) + entropy * 0.15);
  const tension = clamp(signals.uncertaintyHints * 0.4 + entropy * 0.3 + signals.ellipsisCount * 0.05);
  const uplift = clamp(
    energy * 0.6 +
      signals.positiveHints * 0.5 +
      signals.ideaBursts * 0.25 -
      fatigue * 0.15,
  );
  const groundedness = clamp(balanceScore(signals) + signals.positiveHints * 0.2 - entropy * 0.2);
  const calm = clamp(0.6 + signals.positiveHints * 0.4 - tension * 0.5 - signals.exclamationCount * 0.05);
  const focus = clamp(groundedness * 0.5 + (1 - entropy) * 0.3 + (signals.sentenceLength ? 0.2 : 0));
  const confidence = clamp(groundedness * 0.4 + uplift * 0.3 - fatigue * 0.3 + (1 - entropy) * 0.2);

  return {
    calm,
    tension,
    curiosity,
    fatigue,
    uplift,
    groundedness,
    focus,
    confidence,
  };
};
