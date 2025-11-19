import { v4 as uuidv4 } from 'uuid';
import { HomeostasisState } from '../core/homeostasisManager';
import { ReflexAction, ReflexEvent, ReflexState } from './types';

interface ReflexEngineOpts {
  maxHistory?: number;
}

export class ReflexEngine {
  private readonly maxHistory: number;
  private state: ReflexState = { lastEvents: [], lastActions: [] };

  constructor(opts?: ReflexEngineOpts) {
    this.maxHistory = opts?.maxHistory ?? 100;
  }

  ingestEvent(evt: ReflexEvent): void {
    this.state.lastEvents = this.trim([...this.state.lastEvents, evt]);
  }

  evaluate(homeostasis: HomeostasisState): void {
    if (homeostasis.stressScore < 0.4) {
      return;
    }

    if (homeostasis.stressScore > 0.9) {
      this.pushAction({
        id: uuidv4(),
        ts: Date.now(),
        severity: 'critical',
        reason: 'stress.critical',
        commands: {
          throttleEdge: true,
          forceSleep: true,
          boostTransmutation: true,
          openDegradedMode: true,
        },
      });
      return;
    }

    if (homeostasis.stressScore > 0.75) {
      this.pushAction({
        id: uuidv4(),
        ts: Date.now(),
        severity: 'warning',
        reason: 'stress.high',
        commands: { boostTransmutation: true },
      });
    }
  }

  getState(): ReflexState {
    return this.state;
  }

  private trim<T>(items: T[]): T[] {
    if (items.length <= this.maxHistory) {
      return items;
    }
    return items.slice(items.length - this.maxHistory);
  }

  private pushAction(action: ReflexAction): void {
    this.state.lastActions = this.trim([...this.state.lastActions, action]);
  }
}
