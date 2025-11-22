import { HeartbeatIntent } from '../core/types';
import { FieldSnapshot } from '../field/contracts';
import { IntentDecision } from '../intent/types';
import { NoosphereMode, NoosphereReport, NoosphereSnapshot } from './contracts';

const SUPPORTIVE_THRESHOLD = 0.6;
const LOW_TENSION_THRESHOLD = 0.4;
const HIGH_TENSION_THRESHOLD = 0.7;

export interface NoosphereReportContext {
  snapshot: NoosphereSnapshot;
  field: FieldSnapshot;
  lastIntent?: Partial<IntentDecision> & Partial<HeartbeatIntent>;
}

export const buildNoosphereReport = ({ snapshot, field, lastIntent }: NoosphereReportContext): NoosphereReport => {
  const mode = deriveMode(snapshot.supportLevel, snapshot.tensionLevel);
  const recommendedMode = deriveRecommendedMode(mode, field.futureField.confidence);
  const topPatterns = field.futureField.candidatePatterns.length
    ? field.futureField.candidatePatterns.slice(0, 4)
    : field.pastField.dominantPatterns.slice(0, 4);

  return {
    noosphere: {
      support: snapshot.supportLevel,
      tension: snapshot.tensionLevel,
      mode,
      dominantTag: snapshot.dominantTag,
    },
    field: {
      pastEntropy: field.pastField.entropy,
      futureConfidence: field.futureField.confidence,
      topPatterns,
    },
    intentHint: {
      recommendedMode,
      comment: buildComment(mode, recommendedMode, topPatterns[0]?.tags ?? [], lastIntent),
    },
    timestamp: Date.now(),
  } satisfies NoosphereReport;
};

const deriveMode = (support: number, tension: number): NoosphereMode => {
  if (support > SUPPORTIVE_THRESHOLD && tension < LOW_TENSION_THRESHOLD) return 'supportive';
  if (tension > HIGH_TENSION_THRESHOLD) return 'high_tension';
  return 'neutral';
};

const deriveRecommendedMode = (mode: NoosphereMode, confidence: number): string => {
  if (mode === 'supportive' && confidence > 0.55) return 'deep_focus';
  if (mode === 'high_tension') return 'recovery';
  if (confidence > 0.65) return 'explore';
  return 'maintenance';
};

const buildComment = (
  mode: NoosphereMode,
  recommended: string,
  patternTags: string[],
  intent?: Partial<IntentDecision> & Partial<HeartbeatIntent>,
): string => {
  const alignment = intent?.fieldAlignment;
  const alignmentNote = alignment ? `Intent is ${alignment.replace('_', ' ')} with the field.` : 'Intent alignment pending.';
  const patternHint = patternTags.length ? `Patterns highlight ${patternTags.slice(0, 3).join(', ')}.` : 'No dominant patterns yet.';

  switch (mode) {
    case 'supportive':
      return `${alignmentNote} Field is supportive — lean into ${recommended}. ${patternHint}`;
    case 'high_tension':
      return `${alignmentNote} Field tension is high — favor ${recommended} and reduce risk.`;
    default:
      return `${alignmentNote} Field is neutral — default to ${recommended}. ${patternHint}`;
  }
};
