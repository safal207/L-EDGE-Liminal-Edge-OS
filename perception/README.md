# Perception / Sensorium Layer

The perception layer ingests external and system signals, filters noise, and builds a snapshot the rest of the organism can use to react. It classifies telemetry, alerts, anomalies, and background noise into a normalized view that feeds Homeostasis and Reflex.

## Responsibilities
- Accept raw signals from edge/runtime/heartbeat or external producers via system context or HTTP.
- Filter low-intensity noise and identify anomalies.
- Maintain a bounded history and publish a consolidated snapshot with noise level, signal level, anomaly count, and status (`ok | noisy | degraded | critical`).
- Provide a single state getter for health APIs and regulators.

## API usage
- `GET /api/system/perception` returns the latest snapshot.
- `POST /api/system/perception/signal` can be used by external emitters to push a signal `{ source, type, intensity, payload? }`.

The snapshot is also surfaced in `/api/system/health` and influences homeostasis and reflex computations.
