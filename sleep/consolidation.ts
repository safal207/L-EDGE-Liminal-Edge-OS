import { EdgeEvent } from '../core';

export interface ConsolidationResult {
  consolidationEvents: number;
  noiseCleared: number;
}

const isNoise = (event: EdgeEvent): boolean => {
  const payloadNoise = typeof event.payload.entropy === 'number' ? event.payload.entropy : 0;
  return payloadNoise > 0.7 || event.payload.noise === true;
};

export const consolidateEvents = (events: EdgeEvent[]): ConsolidationResult => {
  let noiseCleared = 0;
  events.forEach((event) => {
    if (isNoise(event)) {
      noiseCleared += 1;
    }
  });

  return {
    consolidationEvents: events.length - noiseCleared,
    noiseCleared,
  };
};
