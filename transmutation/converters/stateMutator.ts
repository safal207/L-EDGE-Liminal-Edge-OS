import crypto from 'crypto';
import { EdgeEvent } from '../../core';
import { TransmutationState } from '../contracts';
import { LoopTelemetry } from '../../circulation/types';

const buildSignature = (parts: Array<string | number>): string => {
  const hash = crypto.createHash('sha1');
  hash.update(parts.join('|'));
  return hash.digest('hex');
};

export const mutateState = (
  previous: TransmutationState,
  events: EdgeEvent[],
  signalStrength: number,
  discardedEntropy: number,
  telemetry?: LoopTelemetry,
): TransmutationState => {
  const purifiedEvents = events.length;
  const lastMutation = Date.now();
  const tags = events.slice(0, 5).map((event) => event.type);
  const signatureSeed = [
    purifiedEvents,
    discardedEntropy,
    signalStrength,
    telemetry?.decision.id ?? 'no-decision',
    previous.signature,
    ...tags,
  ];
  const signature = buildSignature(signatureSeed);

  return {
    lastMutation,
    purifiedEvents,
    discardedEntropy,
    signalStrength,
    signature,
    tags,
  };
};
