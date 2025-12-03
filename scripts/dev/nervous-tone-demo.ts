import {
  resetBreathingState,
  runBreathingCycle,
  type RetrospectiveMetrics,
} from '../../src/layers/L33_breathing';
import { getCurrentOrganismTone } from '../../src/layers/shared/organismTone';
import {
  DEFAULT_SIGNAL_THRESHOLDS,
  adjustSignalThresholds,
} from '../../src/nerve/L10_signal_tuning';
import {
  aggregateExternalSignals,
  createExternalSignalsBuffer,
  pushExternalSignal,
  type ExternalSignal,
} from '../../src/nerve/L12_external_signals_buffer';

function runToneDemo() {
  resetBreathingState();

  const scenarios: RetrospectiveMetrics[] = [
    {
      avgSurprise: 0.65,
      avgLearningSignal: 0.55,
      calibrationMismatchRate: 0.15,
      outcomeVolatility: 0.35,
    },
    {
      avgSurprise: 0.85,
      avgLearningSignal: -0.25,
      calibrationMismatchRate: 0.35,
      outcomeVolatility: 0.75,
    },
  ];

  scenarios.forEach((metrics, index) => {
    const snapshot = runBreathingCycle(metrics);
    const tone = getCurrentOrganismTone();
    const adjustedThresholds = tone
      ? adjustSignalThresholds(DEFAULT_SIGNAL_THRESHOLDS, tone)
      : DEFAULT_SIGNAL_THRESHOLDS;

    console.log(`\nScenario ${index + 1}`);
    console.log('Tone', tone);
    console.log('Signal thresholds', adjustedThresholds);

    const buffer = createExternalSignalsBuffer(5000);
    const now = Date.now();
    const signals: ExternalSignal[] = [
      { source: 'sensor', kind: 'ambient', intensity: 0.05, timestamp: now - 1000 },
      { source: 'user_activity', kind: 'gesture', intensity: 0.4, timestamp: now - 900 },
      { source: 'system', kind: 'alert', intensity: 0.8, timestamp: now - 800 },
    ];

    signals.forEach((signal) => pushExternalSignal(buffer, signal, now));
    const aggregate = aggregateExternalSignals(buffer, { now, tone });
    console.log('Aggregated signals', aggregate);
  });
}

runToneDemo();
