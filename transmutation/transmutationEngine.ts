import { EventEmitter } from 'events';
import { CirculationPump } from '../circulation/pump';
import { LoopTelemetry } from '../circulation/types';
import { LiminalStorage } from '../storage/storage';
import { cleanEntropy } from './converters/entropyCleaner';
import { separateSignal } from './converters/signalSeparator';
import { mutateState } from './converters/stateMutator';
import { TransmutationMetrics, TransmutationState } from './contracts';

interface TransmutationEngineDeps {
  storage: LiminalStorage;
  pump: CirculationPump;
}

export interface TransmutationEvents {
  mutation: (metrics: TransmutationMetrics) => void;
}

export class TransmutationEngine extends EventEmitter {
  private state: TransmutationState = {
    lastMutation: 0,
    purifiedEvents: 0,
    discardedEntropy: 0,
    signalStrength: 0,
    signature: 'initial',
    tags: [],
  };

  constructor(private readonly deps: TransmutationEngineDeps) {
    super();
    this.deps.pump.onLoopCompleted((telemetry) => {
      void this.transmute(telemetry);
    });
  }

  override on<U extends keyof TransmutationEvents>(event: U, listener: TransmutationEvents[U]): this {
    return super.on(event, listener);
  }

  override emit<U extends keyof TransmutationEvents>(event: U, ...args: Parameters<TransmutationEvents[U]>): boolean {
    return super.emit(event, ...args);
  }

  async transmute(telemetry?: LoopTelemetry): Promise<TransmutationMetrics> {
    const events = await this.deps.storage.queryEdgeEvents({ limit: 50 });
    const cleaning = cleanEntropy(events);
    const signal = separateSignal(cleaning.purifiedEvents);
    this.state = mutateState(this.state, signal.signalEvents, signal.signalStrength, cleaning.discardedEntropy, telemetry);
    const metrics = this.getMetrics();
    this.emit('mutation', metrics);
    return metrics;
  }

  getMetrics(): TransmutationMetrics {
    const { lastMutation, purifiedEvents, discardedEntropy, signalStrength } = this.state;
    return { lastMutation, purifiedEvents, discardedEntropy, signalStrength };
  }

  getState(): TransmutationState {
    return this.state;
  }
}
