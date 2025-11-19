import { EdgeEvent } from '../../core';
import { EntropyCleaningResult } from '../contracts';

const resolveEntropyScore = (event: EdgeEvent): number => {
  const payloadEntropy = typeof event.payload.entropy === 'number' ? event.payload.entropy : 0;
  const metadataEntropyValue = (event.metadata as Record<string, unknown>).entropy;
  const metadataEntropy = typeof metadataEntropyValue === 'number' ? metadataEntropyValue : 0;
  return Math.min(1, Math.max(0, payloadEntropy || metadataEntropy));
};

export const cleanEntropy = (events: EdgeEvent[]): EntropyCleaningResult => {
  const purifiedEvents: EdgeEvent[] = [];
  let discardedEntropy = 0;

  events.forEach((event) => {
    const entropyScore = resolveEntropyScore(event);
    if (entropyScore > 0.5) {
      discardedEntropy += 1;
      return;
    }
    purifiedEvents.push(event);
  });

  return {
    purifiedEvents,
    discardedEntropy,
  };
};
