import { EdgeEvent, EdgeEventFilter } from '../core';

export interface LiminalStorage {
  saveEdgeEvent(event: EdgeEvent): Promise<void>;
  queryEdgeEvents(filter: EdgeEventFilter): Promise<EdgeEvent[]>;
}
