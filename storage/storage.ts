import { EdgeEvent, EdgeEventFilter, HeartbeatState, PolicyDecision } from '../core';

export type EdgeEventListener = (event: EdgeEvent) => void;

export interface LiminalStorage {
  saveEdgeEvent(event: EdgeEvent): Promise<EdgeEvent>;
  queryEdgeEvents(filter?: EdgeEventFilter): Promise<EdgeEvent[]>;
  countEdgeEvents(): Promise<number>;
  onEdgeEventSaved(listener: EdgeEventListener): void;

  savePolicyDecision(decision: PolicyDecision): Promise<void>;
  listPolicyDecisions(limit?: number): Promise<PolicyDecision[]>;
  countPolicyDecisions(): Promise<number>;

  saveHeartbeat(state: HeartbeatState): Promise<void>;
  listHeartbeats(limit?: number): Promise<HeartbeatState[]>;
}
