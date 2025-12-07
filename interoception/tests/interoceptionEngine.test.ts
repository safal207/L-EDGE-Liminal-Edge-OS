import assert from 'assert';
import { computeBodyFatigueSnapshot } from '../bodyFatigueSnapshot';
import { InteroceptionEngine } from '../interoceptionEngine';
import type { InteroceptionContext } from '../contracts';
import type { ReflexState } from '../../reflex/types';
import type { ReplayState } from '../../replay/types';
import type { PerceptionSummary } from '../../perception/types';
import type { MemoryState } from '../../memory/memoryTypes';
import type { MetaState } from '../../meta/types';

const buildContext = (overrides?: Partial<InteroceptionContext>): InteroceptionContext => {
  const reflex: ReflexState = overrides?.reflex ?? { lastActions: [], lastEvents: [] };
  const replay: ReplayState =
    overrides?.replay ??
    ({
      status: 'idle',
      lastRunAt: 0,
      episodesProcessed: 0,
      avgIntegrationScore: 0.4,
      reliefScore: 0.3,
      lastResults: [],
      lastEpisodes: [],
    } satisfies ReplayState);
  const perception: PerceptionSummary =
    overrides?.perception ?? ({
      pressure: 0.2,
      threatScore: 0.1,
      opportunityScore: 0.4,
      noiseLevel: 0.1,
      status: 'calm',
      signalsProcessed: 0,
      lastUpdated: Date.now(),
    } satisfies PerceptionSummary);
  const memory: MemoryState =
    overrides?.memory ?? ({ shortTerm: [], longTerm: [], lastConsolidatedAt: 0, shortTermLimit: 50, status: 'idle' } satisfies MemoryState);
  const meta: MetaState = overrides?.meta ?? { observations: [], summary: { coherence: 1, stressTrend: 'stable', adaptationPhase: 'steady-state', dominantIntent: 'CALM', anomalies: [], lastUpdated: Date.now(), reflexFrequency: 0, replayRelief: 0 } };

  return {
    homeostasis: overrides?.homeostasis ?? {
      stressScore: 0.25,
      loadLevel: 'low',
      lastDecisionAt: Date.now(),
      recommendations: { increaseTransmutation: false, triggerSleep: false, throttleEdge: false },
    },
    sleep: overrides?.sleep ?? { lastSleep: Date.now() - 30 * 60 * 1000, consolidationEvents: 1, dreamIterations: 1, noiseCleared: 4 },
    reflex,
    replay,
    transmutation: overrides?.transmutation ?? { lastMutation: 0, purifiedEvents: 10, discardedEntropy: 2, signalStrength: 0.4 },
    perception,
    intent:
      overrides?.intent ??
      ({
        mode: 'CALM',
        decision: {
          allowHeavyTasks: true,
          throttleNonCritical: false,
          preferCache: false,
          forceSleepSoon: false,
          degradedMode: false,
        },
        lastEvaluatedAt: Date.now(),
        context: {
          homeostasis: overrides?.homeostasis ?? {
            stressScore: 0.25,
            loadLevel: 'low',
            lastDecisionAt: Date.now(),
            recommendations: { increaseTransmutation: false, triggerSleep: false, throttleEdge: false },
          },
          reflex,
          replay,
          memory,
          perception,
        },
      overrideActive: false,
    } satisfies InteroceptionContext['intent']),
    circulation: overrides?.circulation,
    heartbeat: overrides?.heartbeat,
    memory,
    meta,
    resources: overrides?.resources,
    minerals: overrides?.minerals,
  };
};

