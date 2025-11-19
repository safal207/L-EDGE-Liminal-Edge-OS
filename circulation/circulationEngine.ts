import { CIRCULATION_HISTORY_LIMIT, EDGE_EVENT_LIMIT } from '../core/constants';
import { HeartbeatService, toHeartbeatCirculation } from '../core/heartbeat';
import { CirculationSnapshot, HeartbeatState, PulsationPhase } from '../core/types';
import { CirculationPump } from './pump';
import { LoopTelemetry } from './types';

interface CirculationEngineDeps {
  pump: CirculationPump;
  heartbeat: HeartbeatService;
  historyLimit?: number;
}

export class CirculationEngine {
  private readonly snapshots: CirculationSnapshot[] = [];
  private loopsCompleted = 0;
  private readonly direction = 'Edge→Storage→Resonance→Awareness→Runtime→Heartbeat→Edge';
  private readonly historyLimit: number;

  constructor(private readonly deps: CirculationEngineDeps) {
    this.historyLimit = deps.historyLimit ?? CIRCULATION_HISTORY_LIMIT;
  }

  start(): void {
    this.deps.pump.onLoopCompleted((telemetry) => {
      void this.handleLoop(telemetry);
    });
    this.deps.pump.start();
  }

  getLatestSnapshot(): CirculationSnapshot | undefined {
    return this.snapshots[0];
  }

  listSnapshots(limit = 20): CirculationSnapshot[] {
    return this.snapshots.slice(0, Math.max(0, Math.min(limit, this.historyLimit)));
  }

  getDirection(): string {
    return this.direction;
  }

  private async handleLoop(telemetry: LoopTelemetry): Promise<void> {
    await this.deps.heartbeat.capture((state) => {
      const snapshot = this.buildSnapshot(state, telemetry);
      this.registerSnapshot(snapshot);
      return {
        ...state,
        circulation: toHeartbeatCirculation(snapshot),
      };
    });
  }

  private buildSnapshot(state: HeartbeatState, telemetry: LoopTelemetry): CirculationSnapshot {
    const flowSpeedMs = this.computeFlowSpeed(telemetry);
    const pulsation = this.computePulsation(state.resonancePending, state.runtimeActive);
    const resonanceTemperature = this.computeResonanceTemperature(state.resonancePending);
    const pressure = this.computePressure(state.runtimeActive, state.resonancePending);
    const saturation = Math.min(1, state.storageSize / EDGE_EVENT_LIMIT);
    const degradationRate = flowSpeedMs === 0 ? 0 : Math.min(1, flowSpeedMs / 5000);
    this.loopsCompleted += 1;
    return {
      timestamp: new Date().toISOString(),
      loopsCompleted: this.loopsCompleted,
      flowSpeedMs,
      pulsation,
      resonanceTemperature,
      pressure,
      saturation,
      degradationRate,
      direction: this.direction,
      lastDecisionId: telemetry.decision.id,
    };
  }

  private registerSnapshot(snapshot: CirculationSnapshot): void {
    this.snapshots.unshift(snapshot);
    if (this.snapshots.length > this.historyLimit) {
      this.snapshots.length = this.historyLimit;
    }
  }

  private computeFlowSpeed(telemetry: LoopTelemetry): number {
    if (!telemetry.startedAt) {
      return 0;
    }
    return Math.max(0, telemetry.completedAt - telemetry.startedAt);
  }

  private computePulsation(resonancePending: number, runtimeActive: number): PulsationPhase {
    const phaseSeed = resonancePending + runtimeActive;
    return phaseSeed % 2 === 0 ? 'compression' : 'expansion';
  }

  private computeResonanceTemperature(pending: number): number {
    const normalized = Math.min(1, pending / 20);
    return Math.round(normalized * 100);
  }

  private computePressure(runtimeActive: number, resonancePending: number): number {
    return runtimeActive * 2 + resonancePending;
  }
}
