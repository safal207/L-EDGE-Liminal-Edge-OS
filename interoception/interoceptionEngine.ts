import { v4 as uuidv4 } from 'uuid';
import { clamp } from '../meta/patternDetector';
import { CirculationSnapshot, HeartbeatState } from '../core/types';
import {
  BodyFatigueSnapshot,
  InteroceptionContext,
  InteroceptionSignal,
  InteroceptionState,
  InteroceptionStatus,
} from './contracts';

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
      },
    };
  }

  private computeSummary(context: InteroceptionContext) {
    const now = Date.now();
    const bodyFatigue = computeBodyFatigueSnapshot(context);
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

export function computeBodyFatigueSnapshot(ctx: InteroceptionContext): BodyFatigueSnapshot {
  let fatigueLevel = 0.3;
  let depletionLevel = 0;
  let recoveryNeed = 0.3;
  let suggestedSleepMode: BodyFatigueSnapshot['suggestedSleepMode'] = 'light';

  const resource = ctx.resources;
  if (resource) {
    const strain = clamp(resource.strain);
    const energyGap = clamp(1 - resource.energy);
    const regeneration = clamp(resource.regenerationTendency);

    // Strain and low energy drive acute fatigue; regeneration tempers the urgency slightly.
    fatigueLevel = clamp(fatigueLevel + strain * 0.6 + energyGap * 0.25);
    recoveryNeed = clamp(recoveryNeed + strain * 0.4 + energyGap * 0.35 - regeneration * 0.1);

    // Integrative bias when system is calm but ready to replenish.
    if (strain < 0.45 && regeneration > 0.6) {
      suggestedSleepMode = 'integrative';
    }
  }

  if (ctx.minerals) {
    depletionLevel = clamp(ctx.minerals.depletionLevel);
    fatigueLevel = Math.max(fatigueLevel, clamp(depletionLevel * 0.7));
    recoveryNeed = clamp(recoveryNeed + depletionLevel * 0.5);

    if (depletionLevel > 0.65) {
      suggestedSleepMode = 'deep';
    }
  }

  // Deep or emergency sleep is suggested when depletion is critical or both fatigue and recovery need spike.
  if (depletionLevel > 0.85 || (fatigueLevel > 0.8 && recoveryNeed > 0.75)) {
    suggestedSleepMode = 'emergency';
  } else if (fatigueLevel > 0.7 && recoveryNeed > 0.65 && suggestedSleepMode !== 'integrative') {
    suggestedSleepMode = 'deep';
  } else if (suggestedSleepMode === 'integrative' && recoveryNeed > 0.65) {
    // Keep integrative but acknowledge recovery pull.
    recoveryNeed = clamp(recoveryNeed + 0.05);
  }

  // Clamp final scores and keep them consistent with the suggested mode.
  fatigueLevel = clamp(fatigueLevel);
  depletionLevel = clamp(depletionLevel);
  recoveryNeed = clamp(recoveryNeed);

  return {
    fatigueLevel,
    depletionLevel,
    recoveryNeed,
    suggestedSleepMode,
  } satisfies BodyFatigueSnapshot;
}
