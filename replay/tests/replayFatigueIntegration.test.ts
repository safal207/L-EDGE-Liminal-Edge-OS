import assert from 'assert';
import { scheduleReplay } from '../replayScheduler';
import type { SleepPlan } from '../../sleep/sleepCycle';

(function run() {
  const memories = [
    { id: 'm1', intensity: 0.9, novelty: 0.2 },
    { id: 'm2', intensity: 0.6, novelty: 0.7 },
    { id: 'm3', intensity: 0.4, novelty: 0.9 },
  ];

  const deepPlan: SleepPlan = { mode: 'deep', durationFactor: 1.5, cognitiveOpen: false };
  const deepSchedule = scheduleReplay(deepPlan, { memories });
  assert.strictEqual(deepSchedule.plan, 'restoration', 'deep sleep focuses on restoration');
  assert.ok(deepSchedule.selectedMemories.every((id) => id !== 'm1'), 'intense memories avoided during deep sleep');
  assert.strictEqual(deepSchedule.openness, false, 'deep sleep keeps replay closed');

  const integrativePlan: SleepPlan = { mode: 'integrative', durationFactor: 1.0, cognitiveOpen: true };
  const integrativeSchedule = scheduleReplay(integrativePlan, { memories });
  assert.strictEqual(integrativeSchedule.plan, 'integration', 'integrative sleep invites integration');
  assert.ok(integrativeSchedule.selectedMemories.includes('m3'), 'pattern exploration prefers novel memories');
  assert.strictEqual(integrativeSchedule.openness, true, 'integrative mode stays open');

  const lightPlan: SleepPlan = { mode: 'light', durationFactor: 0.8, cognitiveOpen: false };
  const lightSchedule = scheduleReplay(lightPlan, { memories });
  assert.strictEqual(lightSchedule.plan, 'consolidation', 'light sleep keeps consolidation minimal');
  assert.ok(lightSchedule.selectedMemories.length <= 3, 'light sleep keeps replay short');

  console.log('replay fatigue integration tests passed');
})();
