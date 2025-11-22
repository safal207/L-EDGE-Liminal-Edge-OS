import assert from 'assert';
import { FieldResonanceEngine } from '../fieldResonanceEngine';

async function run() {
  const engine = new FieldResonanceEngine({ historyLimit: 5, patternLimit: 5, scoreThreshold: 0.2 });

  // Build loop and corridor
  engine.evaluate({ intentMode: 'CALM', emotionState: 'calmReady', stress: 0.2, threat: 0.2, opportunity: 0.72 });
  engine.evaluate({ intentMode: 'CALM', emotionState: 'calmReady', stress: 0.22, threat: 0.2, opportunity: 0.71 });
  const loopSnapshot = engine.evaluate({ intentMode: 'CALM', emotionState: 'calmReady', stress: 0.2, threat: 0.2, opportunity: 0.74 });

  const loopPattern = loopSnapshot.pastField.dominantPatterns.find((p) => p.kind === 'loop');
  assert.ok(loopPattern, 'loop pattern should be detected');
  assert.ok(loopPattern.strength > 0.2, 'loop strength should accumulate');

  // Trap scenario
  engine.evaluate({ intentMode: 'FOCUSED', emotionState: 'alert', stress: 0.8, threat: 0.7, opportunity: 0.2 });
  const trapSnapshot = engine.evaluate({ intentMode: 'FOCUSED', emotionState: 'alert', stress: 0.82, threat: 0.72, opportunity: 0.2 });
  const trapPattern = trapSnapshot.pastField.dominantPatterns.find((p) => p.kind === 'trap');
  assert.ok(trapPattern, 'trap pattern should be detected');

  // Corridor from stressed to calm
  engine.evaluate({ intentMode: 'HEALING', emotionState: 'recovering', stress: 0.6, threat: 0.45, opportunity: 0.5 });
  const corridorSnapshot = engine.evaluate({ intentMode: 'HEALING', emotionState: 'calmReady', stress: 0.3, threat: 0.2, opportunity: 0.8 });
  const corridor = corridorSnapshot.futureField.candidatePatterns.find((p) => p.kind === 'corridor');
  assert.ok(corridor, 'corridor pattern should be surfaced');

  // History limit respected
  const history = engine.listHistory();
  assert.ok(history.length <= 5, 'history should be bounded');

  console.log('field resonance tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
