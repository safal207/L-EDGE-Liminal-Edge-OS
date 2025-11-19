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
const circulation = new CirculationEngine({ pump, heartbeat });
let lastHeartbeat: HeartbeatState | undefined;

const homeostasis = new HomeostasisManager({
  getHeartbeatMetrics: () => lastHeartbeat,
  getCirculationMetrics: () => circulation.getLatestSnapshot(),
  getStorageMetrics: () => ({ size: lastHeartbeat?.storageSize ?? 0 }),
  getTransmutationMetrics: () => transmutation.getMetrics(),
  getSleepMetrics: () => sleep.getState(),
  getPerceptionMetrics: () => perception.getSnapshot(),
});

const reflex = new ReflexEngine();

heartbeat.onBeat((beat) => {
  lastHeartbeat = beat;
  homeostasis.tick();
  const homeostasisState = homeostasis.getState();
  const perceptionSnapshot = perception.getSnapshot();

  if (homeostasisState.loadLevel === 'high' || homeostasisState.loadLevel === 'critical') {
    reflex.ingestEvent({
      id: uuidv4(),
      ts: Date.now(),
      source: 'homeostasis',
      kind: homeostasisState.loadLevel === 'critical' ? 'stress.critical' : 'stress.high',
      details: { stressScore: homeostasisState.stressScore },
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
  }

  reflex.evaluate(homeostasisState);
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
});

sleep.start();
circulation.start();
heartbeat.start();
homeostasis.tick();

export { storage, runtime, awareness, resonance, heartbeat, circulation, transmutation, sleep, homeostasis, reflex, perception };
