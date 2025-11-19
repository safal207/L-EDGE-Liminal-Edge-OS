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
const circulation = new CirculationEngine({ pump, heartbeat });
let lastHeartbeat: HeartbeatState | undefined;

const homeostasis = new HomeostasisManager({
  getHeartbeatMetrics: () => lastHeartbeat,
  getCirculationMetrics: () => circulation.getLatestSnapshot(),
  getStorageMetrics: () => ({ size: lastHeartbeat?.storageSize ?? 0 }),
  getTransmutationMetrics: () => transmutation.getMetrics(),
  getSleepMetrics: () => sleep.getState(),
});

heartbeat.onBeat((beat) => {
  lastHeartbeat = beat;
  homeostasis.tick();
});

sleep.start();
circulation.start();
heartbeat.start();
homeostasis.tick();

export { storage, runtime, awareness, resonance, heartbeat, circulation, transmutation, sleep, homeostasis };
