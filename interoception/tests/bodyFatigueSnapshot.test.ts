import assert from 'assert';
import { computeBodyFatigueSnapshot } from '../bodyFatigueSnapshot';

(function run() {
  const deepSnapshot = computeBodyFatigueSnapshot({
    resources: { energy: 0.2, stability: 0.3 },
    minerals: { trace: 0.25, density: 0.2 },
    emotionalLoad: 0.7,
    entropyLevel: 0.6,
  });
  assert.strictEqual(deepSnapshot.suggestedSleepMode, 'deep', 'low resources push for deep sleep');
  assert.strictEqual(deepSnapshot.recoveryNeed, 'high', 'exhaustion demands high recovery');

  const integrativeSnapshot = computeBodyFatigueSnapshot({
    resources: { energy: 0.55, stability: 0.6 },
    minerals: { trace: 0.45, density: 0.5 },
    emotionalLoad: 0.45,
    entropyLevel: 0.4,
  });
  assert.strictEqual(integrativeSnapshot.suggestedSleepMode, 'integrative', 'mixed state invites integrative sleep');
  assert.ok(integrativeSnapshot.fatigueLevel > 0.4 && integrativeSnapshot.fatigueLevel < 0.7, 'fatigue sits in mid range');

  const lightSnapshot = computeBodyFatigueSnapshot({
    resources: { energy: 0.9, stability: 0.85 },
    minerals: { trace: 0.85, density: 0.9 },
    emotionalLoad: 0.2,
    entropyLevel: 0.2,
  });
  assert.strictEqual(lightSnapshot.suggestedSleepMode, 'light', 'steady resources keep sleep light');
  assert.strictEqual(lightSnapshot.recoveryNeed, 'low', 'low fatigue keeps recovery gentle');

  console.log('body fatigue snapshot tests passed');
})();
