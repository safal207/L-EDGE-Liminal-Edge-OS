import assert from 'assert';
import { ReflexEngine } from '../reflexEngine';
import { HomeostasisState } from '../../core/homeostasisManager';

const calmState: HomeostasisState = {
  stressScore: 0.2,
  loadLevel: 'low',
  lastDecisionAt: Date.now(),
  recommendations: {
    increaseTransmutation: false,
    triggerSleep: false,
    throttleEdge: false,
  },
};

const warningState: HomeostasisState = { ...calmState, stressScore: 0.8, loadLevel: 'high' };
const criticalState: HomeostasisState = { ...calmState, stressScore: 0.95, loadLevel: 'critical' };

async function run() {
  const engine = new ReflexEngine({ maxHistory: 3 });

  engine.evaluate(calmState);
  assert.strictEqual(engine.getState().lastActions.length, 0, 'calm system should not create reflexes');

  engine.evaluate(warningState);
  const warningActions = engine.getState().lastActions;
  assert.ok(warningActions.some((action) => action.commands.boostTransmutation), 'warning state should boost transmutation');

  engine.evaluate(criticalState);
  const criticalActions = engine.getState().lastActions;
  const latest = criticalActions[criticalActions.length - 1];
  assert.strictEqual(latest.severity, 'critical');
  assert.strictEqual(latest.commands.throttleEdge, true);
  assert.strictEqual(latest.commands.forceSleep, true);
  assert.strictEqual(latest.commands.boostTransmutation, true);

  engine.ingestEvent({ id: 'evt1', ts: Date.now(), source: 'homeostasis', kind: 'stress.high' });
  engine.ingestEvent({ id: 'evt2', ts: Date.now(), source: 'homeostasis', kind: 'stress.critical' });
  engine.ingestEvent({ id: 'evt3', ts: Date.now(), source: 'runtime', kind: 'errors.burst' });
  engine.ingestEvent({ id: 'evt4', ts: Date.now(), source: 'external', kind: 'latency.spike' });
  assert.strictEqual(engine.getState().lastEvents.length, 3, 'history should retain only the latest max entries for events');

  engine.evaluate(criticalState);
  engine.evaluate(criticalState);
  engine.evaluate(criticalState);
  assert.ok(engine.getState().lastActions.length <= 3, 'actions history should be trimmed to maxHistory');

  console.log('reflex engine tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
