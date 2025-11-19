import { EdgeEvent } from '../core';

export interface EdgeEventSink {
  recordEdgeEvent(event: EdgeEvent): Promise<void>;
}
