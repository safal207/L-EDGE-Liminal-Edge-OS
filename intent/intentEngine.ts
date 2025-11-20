import { IntentContext, IntentDecision, IntentMode, IntentOverride, IntentState } from './types';

const defaultDecision: IntentDecision = {
  allowHeavyTasks: true,
  throttleNonCritical: false,
  preferCache: false,
  forceSleepSoon: false,
  degradedMode: false,
  boostTransmutation: false,
};

export class IntentEngine {
  private state: IntentState;
  private override?: IntentOverride;

  constructor() {
    const initialContext: IntentContext = {
      homeostasis: {
        stressScore: 0,
        loadLevel: 'low',
        recommendations: { increaseTransmutation: false, throttleEdge: false, triggerSleep: false },
        lastDecisionAt: 0,
      },
      reflex: { lastActions: [], lastEvents: [] },
      replay: {
        status: 'idle',
        lastRunAt: 0,
        episodesProcessed: 0,
        avgIntegrationScore: 0,
        reliefScore: 0,
        lastResults: [],
        lastEpisodes: [],
      },
      memory: {
        shortTerm: [],
        longTerm: [],
        lastConsolidatedAt: 0,
        shortTermLimit: 50,
        status: 'idle',
      },
      perception: undefined,
      interoception: {
        signals: [],
        summary: {
          fatigue: 0,
          tension: 0,
          entropyPressure: 0,
          readiness: 1,
          clarity: 1,
          overload: 0,
          status: 'stable',
          annotations: [],
          lastUpdated: Date.now(),
        },
      },
    };

    this.state = {
      mode: 'CALM',
      decision: { ...defaultDecision },
      lastEvaluatedAt: Date.now(),
      context: initialContext,
      overrideActive: false,
    };
  }

  evaluate(context: IntentContext): IntentState {
    const mode = this.override?.mode ?? this.resolveMode(context);
    const decision = this.override?.decision ?? this.resolveDecision(mode, context);
    this.state = {
      mode,
      decision,
      lastEvaluatedAt: Date.now(),
      context,
      overrideActive: Boolean(this.override),
    };
    return this.state;
  }

  setOverride(mode: IntentMode, decision?: IntentDecision): void {
    this.override = { mode, decision, setAt: Date.now() };
  }

  clearOverride(): void {
    this.override = undefined;
  }

  getState(): IntentState {
    return this.state;
  }

  private resolveMode(context: IntentContext): IntentMode {
    const emotionState = context.emotion?.current;
    const stress = context.homeostasis.stressScore;
    const lastReflex = context.reflex.lastActions.length
      ? context.reflex.lastActions[context.reflex.lastActions.length - 1]
      : undefined;
    const replayRelief = context.replay.reliefScore;
    const memoryDebt = Math.max(0, context.memory.shortTerm.length - context.memory.longTerm.length * 2) /
      Math.max(1, context.memory.shortTermLimit);
    const interoception = context.interoception?.summary;

    if (emotionState?.state === 'overloadProtect') {
      return 'CRITICAL';
    }

    if (emotionState?.state === 'focusThreat' || emotionState?.state === 'alert') {
      return stress >= 0.75 ? 'DEGRADED' : 'FOCUSED';
    }

    if (emotionState?.state === 'recovering') {
      return 'HEALING';
    }

    if (interoception?.status === 'critical' || (interoception?.overload ?? 0) > 0.85) {
      return 'CRITICAL';
    }

    if (stress >= 0.9 || lastReflex?.severity === 'critical') {
      return 'CRITICAL';
    }

    if (stress >= 0.75 || context.homeostasis.loadLevel === 'critical') {
      return 'DEGRADED';
    }

    if (interoception?.status === 'depleted' || (interoception?.fatigue ?? 0) > 0.65) {
      return 'HEALING';
    }

    if (stress >= 0.5 || lastReflex?.severity === 'warning') {
      return 'FOCUSED';
    }

    if (replayRelief > 0.4 || memoryDebt > 0.4) {
      return 'HEALING';
    }

    return 'CALM';
  }

  private resolveDecision(mode: IntentMode, context: IntentContext): IntentDecision {
    const base: IntentDecision = { ...defaultDecision };

    switch (mode) {
      case 'CRITICAL':
        return {
          ...base,
          allowHeavyTasks: false,
          throttleNonCritical: true,
          preferCache: true,
          forceSleepSoon: true,
          degradedMode: true,
          boostTransmutation: true,
        };
      case 'DEGRADED':
        return {
          ...base,
          allowHeavyTasks: false,
          throttleNonCritical: true,
          preferCache: true,
          forceSleepSoon: true,
          degradedMode: true,
          boostTransmutation: context.homeostasis.stressScore > 0.8,
        };
      case 'HEALING':
        return {
          ...base,
          allowHeavyTasks: false,
          throttleNonCritical: true,
          preferCache: true,
          forceSleepSoon: context.replay.reliefScore < 0.3,
          degradedMode: false,
          boostTransmutation: false,
        };
      case 'FOCUSED':
        return {
          ...base,
          allowHeavyTasks: true,
          throttleNonCritical: false,
          preferCache: true,
          forceSleepSoon: false,
          degradedMode: false,
          boostTransmutation: context.homeostasis.stressScore > 0.6,
        };
      case 'CALM':
      default:
        return { ...base };
    }
  }
}
