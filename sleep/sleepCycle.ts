import { EventEmitter } from 'events';
import { LiminalStorage } from '../storage/storage';
import { TransmutationEngine } from '../transmutation/transmutationEngine';
import { consolidateEvents, ConsolidationResult } from './consolidation';
import { DreamReport, runDreamSandbox } from './dreamSandbox';
import { SleepScheduler } from './scheduler';
import type { BodyFatigueSnapshot } from '../interoception/contracts';

export interface SleepMetrics {
  lastSleep: number;
  consolidationEvents: number;
  dreamIterations: number;
  noiseCleared: number;
  lastPlan?: SleepPlan;
}

export interface SleepContext {
  bodyFatigue?: BodyFatigueSnapshot;
}

export interface SleepPlan {
  mode: 'light' | 'deep' | 'integrative';
  durationFactor: number; // 0.5..2.0
  cognitiveOpen: boolean; // whether replay should explore new patterns
  recoveryEmphasis?: number; // optional weighting for restoration focus
  replayEmphasis?: number; // optional weighting for replay focus
}

export function planSleep(fatigue?: BodyFatigueSnapshot): SleepPlan {
  const base: SleepPlan = { mode: 'light', durationFactor: 0.8, cognitiveOpen: false };
  if (!fatigue) return base;

  const mode = fatigue.suggestedSleepMode;

  if (mode === 'deep' || fatigue.fatigueLevel > 0.7 || fatigue.recoveryNeed === 'high') {
    return { mode: 'deep', durationFactor: 1.5, cognitiveOpen: false } satisfies SleepPlan;
  }

  if (mode === 'integrative' || fatigue.recoveryNeed === 'medium') {
    return { mode: 'integrative', durationFactor: 1.0, cognitiveOpen: true } satisfies SleepPlan;
  }

  return base;
}

interface SleepCycleDeps {
  storage: LiminalStorage;
  scheduler?: SleepScheduler;
  transmutation?: TransmutationEngine;
}

export interface SleepEvents {
  cycle: (metrics: SleepMetrics) => void;
}

export class SleepCycle extends EventEmitter {
  private metrics: SleepMetrics = {
    lastSleep: 0,
    consolidationEvents: 0,
    dreamIterations: 0,
    noiseCleared: 0,
  };

  private readonly scheduler: SleepScheduler;
  private lastSignalStrength = 0;

  constructor(private readonly deps: SleepCycleDeps) {
    super();
    this.scheduler = deps.scheduler ?? new SleepScheduler();
    this.scheduler.onTick(() => {
      void this.trigger('auto');
    });
    if (deps.transmutation) {
      deps.transmutation.on('mutation', (metrics) => {
        this.lastSignalStrength = metrics.signalStrength;
      });
    }
  }

  override on<U extends keyof SleepEvents>(event: U, listener: SleepEvents[U]): this {
    return super.on(event, listener);
  }

  override emit<U extends keyof SleepEvents>(event: U, ...args: Parameters<SleepEvents[U]>): boolean {
    return super.emit(event, ...args);
  }

  start(): void {
    this.scheduler.start();
  }

  async trigger(mode: 'manual' | 'auto' = 'manual', ctx?: SleepContext): Promise<SleepMetrics> {
    const events = await this.deps.storage.queryEdgeEvents({ limit: 50 });
    const sleepPlan = planSleep(ctx?.bodyFatigue);
    const consolidation = consolidateEvents(events, sleepPlan);
    const baseIterations = sleepPlan.mode === 'integrative'
      ? 4
      : sleepPlan.mode === 'deep'
        ? Math.round(3 * sleepPlan.durationFactor)
        : 2;
    const dreamReport = runDreamSandbox(this.lastSignalStrength || 0.5, baseIterations);
    this.metrics = this.buildMetrics(consolidation, dreamReport, sleepPlan);
    if (mode === 'manual') {
      // manual trigger can reset signal memory for next dream burst
      this.lastSignalStrength = 0;
    }
    this.emit('cycle', this.metrics);
    return this.metrics;
  }

  getState(): SleepMetrics {
    return this.metrics;
  }

  private buildMetrics(consolidation: ConsolidationResult, dream: DreamReport, plan: SleepPlan): SleepMetrics {
    return {
      lastSleep: Date.now(),
      consolidationEvents: consolidation.consolidationEvents,
      dreamIterations: dream.iterations,
      noiseCleared: consolidation.noiseCleared,
      lastPlan: plan,
    };
  }
}
