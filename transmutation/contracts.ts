import { EdgeEvent } from '../core';

export interface TransmutationMetrics {
  lastMutation: number;
  purifiedEvents: number;
  discardedEntropy: number;
  signalStrength: number;
}

export interface TransmutationState extends TransmutationMetrics {
  signature: string;
  tags: string[];
}

export interface EntropyCleaningResult {
  purifiedEvents: EdgeEvent[];
  discardedEntropy: number;
}

export interface SignalSeparationResult {
  signalStrength: number;
  signalEvents: EdgeEvent[];
}
