# L31 — Foresight Engine

Layer L31 introduces a foresight capability that senses possible futures, surfaces soft directions, and gently adjusts the organism toward coherent trajectories.

## Components
- **computeForesight**: blends past loops, present signals, and potential branches into a direction, confidence, and attractor.
- **generateFutureEcho**: turns foresight direction into an echo signal with intensity for downstream consumers.
- **gentleSteer**: softly adjusts a current trajectory using the echo without hard jumps.

## Usage
```ts
import { computeForesight, generateFutureEcho, gentleSteer } from './L31_Foresight';

const foresight = computeForesight({
  pastLoops: [0.1, 0.2, -0.1],
  presentSignals: [0.3, 0.4, 0.5],
  futureBranches: [
    [0.6, 0.7],
    [0.5, 0.8],
  ],
});

const echo = generateFutureEcho(foresight.direction, foresight.confidence);
const adjusted = gentleSteer(0.2, echo.echoSignal);
```
