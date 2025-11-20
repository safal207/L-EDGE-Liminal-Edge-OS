export type SleepTickListener = (timestamp: number) => void;

export class SleepScheduler {
  private readonly listeners = new Set<SleepTickListener>();
  private timer?: NodeJS.Timeout;

  constructor(private readonly intervalMs = 60_000) {}

  start(): void {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => {
      const ts = Date.now();
      this.listeners.forEach((listener) => listener(ts));
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  onTick(listener: SleepTickListener): void {
    this.listeners.add(listener);
  }

  triggerNow(): void {
    const ts = Date.now();
    this.listeners.forEach((listener) => listener(ts));
  }
}
