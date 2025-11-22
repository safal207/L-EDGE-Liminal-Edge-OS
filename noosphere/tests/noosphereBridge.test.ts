import assert from 'assert';
import { NoosphereBridge } from '../noosphereBridge';
import { FieldSnapshot } from '../../field/contracts';
import { NoosphereContext } from '../contracts';
import { buildNoosphereReport } from '../reportBuilder';

const baseField: FieldSnapshot = {
  pastField: { dominantPatterns: [], entropy: 0.4 },
  futureField: { candidatePatterns: [], confidence: 0.25 },
  lastUpdated: Date.now(),
};

const calmEmotion = {
  state: 'calmReady' as const,
  confidence: 0.8,
  volatility: 0.1,
  annotations: [],
  contributors: { tension: 0.2, threat: 0.1, opportunity: 0.7, fatigue: 0.2, readiness: 0.8 },
  lastUpdated: Date.now(),
};

const alertEmotion = {
  state: 'alert' as const,
  confidence: 0.6,
  volatility: 0.5,
  annotations: [],
  contributors: { tension: 0.7, threat: 0.8, opportunity: 0.1, fatigue: 0.5, readiness: 0.3 },
  lastUpdated: Date.now(),
};

const calmPerception = {
  pressure: 0.3,
  threatScore: 0.2,
  opportunityScore: 0.7,
  noiseLevel: 0.2,
  status: 'calm' as const,
  lastUpdated: Date.now(),
  signalsProcessed: 3,
};

const alertPerception = {
  pressure: 0.7,
  threatScore: 0.7,
  opportunityScore: 0.1,
  noiseLevel: 0.4,
  status: 'alert' as const,
  lastUpdated: Date.now(),
  signalsProcessed: 5,
};

async function run() {
  const bridge = new NoosphereBridge();

  // Growth corridor imprint lights up when corridor and low stress
  const context: NoosphereContext = {
    field: {
      ...baseField,
      pastField: { dominantPatterns: [], entropy: 0.2 },
      futureField: {
        candidatePatterns: [{ id: 'corridor', kind: 'corridor', tags: ['growth'], strength: 0.7, evidenceCount: 2 }],
        confidence: 0.7,
      },
    },
    homeostasis: {
      stressScore: 0.35,
      loadLevel: 'normal',
      lastDecisionAt: Date.now(),
      recommendations: { increaseTransmutation: false, triggerSleep: false, throttleEdge: false },
    },
    perception: calmPerception,
    emotion: calmEmotion,
  };

  const growthSnapshot = bridge.compute(context);
  const growthImprint = growthSnapshot.activeImprints.find((imprint) => imprint.id === 'growth_corridor');
  assert.ok(growthImprint, 'growth corridor imprint should activate');
  assert.ok(growthImprint.weight > 0.4, 'growth corridor imprint should have a meaningful weight');
  assert.strictEqual(growthSnapshot.dominantTag, growthImprint.tags[0]);

  // Crisis trap should outscore when traps + high stress
  const trapSnapshot = bridge.compute({
    ...context,
    field: {
      ...baseField,
      pastField: {
        dominantPatterns: [
          { id: 'trap', kind: 'trap', tags: ['crisis'], strength: 0.8, evidenceCount: 3 },
          { id: 'loop', kind: 'loop', tags: ['turbulence'], strength: 0.5, evidenceCount: 2 },
        ],
        entropy: 0.7,
      },
      futureField: { candidatePatterns: [], confidence: 0.2 },
    },
    homeostasis: {
      stressScore: 0.82,
      loadLevel: 'critical',
      lastDecisionAt: Date.now(),
      recommendations: { increaseTransmutation: true, triggerSleep: true, throttleEdge: true },
    },
    perception: alertPerception,
    emotion: alertEmotion,
  });

  const crisis = trapSnapshot.activeImprints.find((imprint) => imprint.id === 'crisis_trap');
  assert.ok(crisis && crisis.weight > 0.4, 'crisis trap imprint should activate under stress');
  assert.ok(trapSnapshot.tensionLevel >= crisis.weight, 'tension level aggregates stressed imprints');

  const report = buildNoosphereReport({
    snapshot: growthSnapshot,
    field: context.field!,
    lastIntent: { mode: 'CALM' },
  });
  assert.strictEqual(report.noosphere.mode, 'supportive');
  assert.strictEqual(report.intentHint.recommendedMode, 'deep_focus');

  // History / weight floor trims empty results
  const emptySnapshot = bridge.compute({
    field: baseField,
    homeostasis: {
      stressScore: 0.2,
      loadLevel: 'low',
      lastDecisionAt: Date.now(),
      recommendations: { increaseTransmutation: false, triggerSleep: false, throttleEdge: false },
    },
  });
  assert.ok(emptySnapshot.activeImprints.length <= 4, 'active imprints remain bounded');

  console.log('noosphere bridge tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
