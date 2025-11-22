import assert from 'assert';
import { MemoryEngine } from '../../memory/memoryEngine';
import { DreamReplayEngine } from '../dreamReplayEngine';

function createMemoryWithSnapshots() {
  const memory = new MemoryEngine({ shortTermLimit: 10 });
  const now = Date.now();
  for (let i = 0; i < 6; i++) {
    memory.remember({
      source: 'reflex',
      type: i % 2 === 0 ? 'stress.high' : 'stress.critical',
      ts: now - i * 100,
      intensity: 0.8,
    });
  }
  memory.remember({ source: 'circulation', type: 'flow.shift', ts: now - 20, intensity: 0.4 });
  memory.consolidate();
  return memory;
}

async function run() {
  const memory = createMemoryWithSnapshots();
  const replay = new DreamReplayEngine({ memory, config: { maxEpisodes: 2 } });

  const firstRun = replay.runReplayCycle('manual');
  assert.ok(firstRun.episodesProcessed <= 2, 'respects max episodes');
  assert.ok(firstRun.avgIntegrationScore > 0, 'integration score calculated');
  assert.strictEqual(firstRun.status, 'idle');

  const memoryAfter = memory.getState();
  assert.ok(memoryAfter.longTerm.length >= 1, 'replay results recorded into long-term');

  // simulate sleep trigger path
  const secondRun = replay.runReplayCycle('sleep');
  assert.ok(secondRun.lastTrigger === 'sleep');
  assert.ok(secondRun.reliefScore >= 0, 'relief score computed');

  // ensure history trimming works implicitly via state exposure
  assert.ok(replay.getEpisodes().length === secondRun.lastEpisodes.length);
  assert.ok(replay.getResults().length === secondRun.lastResults.length);

  console.log('dream replay tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
