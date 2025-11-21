import { EdgeEvent } from '../../core';
import { SignalSeparationResult } from '../contracts';

const resolveSignalStrength = (event: EdgeEvent): number => {
  const payloadStrength = typeof event.payload.signalStrength === 'number' ? event.payload.signalStrength : 1;
  return Math.min(1, Math.max(0, payloadStrength));
};

export const separateSignal = (events: EdgeEvent[]): SignalSeparationResult => {
  if (events.length === 0) {
    return { signalStrength: 0, signalEvents: [] };
  }

  const signalEvents = events.filter((event) => !(event.payload.noise === true));
  const strengthSum = signalEvents.reduce((sum, event) => sum + resolveSignalStrength(event), 0);
  const normalizedStrength = signalEvents.length === 0 ? 0 : strengthSum / signalEvents.length;

  return {
    signalStrength: Number(normalizedStrength.toFixed(2)),
    signalEvents,
  };
};
