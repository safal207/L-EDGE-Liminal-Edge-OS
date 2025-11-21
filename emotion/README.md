# Emotion / Proto-Emotion Layer

The `EmotionEngine` blends internal and external signals to form a lightweight proto-emotional state for the organism. It keeps a bounded history, exposes volatility, and annotates dominant drivers.

## Inputs
- Interoception summaries (fatigue, tension, overload, clarity, readiness)
- Homeostasis stress and load level
- Perception summary (pressure/threat/opportunity)
- Reflex highlights and intent mode
- Meta/replay cues for situational awareness

## Outputs
- `current` proto-emotion with confidence, contributors, annotations, and volatility
- Bounded history for coherence/volatility tracking

## Usage
- Call `emotionEngine.evaluate(context)` each heartbeat to refresh the state.
- Read `emotionEngine.getState()` for the latest state or `listHistory(n)` for recent frames.
- Surface `/api/system/emotion` and `/api/system/emotion/history` for observers.
