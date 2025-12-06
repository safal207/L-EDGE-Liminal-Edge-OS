import assert from 'assert';
import { MemoryEngine } from '../../memory/memoryEngine';
import { DreamReplayEngine } from '../dreamReplayEngine';
import type { SleepPlan } from '../../sleep/sleepCycle';

function createMemoryWithSnapshots() {
  const memory = new MemoryEngine({ shortTermLimit: 10 });
  const now = Date.now();
  for (let i = 0; i < 4; i++) {
    memory.remember({
      source: 'reflex',
      type: i % 2 === 0 ? 'stress.high' : 'stress.critical',
      ts: now - i * 100,
      intensity: 0.85,
    });
  }
  memory.consolidate();

  // Add calmer snapshot to test recovery bias selection.
  memory.remember({ source: 'circulation', type: 'flow.shift', ts: now - 50, intensity: 0.3 });
  memory.remember({ source: 'perception', type: 'signal.smooth', ts: now - 60, intensity: 0.25 });
  memory.consolidate();
  return memory;
}

async function run() {
  const memory = createMemoryWithSnapshots();
  const replay = new DreamReplayEngine({ memory, config: { maxEpisodes: 3 } });

  const firstRun = replay.runReplayCycle('manual');
  assert.ok(firstRun.episodesProcessed <= 3, 'respects max episodes');
  assert.ok(firstRun.avgIntegrationScore > 0, 'integration score calculated');
  assert.strictEqual(firstRun.status, 'idle');

  const memoryAfter = memory.getState();
  assert.ok(memoryAfter.longTerm.length >= 1, 'replay results recorded into long-term');

  // simulate sleep trigger path
  const recoveryPlan: SleepPlan = { mode: 'deep', cycles: 4, recoveryEmphasis: 0.9, replayEmphasis: 0.1 };
  const recoveryRun = replay.runReplayCycle('sleep', { sleepPlan: recoveryPlan });
  assert.ok(recoveryRun.lastTrigger === 'sleep');
  assert.ok(recoveryRun.reliefScore >= 0, 'relief score computed');
  assert.ok(recoveryRun.lastEpisodes.every((episode) => episode.stressScore < 0.85), 'recovery plan avoids overload episodes');

  const integrativePlan: SleepPlan = { mode: 'integrative', cycles: 3, recoveryEmphasis: 0.6, replayEmphasis: 0.8 };
  const integrativeRun = replay.runReplayCycle('sleep', { sleepPlan: integrativePlan });
  assert.ok(integrativeRun.lastEpisodes.length >= recoveryRun.lastEpisodes.length, 'integrative mode can allow more replay');
  assert.ok(integrativeRun.avgIntegrationScore >= 0, 'integration still computed');

  // ensure history trimming works implicitly via state exposure
  assert.ok(replay.getEpisodes().length === integrativeRun.lastEpisodes.length);
  assert.ok(replay.getResults().length === integrativeRun.lastResults.length);

  console.log('dream replay tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
