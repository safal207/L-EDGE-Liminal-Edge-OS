import { EdgeEvent } from '../core';
import { LiminalStorage } from '../storage/storage';
import { EdgeEventSink } from './edgeEventSink';

export class StorageEdgeEventSink implements EdgeEventSink {
  constructor(private readonly storage: LiminalStorage) {}

  async recordEdgeEvent(event: EdgeEvent): Promise<EdgeEvent> {
    const stored = await this.storage.saveEdgeEvent(event);
    console.info('[edge] event recorded', stored.id, stored.type);
    return stored;
  }
}
