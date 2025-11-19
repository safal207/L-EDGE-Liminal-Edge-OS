import { EdgeEvent, RoutingPolicy } from '../core';

export interface AwarenessGateway {
  updateRoutingPolicy(policy: RoutingPolicy): Promise<void>;
  reportAnomaly(event: EdgeEvent): Promise<void>;
}

export class LoggingAwarenessGateway implements AwarenessGateway {
  async updateRoutingPolicy(policy: RoutingPolicy): Promise<void> {
    console.info('[awareness] policy update', policy.name, policy.version);
  }

  async reportAnomaly(event: EdgeEvent): Promise<void> {
    console.warn('[awareness] anomaly reported', event.id, event.type);
  }
}
