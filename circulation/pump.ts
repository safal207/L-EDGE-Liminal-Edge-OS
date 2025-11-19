import { AwarenessGateway } from '../awareness/awarenessGateway';
import { EdgeEvent, PolicyDecision } from '../core';
import { ResonanceEngine } from '../resonance/resonanceEngine';
import { RuntimeAdapter } from '../runtime/runtimeAdapter';
import { LiminalStorage } from '../storage/storage';
import { LoopTelemetry } from './types';

export interface CirculationPumpDeps {
  storage: LiminalStorage;
  resonance: ResonanceEngine;
  awareness: AwarenessGateway;
  runtime: RuntimeAdapter;
}

export class CirculationPump {
  private readonly flowStart = new Map<string, number>();
  private readonly listeners = new Set<(telemetry: LoopTelemetry) => void>();

  constructor(private readonly deps: CirculationPumpDeps) {}

  start(): void {
    this.deps.storage.onEdgeEventSaved((event) => {
      void this.handleEdgeEvent(event).catch((error) => {
        console.error('[circulation] edge event handling failed', error);
      });
    });

    this.deps.resonance.onDecision((decision) => {
      void this.handleDecision(decision).catch((error) => {
        console.error('[circulation] decision handling failed', error);
      });
    });
  }

  onLoopCompleted(listener: (telemetry: LoopTelemetry) => void): void {
    this.listeners.add(listener);
  }

  private async handleEdgeEvent(event: EdgeEvent): Promise<void> {
    const key = this.resolveKey(event);
    this.flowStart.set(key, Date.now());
    await this.deps.resonance.submitEvents([event]);
  }

  private async handleDecision(decision: PolicyDecision): Promise<void> {
    await this.deps.storage.savePolicyDecision(decision);
    const signal = await this.deps.awareness.handleDecision(decision);
    await this.deps.runtime.applyAwarenessSignal(signal);

    const telemetry: LoopTelemetry = {
      decision,
      signal,
      startedAt: this.flowStart.get(this.resolveDecisionKey(decision)),
      completedAt: Date.now(),
    };

    this.listeners.forEach((listener) => listener(telemetry));
    this.flowStart.delete(this.resolveDecisionKey(decision));
  }

  private resolveKey(event: EdgeEvent): string {
    return event.metadata.correlationId ?? event.id;
  }

  private resolveDecisionKey(decision: PolicyDecision): string {
    return decision.metadata.correlationId ?? decision.id;
  }
}
