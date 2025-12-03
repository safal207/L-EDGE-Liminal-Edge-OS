import type { ReceptorSignals, SenseInput } from './types';

const fatigueKeywords = ['tired', 'exhausted', 'fatigue', 'sleepy', 'drained'];
const positiveKeywords = [
  'thank you',
  'thanks',
  'grateful',
  'nice',
  'love',
  'appreciate',
  'excited',
  'inspired',
  'energized',
  'optimistic',
];
const uncertaintyKeywords = ['maybe', 'not sure', 'unsure', 'perhaps', 'confused', 'doubt'];

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const countOccurrences = (text: string, needles: string[]): number => {
  const lower = text.toLowerCase();
  return needles.reduce((count, needle) => count + (lower.includes(needle) ? 1 : 0), 0);
};

export const extractReceptorSignals = (input: SenseInput): ReceptorSignals => {
  const text = input.userText ?? '';
  const tokenEstimate =
    input.tokensCount ?? (text ? text.trim().split(/\s+/).length : 0);
  const questionMarks = (text.match(/[?]/g) ?? []).length;
  const ellipsisCount = (text.match(/\.\.\./g) ?? []).length;
  const exclamationCount = (text.match(/!/g) ?? []).length;
  const fatigueHints = countOccurrences(text, fatigueKeywords);
  const positiveHints = countOccurrences(text, positiveKeywords);
  const uncertaintyHints = countOccurrences(text, uncertaintyKeywords) + questionMarks;
  const ideaBursts = exclamationCount + Math.max(0, Math.floor(tokenEstimate / 80));
  const sentenceLength = input.avgSentenceLength ?? (text ? clamp(text.length / Math.max(1, tokenEstimate), 0, 80) : 0);

  return {
    tokenEstimate,
    questionMarks,
    ellipsisCount,
    exclamationCount,
    fatigueHints: clamp(fatigueHints / 3),
    positiveHints: clamp(positiveHints / 3),
    uncertaintyHints: clamp(uncertaintyHints / 5),
    ideaBursts: clamp(ideaBursts / 6),
    sentenceLength,
  };
};
