import { v4 as uuidv4 } from 'uuid';
import { PerceptionSignal, PerceptionSnapshot, PerceptionStatus } from './types';

interface PerceptionEngineOptions {
  maxHistory?: number;
  noiseThreshold?: number;
  anomalyThreshold?: number;
}

export class PerceptionEngine {
  private readonly maxHistory: number;
  private readonly noiseThreshold: number;
  private readonly anomalyThreshold: number;
  private signals: PerceptionSignal[] = [];
  private snapshot: PerceptionSnapshot = {
    noiseLevel: 0,
    signalLevel: 0,
    anomalies: 0,
    signalsProcessed: 0,
    status: 'ok',
    lastUpdated: Date.now(),
  };

  constructor(options?: PerceptionEngineOptions) {
    this.maxHistory = options?.maxHistory ?? 200;
    this.noiseThreshold = options?.noiseThreshold ?? 0.2;
    this.anomalyThreshold = options?.anomalyThreshold ?? 0.7;
  }

  ingestSignal(signal: Omit<PerceptionSignal, 'id'> & { id?: string }): void {
    const normalized = {
      ...signal,
      id: signal.id ?? uuidv4(),
      intensity: clamp(signal.intensity),
    } satisfies PerceptionSignal;

    this.signals = this.trim([...this.signals, normalized]);
    this.snapshot = this.computeSnapshot();
  }

  getSnapshot(): PerceptionSnapshot {
    return this.snapshot;
  }

  clear(): void {
    this.signals = [];
    this.snapshot = {
      noiseLevel: 0,
      signalLevel: 0,
      anomalies: 0,
      signalsProcessed: 0,
      status: 'ok',
      lastUpdated: Date.now(),
    };
  }

  private computeSnapshot(): PerceptionSnapshot {
    if (this.signals.length === 0) {
      return { ...this.snapshot, noiseLevel: 0, signalLevel: 0, anomalies: 0, status: 'ok', lastUpdated: Date.now() };
    }

    const noiseSignals = this.signals.filter((s) => s.type === 'noise' || s.intensity < this.noiseThreshold);
    const anomalySignals = this.signals.filter(
      (s) => s.type === 'anomaly' || (s.type === 'alert' && s.intensity >= this.anomalyThreshold)
    );
    const meaningfulSignals = this.signals.filter((s) => !noiseSignals.includes(s));

    const noiseLevel = clamp(noiseSignals.length / this.signals.length);
    const signalLevel = meaningfulSignals.length
      ? clamp(meaningfulSignals.reduce((sum, s) => sum + s.intensity, 0) / meaningfulSignals.length)
      : 0;
    const anomalies = anomalySignals.length;
    const status = this.resolveStatus({ noiseLevel, signalLevel, anomalies });

    return {
      noiseLevel,
      signalLevel,
      anomalies,
      status,
      signalsProcessed: this.signals.length,
      lastUpdated: Date.now(),
    };
  }

  private resolveStatus(snapshot: {
    noiseLevel: number;
    signalLevel: number;
    anomalies: number;
  }): PerceptionStatus {
    if (snapshot.anomalies > 5 || snapshot.noiseLevel > 0.7) {
      return 'critical';
    }
    if (snapshot.anomalies > 2 || snapshot.noiseLevel > 0.5) {
      return 'degraded';
    }
    if (snapshot.noiseLevel > 0.25) {
      return 'noisy';
    }
    return 'ok';
  }

  private trim<T>(items: T[]): T[] {
    if (items.length <= this.maxHistory) return items;
    return items.slice(items.length - this.maxHistory);
  }
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
