import { describe, expect, it } from 'vitest';
import {
  computeForesight,
  generateFutureEcho,
  gentleSteer,
} from '../layers/L31_Foresight';

describe('L31 Foresight Engine', () => {
  it('blends past, present, and future signals into a direction and confidence', () => {
    const result = computeForesight({
      pastLoops: [0.1, -0.1, 0.3],
      presentSignals: [0.5, 0.6, 0.4],
      futureBranches: [
        [0.4, 0.6],
        [0.5, 0.7],
      ],
    });

    expect(result.direction).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(['growth', 'neutral', 'contraction']).toContain(result.attractor);
  });

  it('generates an echo that scales with direction and confidence', () => {
    const echo = generateFutureEcho(0.8, 0.9);

    expect(echo.echoSignal).toBeCloseTo(0.8 * (0.2 + 0.9 * 0.8));
    expect(echo.intensity).toBeCloseTo(Math.abs(echo.echoSignal));
  });

  it('gently steers the current trajectory using the echo', () => {
    const current = 0.2;
    const echo = 0.5;

    expect(gentleSteer(current, echo)).toBeCloseTo(current + echo * 0.4);
  });
});
