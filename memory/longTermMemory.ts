import { v4 as uuidv4 } from 'uuid';
import { MemoryEvent, MemorySnapshot } from './memoryTypes';

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

    const snapshot: MemorySnapshot = {
      id: uuidv4(),
      ts: Date.now(),
      summary: `Consolidated ${events.length} events from ${dominantSources.join(', ') || 'mixed sources'}`,
      dominantSources,
      eventTypes,
      volume: events.length,
      lastEventAt: Math.max(...events.map((e) => e.ts)),
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
