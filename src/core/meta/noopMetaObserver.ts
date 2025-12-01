import type { LiminalEvent, MetaObserver } from "./metaObserver";

export class NoopMetaObserver implements MetaObserver {
  record(_event: LiminalEvent): void {
    // intentionally no-op
  }

  recordMany?(events: LiminalEvent[]): void {
    for (const event of events) {
      this.record(event);
    }
  }

  flush?(): void {
    // no-op
  }
}
