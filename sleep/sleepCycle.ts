import { EventEmitter } from 'events';
import { LiminalStorage } from '../storage/storage';
import { TransmutationEngine } from '../transmutation/transmutationEngine';
import { consolidateEvents, ConsolidationResult } from './consolidation';
import { DreamReport, runDreamSandbox } from './dreamSandbox';
import { SleepScheduler } from './scheduler';

export interface SleepMetrics {
  lastSleep: number;
  consolidationEvents: number;
  dreamIterations: number;
  noiseCleared: number;
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

  async trigger(mode: 'manual' | 'auto' = 'manual'): Promise<SleepMetrics> {
    const events = await this.deps.storage.queryEdgeEvents({ limit: 50 });
    const consolidation = consolidateEvents(events);
    const dreamReport = runDreamSandbox(this.lastSignalStrength || 0.5);
    this.metrics = this.buildMetrics(consolidation, dreamReport);
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

  private buildMetrics(consolidation: ConsolidationResult, dream: DreamReport): SleepMetrics {
    return {
      lastSleep: Date.now(),
      consolidationEvents: consolidation.consolidationEvents,
      dreamIterations: dream.iterations,
      noiseCleared: consolidation.noiseCleared,
    };
  }
}
