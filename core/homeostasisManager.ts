import { EDGE_EVENT_LIMIT } from './constants';
import { CirculationSnapshot, HeartbeatState } from './types';
import { SleepMetrics } from '../sleep/sleepCycle';
import { TransmutationMetrics } from '../transmutation/contracts';
import { PerceptionSnapshot } from '../perception/types';
import { ReplayState } from '../replay/types';

export interface StorageMetrics {
  size: number;
  saturation?: number;
}

export interface HeartbeatMetrics
  extends Pick<HeartbeatState, 'storageSize' | 'resonancePending' | 'runtimeActive' | 'edgeStatus'> {
  timestamp?: string;
}

export interface HomeostasisState {
  stressScore: number;
  loadLevel: 'low' | 'normal' | 'high' | 'critical';
  lastDecisionAt: number;
  recommendations: {
    increaseTransmutation: boolean;
    triggerSleep: boolean;
    throttleEdge: boolean;
  };
}

interface HomeostasisDeps {
  getHeartbeatMetrics: () => HeartbeatMetrics | undefined;
  getCirculationMetrics: () => CirculationSnapshot | undefined;
  getStorageMetrics: () => StorageMetrics;
  getTransmutationMetrics: () => TransmutationMetrics;
  getSleepMetrics: () => SleepMetrics;
  getPerceptionMetrics: () => PerceptionSnapshot;
  getReplayMetrics?: () => ReplayState | undefined;
}

export class HomeostasisManager {
  private state: HomeostasisState = {
    stressScore: 0,
    loadLevel: 'low',
    lastDecisionAt: 0,
    recommendations: {
      increaseTransmutation: false,
      triggerSleep: false,
      throttleEdge: false,
    },
  };

  constructor(private readonly deps: HomeostasisDeps) {}

  getState(): HomeostasisState {
    return this.state;
  }

  tick(): void {
    const heartbeat = this.deps.getHeartbeatMetrics();
    const circulation = this.deps.getCirculationMetrics();
    const storage = this.deps.getStorageMetrics();
    const transmutation = this.deps.getTransmutationMetrics();
    const sleep = this.deps.getSleepMetrics();
    const perception = this.deps.getPerceptionMetrics();
    const replay = this.deps.getReplayMetrics?.();

    const stressScore = this.computeStress({ heartbeat, circulation, storage, transmutation, sleep, perception, replay });
    const loadLevel = this.resolveLoadLevel(stressScore);
    const recommendations = this.resolveRecommendations(stressScore);

    this.state = {
      stressScore,
      loadLevel,
      recommendations,
      lastDecisionAt: Date.now(),
    };
  }

  private computeStress(params: {
    heartbeat?: HeartbeatMetrics;
    circulation?: CirculationSnapshot;
    storage: StorageMetrics;
    transmutation: TransmutationMetrics;
    sleep: SleepMetrics;
    perception: PerceptionSnapshot;
    replay?: ReplayState;
  }): number {
    const storagePressure = clamp(params.storage.size / EDGE_EVENT_LIMIT);
    const resonanceLoad = clamp((params.heartbeat?.resonancePending ?? 0) / 20);
    const runtimeLoad = clamp((params.heartbeat?.runtimeActive ?? 0) / 20);
    const circulationPressure = clamp((params.circulation?.pressure ?? 0) / 100);
    const entropyLoad = clamp(
      params.transmutation.discardedEntropy /
        (params.transmutation.purifiedEvents + params.transmutation.discardedEntropy + 1)
    );
    const sleepDebt = this.computeSleepDebt(params.sleep.lastSleep);
    const perceptionNoise = clamp(params.perception.noiseLevel);
    const perceptionAnomalies = clamp(params.perception.anomalies / 10);

    const replayRelief = params.replay ? clamp(params.replay.reliefScore * 0.2 + params.replay.avgIntegrationScore * 0.1) : 0;

    const stressScore =
      storagePressure * 0.2 +
      resonanceLoad * 0.15 +
      runtimeLoad * 0.1 +
      circulationPressure * 0.1 +
      entropyLoad * 0.1 +
      sleepDebt * 0.1 +
      perceptionNoise * 0.15 +
      perceptionAnomalies * 0.1 -
      replayRelief;

    return clamp(stressScore);
  }

  private computeSleepDebt(lastSleep: number): number {
    if (!lastSleep) {
      return 1;
    }
    const minutesWithoutSleep = (Date.now() - lastSleep) / 60000;
    return clamp(minutesWithoutSleep / 30);
  }

  private resolveLoadLevel(score: number): HomeostasisState['loadLevel'] {
    if (score >= 0.9) return 'critical';
    if (score >= 0.7) return 'high';
    if (score >= 0.3) return 'normal';
    return 'low';
  }

  private resolveRecommendations(score: number): HomeostasisState['recommendations'] {
    if (score < 0.3) {
      return { increaseTransmutation: false, triggerSleep: false, throttleEdge: false };
    }

    return {
      increaseTransmutation: score > 0.7,
      triggerSleep: score > 0.7,
      throttleEdge: score > 0.9,
    };
  }
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
