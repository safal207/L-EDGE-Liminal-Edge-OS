import { LoggingAwarenessGateway } from '../awareness/awarenessGateway';
import { HeartbeatService } from './heartbeat';
import { createInMemoryLiminalStorage } from '../storage/mockStorage';
import { InMemoryRuntimeAdapter } from '../runtime/runtimeAdapter';
import { MockResonanceEngine } from '../resonance/resonanceEngine';

const storage = createInMemoryLiminalStorage();
const runtime = new InMemoryRuntimeAdapter();
const awareness = new LoggingAwarenessGateway();
const resonance = new MockResonanceEngine();

storage.onEdgeEventSaved((event) => {
  resonance.submitEvents([event]).catch((error) => {
    console.error('[system] failed to push event to resonance', error);
  });
});

resonance.onDecision((decision) => {
  storage
    .savePolicyDecision(decision)
    .then(() => awareness.handleDecision(decision))
    .then((signal) => runtime.applyAwarenessSignal(signal))
    .catch((error) => {
      console.error('[system] decision propagation failed', error);
    });
});

const heartbeat = new HeartbeatService({
  storage,
  resonance,
  awareness,
  runtime,
  edgeStatusProvider: () => 'ok',
});

heartbeat.start();

export { storage, runtime, awareness, resonance, heartbeat };
