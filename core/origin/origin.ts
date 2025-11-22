import { clamp } from '../../meta/patternDetector';
import type { MetaSystemSnapshot } from '../metaOrchestrator/types';
import type { OriginConfig, OriginState, OriginTone, OriginUpdateInput } from './types';

const DEFAULT_RESOLVED_LIMIT = 12;

const selectDirection = (metaSnapshot: MetaSystemSnapshot): string => {
  const tension = metaSnapshot.meta.tension ?? 0;
  const fieldMode = metaSnapshot.field?.mode ?? 'unknown';
  const resonanceMode = metaSnapshot.resonance?.primaryMode ?? 'unknown';
  const intentAlignment = metaSnapshot.intent?.fieldAlignment ?? 'unknown';

  if (tension > 0.65) {
    return 'stabilization';
  }
  if (fieldMode === 'supportive' && intentAlignment === 'aligned') {
    return 'expansion';
  }
  if (resonanceMode === 'fragmented') {
    return 'integration';
  }
  return 'orientation';
};

const selectTone = (metaSnapshot: MetaSystemSnapshot): OriginTone => {
  const coherence = metaSnapshot.meta.coherence ?? 0;
  const tension = metaSnapshot.meta.tension ?? 0;

  if (tension >= 0.7) return 'deep';
  if (coherence >= 0.7 && tension <= 0.4) return 'bright';
  if (coherence >= 0.5) return 'warm';
  return 'neutral';
};

const boundList = (items: string[], limit: number): string[] =>
  items.length > limit ? items.slice(items.length - limit) : items;

export class OriginNode {
  private state: OriginState;
  private readonly resolvedLimit: number;

  constructor(config: OriginConfig = {}) {
    this.resolvedLimit = config.resolvedPatternsLimit ?? DEFAULT_RESOLVED_LIMIT;
    this.state = {
      timestamp: Date.now(),
      rootVector: {
        meaning: config.meaning ?? 'liminal-seed',
        direction: config.direction ?? 'orientation',
        tone: config.tone ?? 'neutral',
      },
      lineage: {
        corePrinciples: config.corePrinciples ?? ['stay-aware', 'preserve-coherence', 'choose-balance'],
        inheritedPatterns: config.inheritedPatterns ?? ['edge-adaptation'],
        resolvedPatterns: [],
      },
      intentionCore: {
        purpose: config.purpose ?? 'grow toward clarity and supportive resonance',
        clarity: 0.5,
      },
      summary: 'Origin initialized. Awaiting meta context.',
    };
  }

  update({ metaSnapshot }: OriginUpdateInput): OriginState {
    const direction = selectDirection(metaSnapshot);
    const tone = selectTone(metaSnapshot);
    const clarity = clamp(
      (metaSnapshot.meta.coherence + (1 - (metaSnapshot.meta.tension ?? 0))) / 2,
    );

    const resolvedPatterns = [...this.state.lineage.resolvedPatterns];
    if ((metaSnapshot.meta.tension ?? 0) < 0.35 && metaSnapshot.meta.coherence > 0.5) {
      resolvedPatterns.push('stability-cycle-integrated');
    }

    this.state = {
      timestamp: metaSnapshot.timestamp ?? Date.now(),
      rootVector: {
        meaning: this.state.rootVector.meaning,
        direction,
        tone,
      },
      lineage: {
        corePrinciples: this.state.lineage.corePrinciples,
        inheritedPatterns: this.state.lineage.inheritedPatterns,
        resolvedPatterns: boundList(resolvedPatterns, this.resolvedLimit),
      },
      intentionCore: {
        purpose: this.state.intentionCore.purpose,
        clarity,
      },
      summary: this.composeSummary({ direction, tone, clarity, metaSnapshot }),
    };

    return this.state;
  }

  getState(): OriginState {
    return this.state;
  }

  private composeSummary({
    direction,
    tone,
    clarity,
    metaSnapshot,
  }: {
    direction: string;
    tone: OriginTone;
    clarity: number;
    metaSnapshot: MetaSystemSnapshot;
  }): string {
    const coherence = metaSnapshot.meta.coherence ?? 0;
    const tension = metaSnapshot.meta.tension ?? 0;
    const intentAlignment = metaSnapshot.intent?.fieldAlignment ?? 'unknown';
    const fieldMode = metaSnapshot.field?.mode ?? 'unknown';

    return [
      `Root oriented toward ${direction} with a ${tone} tone`,
      `clarity ${(clarity * 100).toFixed(0)}%`,
      `coherence ${(coherence * 100).toFixed(0)}%`,
      `tension ${(tension * 100).toFixed(0)}%`,
      `intent alignment ${intentAlignment}`,
      `field mode ${fieldMode}`,
    ].join(' | ');
  }
}
