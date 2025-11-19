import { v4 as uuidv4 } from 'uuid';
import { LongTermMemory } from './longTermMemory';
import { ShortTermMemory } from './shortTermMemory';
import { MemoryEvent, MemoryState, RecallCriteria, RecallResult } from './memoryTypes';

interface MemoryEngineOptions {
  shortTermLimit?: number;
  shortTermDecayMs?: number;
  longTermLimit?: number;
}

export class MemoryEngine {
  private readonly shortTerm: ShortTermMemory;
  private readonly longTerm: LongTermMemory;
  private lastConsolidatedAt = 0;

  constructor(options?: MemoryEngineOptions) {
    this.shortTerm = new ShortTermMemory({ limit: options?.shortTermLimit, decayMs: options?.shortTermDecayMs });
    this.longTerm = new LongTermMemory({ limit: options?.longTermLimit });
  }

  remember(event: Omit<MemoryEvent, 'id'> & { id?: string }): MemoryEvent {
    const normalized: MemoryEvent = {
      ...event,
      id: event.id ?? uuidv4(),
      ts: event.ts ?? Date.now(),
      intensity: clamp(event.intensity ?? 0.5),
    };
    this.shortTerm.add(normalized);
    return normalized;
  }

  recall(criteria: RecallCriteria): RecallResult {
    const events = this.shortTerm.getEvents().filter((evt) => this.matches(evt, criteria));
    const snapshots = this.longTerm.getSnapshots().filter((snap) => this.snapshotMatches(snap.summary, criteria));
    return { events, snapshots };
  }

  consolidate(batchSize?: number): void {
    const drained = this.shortTerm.drainForConsolidation(batchSize);
    if (drained.length === 0) {
      return;
    }
    this.longTerm.addSnapshot(drained);
    this.lastConsolidatedAt = Date.now();
  }

  decay(): void {
    this.shortTerm.decay();
  }

  getState(): MemoryState {
    const shortTerm = this.shortTerm.getEvents();
    const longTerm = this.longTerm.getSnapshots();
    const saturationRatio = shortTerm.length / this.shortTerm.getLimit();
    const status: MemoryState['status'] =
      saturationRatio >= 1
        ? 'saturated'
        : this.lastConsolidatedAt > 0 && Date.now() - this.lastConsolidatedAt < 10_000
        ? 'consolidating'
        : shortTerm.length > 0
        ? 'learning'
        : 'idle';

    return {
      shortTerm,
      longTerm,
      lastConsolidatedAt: this.lastConsolidatedAt,
      shortTermLimit: this.shortTerm.getLimit(),
      status,
    };
  }

  private matches(evt: MemoryEvent, criteria: RecallCriteria): boolean {
    if (criteria.source && evt.source !== criteria.source) {
      return false;
    }
    if (criteria.type && evt.type !== criteria.type) {
      return false;
    }
    if (criteria.since && evt.ts < criteria.since) {
      return false;
    }
    if (criteria.text) {
      const text = criteria.text.toLowerCase();
      return (
        evt.type.toLowerCase().includes(text) ||
        evt.source.toLowerCase().includes(text) ||
        JSON.stringify(evt.payload ?? {}).toLowerCase().includes(text)
      );
    }
    return true;
  }

  private snapshotMatches(summary: string, criteria: RecallCriteria): boolean {
    if (!criteria.text) return true;
    return summary.toLowerCase().includes(criteria.text.toLowerCase());
  }
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
