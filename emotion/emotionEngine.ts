import { clamp } from '../meta/patternDetector';
import {
  EmotionContext,
  EmotionEngineOptions,
  EmotionKind,
  EmotionSnapshot,
  EmotionState,
} from './contracts';

export class EmotionEngine {
  private readonly maxHistory: number;
  private state: EmotionState;

  constructor(options?: EmotionEngineOptions) {
    this.maxHistory = options?.maxHistory ?? 120;
    const initial = this.buildSnapshot({
      homeostasis: {
        stressScore: 0,
        loadLevel: 'low',
        recommendations: { increaseTransmutation: false, triggerSleep: false, throttleEdge: false },
        lastDecisionAt: 0,
      },
    });
    this.state = { current: initial, history: [initial] };
  }

  evaluate(context: EmotionContext): EmotionState {
    const snapshot = this.buildSnapshot(context);
    const history = this.trim([...this.state.history, snapshot]);
    const volatility = this.computeVolatility(history);
    const withVolatility: EmotionSnapshot = { ...snapshot, volatility };

    this.state = {
      current: withVolatility,
      history: [...history.slice(0, history.length - 1), withVolatility],
    };

    return this.state;
  }

  getState(): EmotionState {
    return this.state;
  }

  listHistory(limit: number): EmotionSnapshot[] {
    return this.state.history.slice(-limit).reverse();
  }

  clear(): void {
    const reset = this.buildSnapshot({
      homeostasis: {
        stressScore: 0,
        loadLevel: 'low',
        recommendations: { increaseTransmutation: false, triggerSleep: false, throttleEdge: false },
        lastDecisionAt: 0,
      },
    });
    this.state = { current: reset, history: [reset] };
  }

  private buildSnapshot(context: EmotionContext): EmotionSnapshot {
    const interoception = context.interoception?.summary;
    const perception = context.perception;
    const reflexActions = context.reflex?.lastActions ?? [];
    const reflexSeverity = reflexActions.length ? reflexActions[reflexActions.length - 1].severity : undefined;
    const intentMode = context.intent?.mode;

    const tension = clamp(
      (context.homeostasis.stressScore ?? 0) * 0.6 + (interoception?.tension ?? 0) * 0.4 + (interoception?.overload ?? 0) * 0.3,
    );
    const threat = clamp(
      (perception?.threatScore ?? 0) * 0.7 +
        (context.homeostasis.loadLevel === 'critical' ? 0.3 : 0) +
        (reflexSeverity === 'critical' ? 0.2 : 0) +
        (interoception?.overload ?? 0) * 0.2,
    );
    const opportunity = clamp((perception?.opportunityScore ?? 0) * 0.8 + (interoception?.clarity ?? 0) * 0.2);
    const fatigue = interoception?.fatigue ?? 0.05;
    const readiness = clamp((interoception?.readiness ?? 0.5) * 0.7 + (1 - fatigue) * 0.3);

    const state = this.resolveState({
      tension,
      threat,
      opportunity,
      fatigue,
      readiness,
      intentMode,
    });

    const annotations = this.buildAnnotations({ state, tension, threat, opportunity, fatigue, readiness });
    const confidence = Math.max(threat, opportunity, readiness, tension, fatigue);

    return {
      state,
      confidence,
      contributors: { tension, threat, opportunity, fatigue, readiness },
      volatility: this.computeVolatility(this.state?.history ?? []),
      annotations,
      lastUpdated: Date.now(),
    } satisfies EmotionSnapshot;
  }

  private resolveState(input: {
    tension: number;
    threat: number;
    opportunity: number;
    fatigue: number;
    readiness: number;
    intentMode?: string;
  }): EmotionKind {
    if (input.tension > 0.9 || input.threat > 0.9) return 'overloadProtect';
    if (input.threat > 0.75) return input.readiness > 0.35 ? 'focusThreat' : 'alert';
    if (input.fatigue > 0.65 && input.threat < 0.5) return 'recovering';
    if (input.threat > 0.55) return 'alert';
    if (input.opportunity > 0.7 && input.readiness > 0.5) return 'exploreOpportunity';
    if (input.opportunity > 0.55 && input.tension < 0.5) return 'expanding';
    if (input.tension > 0.55 && input.fatigue > 0.35) return 'contracting';
    if (input.intentMode === 'FOCUSED') return 'calmReady';
    return 'calmReady';
  }

  private buildAnnotations(signal: {
    state: EmotionKind;
    tension: number;
    threat: number;
    opportunity: number;
    fatigue: number;
    readiness: number;
  }): string[] {
    const notes: string[] = [];
    if (signal.threat > 0.8) notes.push('threat.elevated');
    if (signal.tension > 0.75) notes.push('tension.high');
    if (signal.fatigue > 0.7) notes.push('fatigue.high');
    if (signal.opportunity > 0.6) notes.push('opportunity.present');
    if (signal.readiness > 0.75) notes.push('readiness.strong');
    notes.push(`state.${signal.state}`);
    return notes;
  }

  private computeVolatility(history: EmotionSnapshot[]): number {
    if (history.length < 2) return 0;
    let switches = 0;
    for (let i = 1; i < history.length; i++) {
      if (history[i].state !== history[i - 1].state) switches += 1;
    }
    return clamp(switches / Math.max(1, history.length - 1));
  }

  private trim<T>(items: T[]): T[] {
    if (items.length <= this.maxHistory) return items;
    return items.slice(items.length - this.maxHistory);
  }
}
