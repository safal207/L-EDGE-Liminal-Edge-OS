import assert from 'assert';
import { ScenarioEngine } from '../scenarioEngine';
import { defaultScenarioRules } from '../defaultRules';
import { NoosphereReport } from '../../noosphere/contracts';

const supportiveReport: NoosphereReport = {
  noosphere: { support: 0.72, tension: 0.2, mode: 'supportive', dominantTag: 'growth' },
  field: { pastEntropy: 0.3, futureConfidence: 0.7, topPatterns: [] },
  intentHint: { recommendedMode: 'deep_focus', comment: 'ok' },
  timestamp: Date.now(),
};

const tenseReport: NoosphereReport = {
  noosphere: { support: 0.2, tension: 0.82, mode: 'high_tension' },
  field: { pastEntropy: 0.6, futureConfidence: 0.3, topPatterns: [] },
  intentHint: { recommendedMode: 'recovery', comment: 'tension' },
  timestamp: Date.now(),
};

async function run() {
  const engine = new ScenarioEngine(defaultScenarioRules);

  const aligned = engine.evaluate({
    noosphereReport: supportiveReport,
    heartbeat: { intent: { fieldAlignment: 'aligned' } } as any,
  });
  assert.ok(aligned.length, 'should produce suggestions');
  assert.strictEqual(aligned[0].recommendedMode, 'deep_focus');

  const tense = engine.evaluate({ noosphereReport: tenseReport });
  assert.ok(tense.some((suggestion) => suggestion.recommendedMode === 'recovery'));

  console.log('scenario engine tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
