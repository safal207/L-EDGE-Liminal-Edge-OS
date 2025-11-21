import { v4 as uuidv4 } from 'uuid';
import { PerceptionClassification, PerceptionEngineOptions } from './contracts';
import { ExternalSignal, ExternalSignalKind, PerceptionState, PerceptionSummary } from './types';

export class PerceptionEngine {
  private readonly maxHistory: number;
  private readonly pressureWeights: Record<ExternalSignalKind, number>;
  private readonly threatWeights: Record<ExternalSignalKind, number>;
  private readonly opportunityWeights: Record<ExternalSignalKind, number>;
  private events: ExternalSignal[] = [];
  private summary: PerceptionSummary = {
    pressure: 0,
    threatScore: 0,
    opportunityScore: 0,
    noiseLevel: 0,
    status: 'calm',
    signalsProcessed: 0,
    lastUpdated: Date.now(),
  };

  constructor(options?: PerceptionEngineOptions) {
    this.maxHistory = options?.maxHistory ?? 300;
    const baseWeights: Record<ExternalSignalKind, number> = {
      environmentPressure: 1,
      resourceRisk: 0.9,
      upstreamDelaySpike: 0.8,
      syncLoss: 0.7,
      threatDetected: 1,
      externalOpportunity: 0.6,
      telemetry: 0.2,
    };
    this.pressureWeights = { ...baseWeights, ...(options?.pressureWeights ?? {}) } as Record<ExternalSignalKind, number>;
    this.threatWeights = {
      ...baseWeights,
      externalOpportunity: 0,
      telemetry: 0,
      ...(options?.threatWeights ?? {}),
    } as Record<ExternalSignalKind, number>;
    this.opportunityWeights = {
      ...baseWeights,
      externalOpportunity: 1,
      environmentPressure: 0,
      resourceRisk: 0,
      syncLoss: 0,
      threatDetected: 0,
      upstreamDelaySpike: 0,
      telemetry: 0.3,
      ...(options?.opportunityWeights ?? {}),
    } as Record<ExternalSignalKind, number>;
  }

  ingestSignal(signal: Omit<ExternalSignal, 'id'> & { id?: string }): void {
    const normalized: ExternalSignal = {
      ...signal,
      id: signal.id ?? uuidv4(),
      intensity: clamp(signal.intensity),
    };
    this.events = this.trim([...this.events, normalized]);
    this.summary = this.computeSummary();
  }

  evaluate(): PerceptionClassification {
    this.summary = this.computeSummary();
    return { level: this.summary.status, summary: this.summary };
  }

  getSnapshot(): PerceptionSummary {
    return this.summary;
  }

  getSummary(): PerceptionSummary {
    return this.summary;
  }

  getState(): PerceptionState {
    return { summary: this.summary, events: this.events };
  }

  listEvents(limit: number): ExternalSignal[] {
    return this.events.slice(-limit).reverse();
  }

  clear(): void {
    this.events = [];
    this.summary = {
      pressure: 0,
      threatScore: 0,
      opportunityScore: 0,
      noiseLevel: 0,
      status: 'calm',
      signalsProcessed: 0,
      lastUpdated: Date.now(),
    };
  }

  private computeSummary(): PerceptionSummary {
    if (this.events.length === 0) {
      return { ...this.summary, pressure: 0, threatScore: 0, opportunityScore: 0, noiseLevel: 0, status: 'calm', lastUpdated: Date.now(), signalsProcessed: 0 };
    }

    const weightedPressure = this.weightedScore(this.pressureWeights);
    const weightedThreat = this.weightedScore(this.threatWeights);
    const weightedOpportunity = this.weightedScore(this.opportunityWeights);
    const noiseLevel = clamp(this.events.filter((e) => e.kind === 'telemetry' && e.intensity < 0.25).length / this.events.length);
    const status = this.resolveStatus(weightedThreat, weightedPressure, weightedOpportunity);

    return {
      pressure: weightedPressure,
      threatScore: weightedThreat,
      opportunityScore: weightedOpportunity,
      noiseLevel,
      status,
      signalsProcessed: this.events.length,
      lastUpdated: Date.now(),
    };
  }

  private weightedScore(weights: Record<ExternalSignalKind, number>): number {
    if (!this.events.length) return 0;
    const total = this.events.reduce((sum, evt) => sum + weights[evt.kind] * evt.intensity, 0);
    return clamp(total / this.events.length);
  }

  private resolveStatus(threat: number, pressure: number, opportunity: number): PerceptionSummary['status'] {
    if (threat > 0.85 || pressure > 0.9) return 'critical';
    if (threat > 0.65 || pressure > 0.75) return 'alert';
    if (threat > 0.4 || pressure > 0.4 || opportunity > 0.6) return 'watch';
    return 'calm';
  }

  private trim<T>(items: T[]): T[] {
    if (items.length <= this.maxHistory) return items;
    return items.slice(items.length - this.maxHistory);
  }
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
