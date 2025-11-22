import { v4 as uuidv4 } from 'uuid';
import {
  FieldObservation,
  FieldObservationInput,
  FieldPattern,
  FieldPatternKind,
  FieldResonanceEngineOptions,
  FieldResonanceState,
  FieldSnapshot,
} from './contracts';

const DEFAULT_TAGS = ['baseline'];

export class FieldResonanceEngine {
  private readonly historyLimit: number;
  private readonly patternLimit: number;
  private readonly scoreThreshold: number;
  private state: FieldResonanceState;

  constructor(options?: FieldResonanceEngineOptions) {
    this.historyLimit = options?.historyLimit ?? 120;
    this.patternLimit = options?.patternLimit ?? 8;
    this.scoreThreshold = options?.scoreThreshold ?? 0.3;
    const baseline = this.buildSnapshot([], []);
    this.state = {
      snapshot: baseline,
      history: [],
      patterns: [],
    };
  }

  evaluate(input: FieldObservationInput): FieldSnapshot {
    const observation = this.normalizeObservation(input);
    const history = this.trimHistory([...this.state.history, observation]);
    const patterns = this.computePatterns(history);
    const snapshot = this.buildSnapshot(history, patterns);

    this.state = { snapshot, history, patterns } satisfies FieldResonanceState;
    return snapshot;
  }

  getSnapshot(): FieldSnapshot {
    return this.state.snapshot;
  }

  listPatterns(limit = this.patternLimit): FieldPattern[] {
    return this.state.patterns.slice(0, limit);
  }

  listHistory(limit = this.historyLimit): FieldObservation[] {
    return this.state.history.slice(-limit).reverse();
  }

  clear(): void {
    const baseline = this.buildSnapshot([], []);
    this.state = { snapshot: baseline, history: [], patterns: [] } satisfies FieldResonanceState;
  }

  private normalizeObservation(input: FieldObservationInput): FieldObservation {
    const intentMode = input.intentMode ?? 'UNKNOWN';
    const emotionState = input.emotionState ?? 'neutral';
    const stress = clamp(input.stress ?? 0.5);
    const threat = clamp(input.threat ?? 0.4);
    const opportunity = clamp(input.opportunity ?? 0.5);
    const annotations = input.annotations ?? [];
    const timestamp = input.timestamp ?? Date.now();

    const stateKey = this.buildStateKey({ intentMode, emotionState, stress, threat, opportunity });

    return { intentMode, emotionState, stress, threat, opportunity, annotations, timestamp, stateKey };
  }

  private buildSnapshot(history: FieldObservation[], patterns: FieldPattern[]): FieldSnapshot {
    const dominantPatterns = patterns.filter((pattern) => pattern.kind !== 'corridor').slice(0, this.patternLimit);
    const candidatePatterns = patterns.filter((pattern) => pattern.kind === 'corridor').slice(0, this.patternLimit);
    const entropy = computeEntropy(dominantPatterns.map((p) => p.strength));
    const confidence = candidatePatterns.length
      ? clamp(candidatePatterns.reduce((acc, p) => acc + p.strength, 0) / candidatePatterns.length)
      : 0;

    return {
      pastField: { dominantPatterns, entropy },
      futureField: { candidatePatterns, confidence },
      lastUpdated: Date.now(),
    } satisfies FieldSnapshot;
  }

  private computePatterns(history: FieldObservation[]): FieldPattern[] {
    if (history.length < 2) return [];

    const patterns = new Map<string, { kind: FieldPatternKind; tags: string[]; score: number; count: number }>();

    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i];
      const next = history[i + 1];
      const transitionId = `${current.stateKey}->${next.stateKey}`;
      const tags = mergeTags(current, next);
      const stressRise = next.stress - current.stress;
      const tensionScore = Math.max(0, next.threat - current.opportunity);

      if (current.stateKey === next.stateKey) {
        this.bumpPattern(patterns, transitionId, 'loop', tags, 0.7 + next.opportunity * 0.2);
      }

      if (isUnhealthy(next)) {
        const severity = clamp(next.stress * 0.6 + next.threat * 0.4);
        this.bumpPattern(patterns, `${transitionId}-trap`, 'trap', tags, severity + tensionScore * 0.3);
      }

      if (isHealthy(next)) {
        const relief = clamp((1 - next.stress) * 0.6 + next.opportunity * 0.4);
        this.bumpPattern(patterns, `${transitionId}-corridor`, 'corridor', tags, relief + (0.1 - stressRise * 0.2));
      }
    }

    return Array.from(patterns.values())
      .map<FieldPattern>((pattern) => ({
        id: uuidv4(),
        kind: pattern.kind,
        tags: pattern.tags.length ? pattern.tags : DEFAULT_TAGS,
        strength: clamp(pattern.score),
        evidenceCount: pattern.count,
      }))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, this.patternLimit);
  }

  private bumpPattern(
    patterns: Map<string, { kind: FieldPatternKind; tags: string[]; score: number; count: number }>,
    key: string,
    kind: FieldPatternKind,
    tags: string[],
    contribution: number,
  ): void {
    if (contribution < this.scoreThreshold) return;
    const existing = patterns.get(key);
    const nextScore = contribution + (existing?.score ?? 0);
    const nextCount = (existing?.count ?? 0) + 1;
    patterns.set(key, {
      kind,
      tags: Array.from(new Set([...(existing?.tags ?? []), ...tags])),
      score: nextScore,
      count: nextCount,
    });
  }

  private trimHistory(history: FieldObservation[]): FieldObservation[] {
    if (history.length <= this.historyLimit) return history;
    return history.slice(history.length - this.historyLimit);
  }

  private buildStateKey(observation: Pick<FieldObservation, 'intentMode' | 'emotionState' | 'stress' | 'threat' | 'opportunity'>): string {
    const stressBucket = bucketize(observation.stress);
    const threatBucket = bucketize(observation.threat);
    const opportunityBucket = bucketize(observation.opportunity);
    return `${observation.intentMode}|${observation.emotionState}|stress:${stressBucket}|threat:${threatBucket}|opp:${opportunityBucket}`;
  }
}

const bucketize = (value: number): 'low' | 'medium' | 'high' => {
  if (value >= 0.66) return 'high';
  if (value >= 0.33) return 'medium';
  return 'low';
};

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

const isUnhealthy = (observation: FieldObservation): boolean => {
  return observation.stress > 0.7 || observation.threat > 0.65 || observation.emotionState.toLowerCase().includes('alert');
};

const isHealthy = (observation: FieldObservation): boolean => {
  const calmEmotion = /(calm|ready|explore|open)/i.test(observation.emotionState);
  return observation.stress < 0.45 && observation.threat < 0.5 && (calmEmotion || observation.opportunity > observation.threat);
};

const mergeTags = (a: FieldObservation, b: FieldObservation): string[] => {
  const tags = new Set<string>();
  const add = (value: string) => {
    const clean = value.trim();
    if (clean) tags.add(clean);
  };
  a.annotations.forEach(add);
  b.annotations.forEach(add);
  add(a.intentMode);
  add(b.intentMode);
  add(a.emotionState);
  add(b.emotionState);
  return Array.from(tags).slice(0, 6);
};

const computeEntropy = (values: number[]): number => {
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total === 0) return 0;
  const normalized = values.map((v) => v / total);
  const entropy = -normalized.reduce((sum, p) => (p > 0 ? sum + p * Math.log2(p) : sum), 0);
  const maxEntropy = Math.log2(values.length);
  return maxEntropy > 0 ? clamp(entropy / maxEntropy) : 0;
};
