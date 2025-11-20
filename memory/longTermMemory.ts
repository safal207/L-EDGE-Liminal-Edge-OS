import { v4 as uuidv4 } from 'uuid';
import { MemoryEvent, MemorySnapshot } from './memoryTypes';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

interface LongTermMemoryOptions {
  limit?: number;
}

export class LongTermMemory {
  private readonly limit: number;
  private snapshots: MemorySnapshot[] = [];

  constructor(options?: LongTermMemoryOptions) {
    this.limit = options?.limit ?? 25;
  }

  addSnapshot(events: MemoryEvent[]): MemorySnapshot | undefined {
    if (events.length === 0) {
      return undefined;
    }
    const eventTypes = events.reduce<Record<string, number>>((acc, evt) => {
      acc[evt.type] = (acc[evt.type] ?? 0) + 1;
      return acc;
    }, {});

    const sourceCounts = events.reduce<Record<string, number>>((acc, evt) => {
      acc[evt.source] = (acc[evt.source] ?? 0) + 1;
      return acc;
    }, {});

    const dominantSources = Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([source]) => source);

    const averageIntensity = events.reduce((sum, evt) => sum + (evt.intensity ?? 0.5), 0) / events.length;
    const stressSignals = (eventTypes['stress.critical'] ?? 0) + (eventTypes['stress.high'] ?? 0);
    const stressScore = clamp((stressSignals / Math.max(events.length, 1)) * 0.6 + averageIntensity * 0.4);

    const snapshot: MemorySnapshot = {
      id: uuidv4(),
      ts: Date.now(),
      summary: `Consolidated ${events.length} events from ${dominantSources.join(', ') || 'mixed sources'}`,
      dominantSources,
      eventTypes,
      volume: events.length,
      lastEventAt: Math.max(...events.map((e) => e.ts)),
      averageIntensity,
      stressScore,
    };

    this.snapshots.unshift(snapshot);
    if (this.snapshots.length > this.limit) {
      this.snapshots.length = this.limit;
    }

    return snapshot;
  }

  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }
}