(async () => {
  const engine = new InteroceptionEngine({ maxSignals: 5 });

  const calm = engine.evaluate(buildContext());
  assert.strictEqual(calm.summary.status, 'stable');
  assert(calm.summary.readiness > 0.6, 'readiness should stay high when system is calm');

  const stressedPerception: PerceptionSummary = {
    pressure: 0.7,
    threatScore: 0.8,
    opportunityScore: 0.1,
    noiseLevel: 0.8,
    status: 'alert',
    signalsProcessed: 5,
    lastUpdated: Date.now(),
  };
  const stressedReplay: ReplayState = {
    status: 'idle',
    lastRunAt: Date.now(),
    episodesProcessed: 2,
    avgIntegrationScore: 0.2,
    reliefScore: 0.05,
    lastResults: [],
    lastEpisodes: [],
  };
  const stressedMemory: MemoryState = { shortTerm: [], longTerm: [], lastConsolidatedAt: 0, shortTermLimit: 50, status: 'idle' };

  const stressedContext = buildContext({
    homeostasis: { stressScore: 0.92, loadLevel: 'critical', lastDecisionAt: Date.now(), recommendations: { increaseTransmutation: true, triggerSleep: true, throttleEdge: true } },
    sleep: { lastSleep: Date.now() - 8 * 60 * 60 * 1000, consolidationEvents: 0, dreamIterations: 0, noiseCleared: 0.5 },
    reflex: { lastActions: [{ id: 'r1', ts: Date.now(), severity: 'critical', reason: 'overload', commands: { throttleEdge: true, forceSleep: true } }], lastEvents: [] },
    perception: stressedPerception,
    transmutation: { lastMutation: Date.now(), purifiedEvents: 2, discardedEntropy: 8, signalStrength: 0.1 },
    replay: stressedReplay,
    memory: stressedMemory,
    intent: {
      mode: 'CRITICAL',
      decision: { allowHeavyTasks: false, throttleNonCritical: true, preferCache: true, forceSleepSoon: true, degradedMode: true },
      lastEvaluatedAt: Date.now(),
      context: {
        homeostasis: { stressScore: 0.92, loadLevel: 'critical', lastDecisionAt: Date.now(), recommendations: { increaseTransmutation: true, triggerSleep: true, throttleEdge: true } },
        reflex: { lastActions: [], lastEvents: [] },
        replay: stressedReplay,
        memory: stressedMemory,
        perception: stressedPerception,
      },
      overrideActive: false,
    },
    circulation: { timestamp: new Date().toISOString(), loopsCompleted: 4, saturation: 0.8, direction: 'Edge → Core', flowSpeedMs: 12, resonanceTemperature: 80, pressure: 200, pulsation: 'compression', degradationRate: 0.3 },
    heartbeat: { timestamp: new Date().toISOString(), edgeStatus: 'ok', storageSize: 10, resonancePending: 5, decisionsGenerated: 1, awarenessDecisions: 1, runtimeActive: 40 },
  });

  const stressed = engine.evaluate(stressedContext);
  assert.strictEqual(stressed.summary.status, 'critical');
  assert(stressed.summary.annotations.includes('tension.high'));
  assert(stressed.summary.annotations.includes('overload.high'));

  for (let i = 0; i < 20; i += 1) {
    engine.ingestSignal({ ts: Date.now(), source: 'test', kind: 'pulse', intensity: 0.5 });
  }

  assert(engine.getState().signals.length <= 5, 'history should be trimmed to maxSignals');

  console.log('interoception engine tests passed');

  const highStrainSnapshot = computeBodyFatigueSnapshot({
    resources: { energy: 0.25, stability: 0.2 },
    minerals: { trace: 0.3, density: 0.25 },
    emotionalLoad: 0.8,
    entropyLevel: 0.6,
  });
  assert(highStrainSnapshot.fatigueLevel > 0.7, 'high strain should raise fatigue perception');
  assert(highStrainSnapshot.depletionLevel > 0.7, 'low reserves increase depletion perception');
  assert.strictEqual(highStrainSnapshot.recoveryNeed, 'high', 'high strain + depletion increases recovery urgency');
  assert.strictEqual(highStrainSnapshot.suggestedSleepMode, 'deep', 'critical strain biases toward deep sleep');

  const regenerativeSnapshot = computeBodyFatigueSnapshot({
    resources: { energy: 0.75, stability: 0.85 },
    minerals: { trace: 0.7, density: 0.7 },
    emotionalLoad: 0.35,
    entropyLevel: 0.35,
  });
  assert(regenerativeSnapshot.fatigueLevel > 0.4 && regenerativeSnapshot.fatigueLevel < 0.7, 'mixed state yields moderate fatigue');
  assert(regenerativeSnapshot.depletionLevel > 0.35 && regenerativeSnapshot.depletionLevel < 0.7, 'mixed state yields moderate depletion');
  assert.strictEqual(regenerativeSnapshot.recoveryNeed, 'medium', 'recovery need stays moderate');
  assert.strictEqual(regenerativeSnapshot.suggestedSleepMode, 'integrative');

  const restedSnapshot = computeBodyFatigueSnapshot({
    resources: { energy: 0.9, stability: 0.9 },
    minerals: { trace: 0.85, density: 0.85 },
    emotionalLoad: 0.1,
    entropyLevel: 0.1,
  });
  assert(restedSnapshot.fatigueLevel < 0.35, 'well-resourced state keeps fatigue low');
  assert(restedSnapshot.depletionLevel < 0.35, 'healthy reserves keep depletion low');
  assert.strictEqual(restedSnapshot.recoveryNeed, 'low');
  assert.strictEqual(restedSnapshot.suggestedSleepMode, 'light');
})();
