import { EdgeEvent } from '../core';

export interface ConsolidationResult {
  consolidationEvents: number;
  noiseCleared: number;
}

const isNoise = (event: EdgeEvent): boolean => {
  const payloadNoise = typeof event.payload.entropy === 'number' ? event.payload.entropy : 0;
  return payloadNoise > 0.7 || event.payload.noise === true;
};

export const consolidateEvents = (events: EdgeEvent[], plan?: { mode: string; durationFactor?: number }): ConsolidationResult => {
  let noiseCleared = 0;
  events.forEach((event) => {
    if (isNoise(event)) {
      noiseCleared += 1;
    }
  });

  // Recovery emphasis biases toward clearing more overload/noise.
  if (plan) {
    const durationBias = plan.durationFactor ?? (plan.mode === 'deep' ? 1.4 : 1);
    noiseCleared = Math.min(events.length, Math.round(noiseCleared * (1 + durationBias * 0.2)));
  }

  return {
    consolidationEvents: events.length - noiseCleared,
    noiseCleared,
  };
};
