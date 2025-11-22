import { EventEmitter } from 'events';

export interface ReplaySchedulerEvents {
  tick: () => void;
}

export class ReplayScheduler extends EventEmitter {
  private timer?: NodeJS.Timeout;
  constructor(private readonly intervalMs = 5 * 60 * 1000) {
    super();
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.emit('tick'), this.intervalMs);
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }

  onTick(cb: () => void): void {
    this.on('tick', cb);
  }
}
