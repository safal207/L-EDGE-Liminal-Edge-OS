import { AwarenessGateway } from '../awareness/awarenessGateway';
import { ResonanceEngine } from '../resonance/resonanceEngine';
import { RuntimeAdapter } from '../runtime/runtimeAdapter';
import { LiminalStorage } from '../storage/storage';
import { HEARTBEAT_INTERVAL_MS } from './constants';
import { HeartbeatState } from './types';

interface HeartbeatDeps {
  storage: LiminalStorage;
  resonance: ResonanceEngine;
  awareness: AwarenessGateway;
  runtime: RuntimeAdapter;
  edgeStatusProvider?: () => string;
  intervalMs?: number;
}

export class HeartbeatService {
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(private readonly deps: HeartbeatDeps) {}

  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    const interval = this.deps.intervalMs ?? HEARTBEAT_INTERVAL_MS;
    this.timer = setInterval(() => {
      void this.capture();
    }, interval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.running = false;
  }

  async capture(): Promise<HeartbeatState> {
    const { storage, resonance, awareness, runtime, edgeStatusProvider } = this.deps;
    const runtimeState = await runtime.getSystemState();
    const heartbeat: HeartbeatState = {
      timestamp: new Date().toISOString(),
      edgeStatus: edgeStatusProvider ? edgeStatusProvider() : 'unknown',
      storageSize: await storage.countEdgeEvents(),
      resonancePending: resonance.getPendingCount(),
      decisionsGenerated: resonance.getDecisionCount(),
      awarenessDecisions: awareness.getDecisionCount(),
      runtimeActive: runtimeState.running,
    };

    await storage.saveHeartbeat(heartbeat);
    return heartbeat;
  }

  async getRecent(limit = 20): Promise<HeartbeatState[]> {
    return this.deps.storage.listHeartbeats(limit);
  }
}
