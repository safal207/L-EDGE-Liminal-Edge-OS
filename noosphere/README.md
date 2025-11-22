# NoosphereBridge

The NoosphereBridge is the 8–9th assembly layer that links the organism’s local field patterns to broader world imprints. It compares field resonance, stress, emotion, and perception data against a small library of `WorldImprint` templates to surface which larger narratives are "pressing" on the system.

## Responsibilities
- Load world imprints from `imprints.json` and score them against the current field, homeostasis, and perception state.
- Publish a `NoosphereSnapshot` with active imprints, dominant tags, support/tension balance, and timestamps.
- Offer observability via `/api/system/noosphere` (and `/imprints`) and heartbeat payloads.

## Inputs
- `field` resonance snapshot (loops, traps, corridors, entropy/confidence).
- `homeostasis` stress level.
- `perception` threat/opportunity mix.
- `emotion` current state.
- `self` model volatility to gauge stability.

## Outputs
- Ranked `activeImprints` with weights.
- `supportLevel` and `tensionLevel` aggregates.
- `dominantTag` string for quick labeling.

## API
- `GET /api/system/noosphere` – latest `NoosphereSnapshot`.
- `GET /api/system/noosphere/imprints` – configured imprint templates.

## Usage
The bridge is refreshed each heartbeat inside `systemContext`, and its snapshot is attached to the heartbeat record plus health/organism endpoints. Imprints can be extended by editing `noosphere/imprints.json` or passing custom templates when instantiating the bridge.
