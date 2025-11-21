import { v4 as uuidv4 } from 'uuid';
import { MemoryEvent } from './memoryTypes';

interface ShortTermMemoryOptions {
  limit?: number;
  decayMs?: number;
}

export class ShortTermMemory {
  private readonly limit: number;
  private readonly decayMs: number;
  private events: MemoryEvent[] = [];

  constructor(options?: ShortTermMemoryOptions) {
    this.limit = options?.limit ?? 50;
    this.decayMs = options?.decayMs ?? 5 * 60 * 1000;
  }

  add(event: Omit<MemoryEvent, 'id'> & { id?: string }): void {
    this.events.push({ ...event, id: event.id ?? uuidv4() });
    this.applyDecay();
    this.enforceLimit();
  }

  getEvents(): MemoryEvent[] {
    this.applyDecay();
    return [...this.events];
  }

  decay(): void {
    this.applyDecay();
  }

  drainForConsolidation(batchSize?: number): MemoryEvent[] {
    this.applyDecay();
    if (this.events.length === 0) {
      return [];
    }
    const size = batchSize && batchSize > 0 ? Math.min(batchSize, this.events.length) : Math.ceil(this.limit / 2);
    const drained = this.events.slice(Math.max(0, this.events.length - size));
    this.events = this.events.slice(0, this.events.length - drained.length);
    return drained;
  }

  getLimit(): number {
    return this.limit;
  }

  private applyDecay(now = Date.now()): void {
    this.events = this.events.filter((evt) => evt.ts >= now - this.decayMs);
  }

  private enforceLimit(): void {
    if (this.events.length <= this.limit) return;
    this.events = this.events.slice(this.events.length - this.limit);
  }
}
