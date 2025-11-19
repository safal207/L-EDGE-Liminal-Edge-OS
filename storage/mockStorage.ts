import { EdgeEvent } from '../core';
import { EdgeEventFilter } from '../core/types';
import { LiminalStorage } from './storage';

class InMemoryLiminalStorage implements LiminalStorage {
  private readonly events: EdgeEvent[] = [];

  async saveEdgeEvent(event: EdgeEvent): Promise<void> {
    this.events.unshift(event);
    console.debug('[storage] edge event stored', event.id);
  }

  async queryEdgeEvents(filter: EdgeEventFilter = {}): Promise<EdgeEvent[]> {
    const { type, nodeId, limit = 20 } = filter;
    return this.events
      .filter((event) => (type ? event.type === type : true))
      .filter((event) => (nodeId ? event.nodeId === nodeId : true))
      .slice(0, limit);
  }
}

export const createInMemoryLiminalStorage = (): LiminalStorage => new InMemoryLiminalStorage();
