import { v4 as uuid } from 'uuid';
import {
  AwarenessSignal,
  AwarenessSignalType,
  EdgeEvent,
  PolicyDecision,
  RoutingPolicy,
} from '../core';
import { POLICY_DECISION_LIMIT } from '../core/constants';

export interface AwarenessGateway {
  updateRoutingPolicy(policy: RoutingPolicy): Promise<void>;
  reportAnomaly(event: EdgeEvent): Promise<void>;
  handleDecision(decision: PolicyDecision): Promise<AwarenessSignal>;
  getDecisionLog(limit?: number): Promise<PolicyDecision[]>;
  getDecisionCount(): number;
}

const SIGNAL_ORDER: AwarenessSignalType[] = ['start-process', 'update-process', 'stop-process'];

export class LoggingAwarenessGateway implements AwarenessGateway {
  private readonly decisions: PolicyDecision[] = [];

  constructor(private readonly limit: number = POLICY_DECISION_LIMIT) {}

  async updateRoutingPolicy(policy: RoutingPolicy): Promise<void> {
    console.info('[awareness] policy update', policy.name, policy.version);
  }

  async reportAnomaly(event: EdgeEvent): Promise<void> {
    console.warn('[awareness] anomaly reported', event.id, event.type);
  }

  async handleDecision(decision: PolicyDecision): Promise<AwarenessSignal> {
    this.decisions.unshift(decision);
    if (this.decisions.length > this.limit) {
      this.decisions.length = this.limit;
    }
    const signalIndex = (this.decisions.length - 1 + SIGNAL_ORDER.length) % SIGNAL_ORDER.length;
    const signalType = SIGNAL_ORDER[signalIndex];
    console.info('[awareness] decision ingested', decision.id, decision.policy, signalType);
    return {
      id: `signal-${uuid()}`,
      decisionId: decision.id,
      type: signalType,
      targetProcessRef: decision.targetNode,
      spec:
        signalType === 'stop-process'
          ? undefined
          : {
              image: `liminal/process/${decision.policy.toLowerCase()}`,
              args: [decision.targetNode],
            },
      issuedAt: new Date().toISOString(),
    };
  }

  async getDecisionLog(limit = 20): Promise<PolicyDecision[]> {
    return this.decisions.slice(0, Math.max(0, Math.min(limit, this.limit)));
  }

  getDecisionCount(): number {
    return this.decisions.length;
  }
}
