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
  cycles: number;
  recoveryEmphasis: number; // 0..1
  replayEmphasis: number; // 0..1
}

export function planSleep(ctx: SleepContext): SleepPlan {
  const defaultPlan: SleepPlan = {
    mode: 'light',
    cycles: 2,
    recoveryEmphasis: 0.5,
    replayEmphasis: 0.5,
  };

  const fatigue = ctx.bodyFatigue;
  if (!fatigue) {
    return defaultPlan;
  }

  if (fatigue.recoveryNeed > 0.85 || fatigue.depletionLevel > 0.75 || fatigue.suggestedSleepMode === 'emergency') {
    return {
      mode: 'deep',
      cycles: 5,
      recoveryEmphasis: 0.9,
      replayEmphasis: 0.1,
    } satisfies SleepPlan;
  }

  if (fatigue.suggestedSleepMode === 'integrative') {
    return {
      mode: 'integrative',
      cycles: 3,
      recoveryEmphasis: 0.6,
      replayEmphasis: 0.7,
    } satisfies SleepPlan;
  }

  if (fatigue.suggestedSleepMode === 'deep' || fatigue.fatigueLevel > 0.65) {
    return {
      mode: 'deep',
      cycles: 4,
      recoveryEmphasis: 0.8,
      replayEmphasis: 0.25,
    } satisfies SleepPlan;
  }

  return defaultPlan;
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
    const sleepPlan = planSleep(ctx ?? {});
    const consolidation = consolidateEvents(events, sleepPlan);
    const baseIterations = sleepPlan.mode === 'integrative' ? 4 : sleepPlan.mode === 'deep' ? 2 + Math.round(sleepPlan.recoveryEmphasis * 2) : 3;
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
