import { LoggingAwarenessGateway } from '../awareness/awarenessGateway';
import { HeartbeatService } from './heartbeat';
import { createInMemoryLiminalStorage } from '../storage/mockStorage';
import { InMemoryRuntimeAdapter } from '../runtime/runtimeAdapter';
import { MockResonanceEngine } from '../resonance/resonanceEngine';
import { CirculationPump } from '../circulation/pump';
import { CirculationEngine } from '../circulation/circulationEngine';
import { TransmutationEngine } from '../transmutation/transmutationEngine';
import { SleepCycle } from '../sleep/sleepCycle';
import { HomeostasisManager } from './homeostasisManager';
import { HeartbeatState } from './types';
import { ReflexEngine } from '../reflex/reflexEngine';
import { PerceptionEngine } from '../perception/perceptionEngine';
import { MemoryEngine } from '../memory/memoryEngine';
import { DreamReplayEngine } from '../replay/dreamReplayEngine';
import { v4 as uuidv4 } from 'uuid';

const storage = createInMemoryLiminalStorage();
const runtime = new InMemoryRuntimeAdapter();
const awareness = new LoggingAwarenessGateway();
const resonance = new MockResonanceEngine();

const heartbeat = new HeartbeatService({
  storage,
  resonance,
  awareness,
  runtime,
  edgeStatusProvider: () => 'ok',
});

const pump = new CirculationPump({ storage, resonance, awareness, runtime });
const transmutation = new TransmutationEngine({ storage, pump });
const sleep = new SleepCycle({ storage, transmutation });
const perception = new PerceptionEngine();
const memory = new MemoryEngine();
const replay = new DreamReplayEngine({ memory, transmutation, config: { maxEpisodes: 5, minStressThreshold: 0.15 } });
const circulation = new CirculationEngine({ pump, heartbeat });
let lastHeartbeat: HeartbeatState | undefined;

const homeostasis = new HomeostasisManager({
  getHeartbeatMetrics: () => lastHeartbeat,
  getCirculationMetrics: () => circulation.getLatestSnapshot(),
  getStorageMetrics: () => ({ size: lastHeartbeat?.storageSize ?? 0 }),
  getTransmutationMetrics: () => transmutation.getMetrics(),
  getSleepMetrics: () => sleep.getState(),
  getPerceptionMetrics: () => perception.getSnapshot(),
  getReplayMetrics: () => replay.getState(),
});

const reflex = new ReflexEngine();

heartbeat.onBeat((beat) => {
  lastHeartbeat = beat;
  homeostasis.tick();
  const homeostasisState = homeostasis.getState();
  const perceptionSnapshot = perception.getSnapshot();
  const circulationSnapshot = circulation.getLatestSnapshot();
  const replayState = replay.getState();

  if (circulationSnapshot) {
    memory.remember({
      source: 'circulation',
      type: 'circulation.loop',
      ts: Date.now(),
      intensity: Math.min(1, circulationSnapshot.pressure / 150),
      payload: circulationSnapshot,
    });
  }

  if (homeostasisState.loadLevel === 'high' || homeostasisState.loadLevel === 'critical') {
    reflex.ingestEvent({
      id: uuidv4(),
      ts: Date.now(),
      source: 'homeostasis',
      kind: homeostasisState.loadLevel === 'critical' ? 'stress.critical' : 'stress.high',
      details: { stressScore: homeostasisState.stressScore },
    });

    memory.remember({
      source: 'homeostasis',
      type: homeostasisState.loadLevel === 'critical' ? 'stress.critical' : 'stress.high',
      ts: Date.now(),
      intensity: homeostasisState.stressScore,
      payload: homeostasisState,
    });
  }

  if (perceptionSnapshot.status === 'degraded' || perceptionSnapshot.status === 'critical') {
    reflex.ingestEvent({
      id: uuidv4(),
      ts: Date.now(),
      source: 'homeostasis',
      kind: perceptionSnapshot.status === 'critical' ? 'perception.critical' : 'perception.degraded',
      details: perceptionSnapshot,
    });

    memory.remember({
      source: 'perception',
      type: perceptionSnapshot.status === 'critical' ? 'perception.critical' : 'perception.degraded',
      ts: Date.now(),
      intensity: perceptionSnapshot.noiseLevel,
      payload: perceptionSnapshot,
    });
  }

  const actionsBefore = reflex.getState().lastActions.length;
  reflex.evaluate(homeostasisState);
  const actionsAfter = reflex.getState().lastActions.length;

  if (actionsAfter > actionsBefore) {
    const action = reflex.getState().lastActions.at(-1);
    if (action) {
      memory.remember({
        source: 'reflex',
        type: `reflex.${action.severity}`,
        ts: action.ts,
        intensity: action.severity === 'critical' ? 1 : 0.75,
        payload: action,
      });
    }
  }

  if (replayState.lastResults.length) {
    const lastResult = replayState.lastResults.at(-1);
    if (lastResult) {
      reflex.ingestEvent({
        id: uuidv4(),
        ts: Date.now(),
        source: 'replay',
        kind: lastResult.integrationScore >= 0.7 ? 'replay.success' : 'replay.minor',
        details: lastResult,
      });
    }
  }

  memory.decay();
});

heartbeat.onBeat((beat) => {
  perception.ingestSignal({
    source: 'heartbeat',
    ts: Date.now(),
    type: beat.edgeStatus === 'ok' ? 'telemetry' : 'alert',
    intensity: Math.min(1, (beat.resonancePending + beat.runtimeActive) / 50),
    payload: {
      resonancePending: beat.resonancePending,
      runtimeActive: beat.runtimeActive,
      edgeStatus: beat.edgeStatus,
    },
  });

  memory.remember({
    source: 'heartbeat',
    type: 'heartbeat.snapshot',
    ts: Date.now(),
    intensity: Math.min(1, beat.runtimeActive / 20),
    payload: beat,
  });
});

sleep.on('cycle', (metrics) => {
  memory.remember({
    source: 'sleep',
    type: 'sleep.cycle',
    ts: metrics.lastSleep,
    intensity: Math.min(1, metrics.noiseCleared / 10),
    payload: metrics,
  });
  memory.consolidate();
  replay.runReplayCycle('sleep');
});

sleep.start();
circulation.start();
heartbeat.start();
homeostasis.tick();

export {
  storage,
  runtime,
  awareness,
  resonance,
  heartbeat,
  circulation,
  transmutation,
  sleep,
  homeostasis,
  reflex,
  perception,
  memory,
  replay,
};
