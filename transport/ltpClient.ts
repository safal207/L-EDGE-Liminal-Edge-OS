import { EventEmitter } from 'events';
import { LtpEnvelope } from '../core';

export interface LtpClient {
  send(envelope: LtpEnvelope): Promise<void>;
  onMessage(handler: (envelope: LtpEnvelope) => void): void;
}

export class InMemoryLtpClient implements LtpClient {
  private readonly emitter = new EventEmitter();

  async send(envelope: LtpEnvelope): Promise<void> {
    setImmediate(() => this.emitter.emit('message', envelope));
  }

  onMessage(handler: (envelope: LtpEnvelope) => void): void {
    this.emitter.on('message', handler);
  }
}
