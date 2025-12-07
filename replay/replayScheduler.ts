import { EventEmitter } from 'events';

export interface ReplaySchedulerEvents {
  tick: () => void;
}

export interface ReplayContext {
  memories: { id: string; intensity: number; novelty?: number }[];
}

export interface ReplaySchedule {
  plan: 'restoration' | 'integration' | 'consolidation';
  selectedMemories: string[];
  openness: boolean;
}

export function scheduleReplay(plan: { mode: 'light' | 'deep' | 'integrative' }, ctx: ReplayContext): ReplaySchedule {
  const sorted = [...ctx.memories].sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0));

  if (plan.mode === 'deep') {
    const selected = sorted.filter((memory) => memory.intensity < 0.7).map((m) => m.id);
    return { plan: 'restoration', selectedMemories: selected, openness: false } satisfies ReplaySchedule;
  }

  if (plan.mode === 'integrative') {
    const selected = sorted
      .sort((a, b) => (b.novelty ?? 0) - (a.novelty ?? 0))
      .slice(0, Math.max(1, Math.round(sorted.length * 0.6)))
      .map((m) => m.id);
    return { plan: 'integration', selectedMemories: selected, openness: true } satisfies ReplaySchedule;
  }

  const selected = sorted.slice(0, Math.min(3, sorted.length)).map((m) => m.id);
  return { plan: 'consolidation', selectedMemories: selected, openness: false } satisfies ReplaySchedule;
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
