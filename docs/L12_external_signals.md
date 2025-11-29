# L12 External Signals (Nerve Intake)

L12 captures abstract "nerve impulses" from outside the organism (transport, hardware, services) and folds them into the internal state without depending on any specific protocol.

## Signal shape
- **ExternalSignal**: source (`network`, `storage`, `sensor`, `llm_backend`, `user_activity`, `system`), `kind`, `intensity` (0..1), optional `stressImpact`, `recoveryImpact`, `explorationImpact`, numeric `metrics`, string `tags`, `timestamp`.
- **ExternalSignalsAggregate**: rolling view over a short window with `externalStress`, `externalRecovery`, `externalExploration`, and an optional `lastStrongSignal`.

## Buffer + aggregation
Use `createExternalSignalsBuffer`, `pushExternalSignal`, and `aggregateExternalSignals` to collect and summarize signals over a sliding window (default 10s). Stale signals are dropped automatically.

## How L12 influences the organism
- `externalStress` modestly boosts the effective load index passed into L9 metabolism.
- `externalRecovery` boosts the recent recovery index passed into L9.
- `externalExploration` provides a small boost to crystal growth momentum (L10) and is visible to downstream consumers.
- The aggregated view is stored on `OrganismSnapshot.externalSignals`, exposed via system context helpers.

## Usage example
```ts
registerExternalSignal({
  source: 'network',
  kind: 'latency_spike',
  intensity: 0.9,
  stressImpact: 0.8,
  metrics: { latency_ms: 850 },
  timestamp: Date.now(),
});

const snapshot = runOrganismPipeline({
  triAxis,
  stage: 10,
  telemetry: { loadIndex: 0.5 },
  resonanceQuality: 0.6,
  recentRecoveryIndex: 0.7,
  externalSignals: getExternalSignalsAggregate(),
});
```

LTP or any other protocol can emit `ExternalSignal` objects; L12 simply aggregates them and lets the organism respond via existing L9–L11 layers.
