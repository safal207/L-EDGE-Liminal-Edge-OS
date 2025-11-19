import {
  EDGE_EVENT_LIMIT,
  HEARTBEAT_LIMIT,
  POLICY_DECISION_LIMIT,
} from '../core/constants';
import {
  EdgeEvent,
  EdgeEventFilter,
  HeartbeatState,
  PolicyDecision,
} from '../core/types';
import { EdgeEventListener, LiminalStorage } from './storage';

const clampLimit = (limit: number, max: number): number => Math.max(0, Math.min(limit, max));

class InMemoryLiminalStorage implements LiminalStorage {
  private readonly events: EdgeEvent[] = [];
  private readonly decisions: PolicyDecision[] = [];
  private readonly heartbeats: HeartbeatState[] = [];
  private readonly listeners = new Set<EdgeEventListener>();
  private eventSequence = 0;

  async saveEdgeEvent(event: EdgeEvent): Promise<EdgeEvent> {
    const sequence = ++this.eventSequence;
    const stored: EdgeEvent = {
      ...event,
      id: event.id || `edge-${sequence}`,
      sequence,
      metadata: {
        ...event.metadata,
        createdAt: event.metadata.createdAt || new Date().toISOString(),
      },
    };

    this.events.unshift(stored);
    if (this.events.length > EDGE_EVENT_LIMIT) {
      this.events.length = EDGE_EVENT_LIMIT;
    }
    console.debug('[storage] edge event stored', stored.id);
    this.listeners.forEach((listener) => listener(stored));
    return stored;
  }

  async queryEdgeEvents(filter: EdgeEventFilter = {}): Promise<EdgeEvent[]> {
    const { type, nodeId, fromTimestamp, toTimestamp, correlationId, limit = 20 } = filter;
    return this.events
      .filter((event) => (type ? event.type === type : true))
      .filter((event) => (nodeId ? event.nodeId === nodeId : true))
      .filter((event) =>
        fromTimestamp ? new Date(event.metadata.createdAt).getTime() >= new Date(fromTimestamp).getTime() : true,
      )
      .filter((event) =>
        toTimestamp ? new Date(event.metadata.createdAt).getTime() <= new Date(toTimestamp).getTime() : true,
      )
      .filter((event) => (correlationId ? event.metadata.correlationId === correlationId : true))
      .slice(0, clampLimit(limit, EDGE_EVENT_LIMIT));
  }

  async countEdgeEvents(): Promise<number> {
    return this.events.length;
  }

  onEdgeEventSaved(listener: EdgeEventListener): void {
    this.listeners.add(listener);
  }

  async savePolicyDecision(decision: PolicyDecision): Promise<void> {
    this.decisions.unshift(decision);
    if (this.decisions.length > POLICY_DECISION_LIMIT) {
      this.decisions.length = POLICY_DECISION_LIMIT;
    }
  }

  async listPolicyDecisions(limit = 20): Promise<PolicyDecision[]> {
    return this.decisions.slice(0, clampLimit(limit, POLICY_DECISION_LIMIT));
  }

  async countPolicyDecisions(): Promise<number> {
    return this.decisions.length;
  }

  async saveHeartbeat(state: HeartbeatState): Promise<void> {
    this.heartbeats.unshift(state);
    if (this.heartbeats.length > HEARTBEAT_LIMIT) {
      this.heartbeats.length = HEARTBEAT_LIMIT;
    }
  }

  async listHeartbeats(limit = 20): Promise<HeartbeatState[]> {
    return this.heartbeats.slice(0, clampLimit(limit, HEARTBEAT_LIMIT));
  }
}

export const createInMemoryLiminalStorage = (): LiminalStorage => new InMemoryLiminalStorage();
