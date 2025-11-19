import assert from 'assert';
import { HomeostasisManager, HomeostasisState } from '../../core/homeostasisManager';
import { CirculationSnapshot } from '../../core/types';

const now = Date.now();

const baseCirculation: CirculationSnapshot = {
  timestamp: new Date(now).toISOString(),
  loopsCompleted: 5,
  flowSpeedMs: 1200,
  pulsation: 'compression',
  resonanceTemperature: 40,
  pressure: 20,
  saturation: 0.4,
  degradationRate: 0.1,
  direction: 'Edge→Storage→Resonance→Awareness→Runtime→Heartbeat→Circulation→Transmutation→Sleep→Edge',
};

const makeManager = (overrides: Partial<ReturnType<typeof defaultDeps>>) => {
  const deps = { ...defaultDeps(), ...overrides };
  return new HomeostasisManager(deps);
};

const defaultDeps = () => ({
  getHeartbeatMetrics: () => ({
    edgeStatus: 'ok',
    storageSize: 50,
    resonancePending: 2,
    runtimeActive: 2,
  }),
  getCirculationMetrics: () => baseCirculation,
  getStorageMetrics: () => ({ size: 50 }),
  getTransmutationMetrics: () => ({
    lastMutation: now,
    purifiedEvents: 10,
    discardedEntropy: 1,
    signalStrength: 0.5,
  }),
  getSleepMetrics: () => ({
    lastSleep: now,
    consolidationEvents: 2,
    dreamIterations: 2,
    noiseCleared: 1,
  }),
});

const assertLevel = (state: HomeostasisState, expected: HomeostasisState['loadLevel']) => {
  assert.strictEqual(state.loadLevel, expected, `expected load level ${expected}, got ${state.loadLevel}`);
};

async function run() {
  const manager = makeManager({});
  manager.tick();
  const calm = manager.getState();
  assert.ok(calm.stressScore < 0.3, 'base load should be calm');
  assertLevel(calm, 'low');
  assert.deepStrictEqual(calm.recommendations, {
    increaseTransmutation: false,
    triggerSleep: false,
    throttleEdge: false,
  });

  const heavy = makeManager({
    getHeartbeatMetrics: () => ({
      edgeStatus: 'hot',
      storageSize: 260,
      resonancePending: 15,
      runtimeActive: 10,
    }),
    getCirculationMetrics: () => ({ ...baseCirculation, pressure: 90, resonanceTemperature: 90 }),
    getStorageMetrics: () => ({ size: 260 }),
    getTransmutationMetrics: () => ({
      lastMutation: now,
      purifiedEvents: 5,
      discardedEntropy: 35,
      signalStrength: 0.8,
    }),
    getSleepMetrics: () => ({
      lastSleep: now - 20 * 60 * 1000,
      consolidationEvents: 3,
      dreamIterations: 4,
      noiseCleared: 2,
    }),
  });
  heavy.tick();
  const stressed = heavy.getState();
  assert.ok(stressed.stressScore > 0.7, 'high load should push stress over 0.7');
  assertLevel(stressed, 'high');
  assert.strictEqual(stressed.recommendations.increaseTransmutation, true);
  assert.strictEqual(stressed.recommendations.triggerSleep, true);
  assert.strictEqual(stressed.recommendations.throttleEdge, false, 'not yet critical');

  const critical = makeManager({
    getHeartbeatMetrics: () => ({
      edgeStatus: 'overload',
      storageSize: 300,
      resonancePending: 30,
      runtimeActive: 25,
    }),
    getCirculationMetrics: () => ({ ...baseCirculation, pressure: 150, resonanceTemperature: 100 }),
    getStorageMetrics: () => ({ size: 300 }),
    getTransmutationMetrics: () => ({
      lastMutation: now,
      purifiedEvents: 2,
      discardedEntropy: 60,
      signalStrength: 0.9,
    }),
    getSleepMetrics: () => ({
      lastSleep: now - 120 * 60 * 1000,
      consolidationEvents: 4,
      dreamIterations: 5,
      noiseCleared: 3,
    }),
  });
  critical.tick();
  const criticalState = critical.getState();
  assert.ok(criticalState.stressScore > 0.9, 'critical load should be above 0.9');
  assertLevel(criticalState, 'critical');
  assert.strictEqual(criticalState.recommendations.throttleEdge, true);

  console.log('homeostasis manager tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
