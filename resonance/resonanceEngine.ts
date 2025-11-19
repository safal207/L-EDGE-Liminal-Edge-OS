import { EdgeEvent, PolicyDecision } from '../core';

const isPromise = (value: unknown): value is Promise<unknown> =>
  typeof value === 'object' && value !== null && typeof (value as { then?: unknown }).then === 'function';

export interface ResonanceEngine {
  submitEvents(events: EdgeEvent[]): Promise<void>;
  onDecision(handler: (decision: PolicyDecision) => void | Promise<void>): void;
  getPendingCount(): number;
  getDecisionCount(): number;
}

export class MockResonanceEngine implements ResonanceEngine {
  private decisionHandler?: (decision: PolicyDecision) => void;
  private readonly pendingEvents: EdgeEvent[] = [];
  private decisionsGenerated = 0;
  private readonly timer: NodeJS.Timeout;

  constructor(private readonly intervalMs: number = 1500) {
    this.timer = setInterval(() => {
      void this.processPending();
    }, this.intervalMs);
  }

  async submitEvents(events: EdgeEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }
    this.pendingEvents.push(...events);
    console.info('[resonance] queued events', this.pendingEvents.length);
  }

  onDecision(handler: (decision: PolicyDecision) => void | Promise<void>): void {
    this.decisionHandler = handler;
  }

  getPendingCount(): number {
    return this.pendingEvents.length;
  }

  getDecisionCount(): number {
    return this.decisionsGenerated;
  }

  private async processPending(): Promise<void> {
    if (!this.decisionHandler || this.pendingEvents.length === 0) {
      return;
    }
    const batch = this.pendingEvents.splice(0, this.pendingEvents.length);
    batch.forEach((event, index) => {
      const decision: PolicyDecision = {
        id: `decision-${Date.now()}-${index}`,
        targetNode: event.nodeId,
        policy: index % 2 === 0 ? 'ALLOW' : 'DELAY',
        issuedAt: new Date().toISOString(),
        metadata: event.metadata,
      };
      this.decisionsGenerated += 1;
      const maybePromise = this.decisionHandler?.(decision);
      if (isPromise(maybePromise)) {
        maybePromise.catch((error: unknown) => {
          console.error('[resonance] decision handler failed', error);
        });
      }
    });
  }
}
