import assert from 'assert';
import { planSleep } from '../sleepCycle';
import type { BodyFatigueSnapshot } from '../../interoception/contracts';

(function run() {
  const deepFatigue: BodyFatigueSnapshot = {
    fatigueLevel: 0.85,
    depletionLevel: 0.75,
    recoveryNeed: 'high',
    suggestedSleepMode: 'deep',
  };
  const deepPlan = planSleep(deepFatigue);
  assert.strictEqual(deepPlan.mode, 'deep', 'high fatigue chooses deep sleep');
  assert.ok(deepPlan.durationFactor > 1.3, 'deep sleep extends duration');
  assert.strictEqual(deepPlan.cognitiveOpen, false, 'deep sleep keeps cognition closed');

  const integrativeFatigue: BodyFatigueSnapshot = {
    fatigueLevel: 0.55,
    depletionLevel: 0.45,
    recoveryNeed: 'medium',
    suggestedSleepMode: 'integrative',
  };
  const integrativePlan = planSleep(integrativeFatigue);
  assert.strictEqual(integrativePlan.mode, 'integrative', 'mixed state selects integrative sleep');
  assert.strictEqual(integrativePlan.durationFactor, 1.0, 'integrative plan stays balanced');
  assert.strictEqual(integrativePlan.cognitiveOpen, true, 'integrative plan opens cognition');

  const lightPlan = planSleep({
    fatigueLevel: 0.2,
    depletionLevel: 0.15,
    recoveryNeed: 'low',
    suggestedSleepMode: 'light',
  });
  assert.strictEqual(lightPlan.mode, 'light', 'low fatigue keeps sleep light');
  assert.ok(lightPlan.durationFactor <= 0.8, 'light sleep shortens duration');
  assert.strictEqual(lightPlan.cognitiveOpen, false, 'light sleep keeps replay minimal');

  console.log('sleep plan tests passed');
})();
