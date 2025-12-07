import { v4 as uuidv4 } from 'uuid';
import { clamp } from '../meta/patternDetector';
import { CirculationSnapshot, HeartbeatState } from '../core/types';
import {
  computeBodyFatigueSnapshot,
  type FatigueContext,
} from './bodyFatigueSnapshot';
import {
  type BodyFatigueSnapshot,
  type InteroceptionContext,
  type InteroceptionSignal,
  type InteroceptionState,
  type InteroceptionStatus,
} from './contracts';

const toFatigueContext = (ctx: InteroceptionContext): FatigueContext => ({
  resources: ctx.resources
    ? {
        energy: ctx.resources.energy,
        stability: ctx.resources.mineralReserve ?? 0.6,
      }
    : undefined,
  minerals: ctx.minerals
    ? {
        trace: ctx.minerals.baselineReserve ?? 0.5,
        density: ctx.minerals.currentReserve ?? 0.6,
      }
    : undefined,
  emotionalLoad: ctx.emotionalLoad,
  entropyLevel: ctx.entropyLevel,
});

interface InteroceptionEngineOptions {
  maxSignals?: number;
}

export class InteroceptionEngine {
  private readonly maxSignals: number;
  private state: InteroceptionState = {
    signals: [],
    summary: {
      fatigue: 0,
      tension: 0,
      entropyPressure: 0,
      readiness: 1,
      clarity: 1,
      overload: 0,
      status: 'stable',
      annotations: [],
      lastUpdated: Date.now(),
      bodyFatigue: undefined,
    },
  };

  constructor(options?: InteroceptionEngineOptions) {
    this.maxSignals = options?.maxSignals ?? 120;
  }

  evaluate(context: InteroceptionContext): InteroceptionState {
    const summary = this.computeSummary(context);
    this.state = { ...this.state, summary };
    return this.state;
  }

  ingestSignal(signal: Omit<InteroceptionSignal, 'id'> & { id?: string }): void {
    const next = { ...signal, id: signal.id ?? uuidv4(), intensity: clamp(signal.intensity) } satisfies InteroceptionSignal;
    this.state.signals = this.trim([...this.state.signals, next]);
    this.state.summary = { ...this.state.summary, lastUpdated: Date.now() };
  }

  getState(): InteroceptionState {
    return this.state;
  }

  clear(): void {
    this.state = {
      signals: [],
      summary: {
        fatigue: 0,
        tension: 0,
        entropyPressure: 0,
        readiness: 1,
        clarity: 1,
        overload: 0,
        status: 'stable',
        annotations: [],
        lastUpdated: Date.now(),
        bodyFatigue: undefined,
      },
    };
  }

  private computeSummary(context: InteroceptionContext) {
    const now = Date.now();
    const bodyFatigue: BodyFatigueSnapshot = computeBodyFatigueSnapshot(
      toFatigueContext(context),
    );
    const fatigue = clamp(this.computeFatigue(context.sleep, now) * 0.6 + bodyFatigue.fatigueLevel * 0.4);
    const tension = this.computeTension(context.homeostasis.stressScore, context.reflex.lastActions.length, context.intent.mode);
    const entropyPressure = this.computeEntropyPressure(context.transmutation.discardedEntropy, context.transmutation.purifiedEvents, context.perception.noiseLevel);
    const overload = this.computeOverload(context.homeostasis.loadLevel, context.circulation, context.heartbeat);
    const readiness = clamp(1 - fatigue * 0.35 - tension * 0.35 - overload * 0.25);
    const clarity = clamp((1 - context.perception.noiseLevel) * 0.6 + (context.replay.reliefScore ?? 0) * 0.4);

    const annotations = this.buildAnnotations({ fatigue, tension, entropyPressure, overload, clarity });
    const status = this.resolveStatus({ fatigue, tension, entropyPressure, overload, clarity });

    return {
      fatigue,
      tension,
      entropyPressure,
      readiness,
      clarity,
      overload,
      status,
      annotations,
      lastUpdated: now,
      bodyFatigue,
    } satisfies InteroceptionState['summary'];
  }

  private computeFatigue(sleep: InteroceptionContext['sleep'], now: number): number {
    const timeSinceSleepHours = (now - sleep.lastSleep) / (1000 * 60 * 60);
    const recency = clamp(timeSinceSleepHours / 12); // 12h without sleep → fatigue 1
    const restoration = clamp(1 - clamp(sleep.noiseCleared / 10));
    return clamp(recency * 0.6 + restoration * 0.4);
  }

  private computeTension(stress: number, reflexActions: number, intentMode: string): number {
    const reflexFactor = clamp(reflexActions / 5, 0, 1);
    const intentPenalty = intentMode === 'CRITICAL' || intentMode === 'DEGRADED' ? 0.15 : 0;
    return clamp(stress * 0.7 + reflexFactor * 0.3 + intentPenalty);
  }

  private computeEntropyPressure(discardedEntropy: number, purifiedEvents: number, noiseLevel: number): number {
    const total = discardedEntropy + purifiedEvents;
    const entropyRatio = total === 0 ? 0 : clamp(discardedEntropy / Math.max(1, total));
    return clamp(entropyRatio * 0.6 + noiseLevel * 0.4);
  }

  private computeOverload(loadLevel: string, circulation?: CirculationSnapshot, heartbeat?: HeartbeatState): number {
    const loadPenalty = this.mapLoadLevel(loadLevel);
    const pressure = circulation ? clamp(circulation.pressure / 180) : 0;
    const runtimePressure = heartbeat ? clamp(heartbeat.runtimeActive / 30) : 0;
    return clamp(loadPenalty * 0.5 + pressure * 0.3 + runtimePressure * 0.2);
  }

  private mapLoadLevel(loadLevel: string): number {
    switch (loadLevel) {
      case 'critical':
        return 1;
      case 'high':
        return 0.75;
      case 'normal':
        return 0.45;
      case 'low':
      default:
        return 0.25;
    }
  }

  private buildAnnotations(metrics: {
    fatigue: number;
    tension: number;
    entropyPressure: number;
    overload: number;
    clarity: number;
  }): string[] {
    const flags: string[] = [];
    if (metrics.fatigue > 0.7) flags.push('fatigue.high');
    if (metrics.tension > 0.7) flags.push('tension.high');
    if (metrics.entropyPressure > 0.65) flags.push('entropy.pressure');
    if (metrics.overload > 0.7) flags.push('overload.high');
    if (metrics.clarity < 0.35) flags.push('clarity.low');
    if (metrics.clarity > 0.75 && metrics.tension < 0.4) flags.push('state.clear');
    return flags;
  }

  private resolveStatus(metrics: {
    fatigue: number;
    tension: number;
    entropyPressure: number;
    overload: number;
    clarity: number;
  }): InteroceptionStatus {
    if (metrics.overload > 0.85 || metrics.tension > 0.85) return 'critical';
    if (metrics.fatigue > 0.75 || metrics.entropyPressure > 0.7) return 'depleted';
    if (metrics.tension > 0.6 || metrics.overload > 0.6 || metrics.clarity < 0.35) return 'strained';
    return 'stable';
  }

  private trim<T>(items: T[]): T[] {
    if (items.length <= this.maxSignals) return items;
    return items.slice(items.length - this.maxSignals);
  }
}
