import { EdgeEvent, PolicyDecision } from '../core';

export interface ResonanceEngine {
  submitEvents(events: EdgeEvent[]): Promise<void>;
  onDecision(handler: (decision: PolicyDecision) => void): void;
}

export class MockResonanceEngine implements ResonanceEngine {
  private decisionHandler?: (decision: PolicyDecision) => void;

  async submitEvents(events: EdgeEvent[]): Promise<void> {
    console.info('[resonance] received events', events.length);
    if (this.decisionHandler) {
      const decision: PolicyDecision = {
        id: `decision-${Date.now()}`,
        targetNode: events[0]?.nodeId ?? 'unknown',
        policy: 'ALLOW',
        issuedAt: new Date().toISOString(),
        metadata: {
          correlationId: `corr-${Date.now()}`,
          traceId: `trace-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      };
      this.decisionHandler(decision);
    }
  }

  onDecision(handler: (decision: PolicyDecision) => void): void {
    this.decisionHandler = handler;
  }
}
