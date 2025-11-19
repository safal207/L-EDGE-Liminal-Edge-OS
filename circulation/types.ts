import { AwarenessSignal, CirculationSnapshot, EdgeEvent, PolicyDecision } from '../core';

export interface LoopTelemetry {
  event?: EdgeEvent;
  decision: PolicyDecision;
  signal: AwarenessSignal;
  startedAt?: number;
  completedAt: number;
}

export interface CirculationState {
  latest?: CirculationSnapshot;
  history: CirculationSnapshot[];
}
