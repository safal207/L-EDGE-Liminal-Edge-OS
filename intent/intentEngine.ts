import { FieldSnapshot } from '../field/contracts';
import { NoosphereSnapshot } from '../noosphere/contracts';
import { IntentContext, IntentDecision, IntentFieldAlignment, IntentMode, IntentOverride, IntentState } from './types';

const defaultDecision: IntentDecision = {
  allowHeavyTasks: true,
  throttleNonCritical: false,
  preferCache: false,
  forceSleepSoon: false,
  degradedMode: false,
  boostTransmutation: false,
};

const ALIGNMENT_THRESHOLDS = {
  supportive: 0.6,
  relaxedTension: 0.4,
  highTension: 0.7,
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

  syncState(state: IntentState): IntentState {
    this.state = state;
    return this.state;
  }

  annotateWithField(signals: { field?: FieldSnapshot; noosphere?: NoosphereSnapshot }, base?: IntentState): IntentState {
    const source = base ?? this.state;
    const decision = this.applyFieldAlignment(source.decision, signals.field, signals.noosphere);
    this.state = { ...source, decision };
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
    const socialHint = context.social?.summary;

    if (emotionState?.state === 'overloadProtect') {
      return 'CRITICAL';
    }

    if (socialHint?.fieldResonance.status === 'overloaded' || socialHint?.recommendation.action === 'shield') {
      return 'CRITICAL';
    }

    if (socialHint?.recommendation.action === 'detach' && (stress > 0.55 || (interoception?.overload ?? 0) > 0.6)) {
      return 'DEGRADED';
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
    const socialRecommendation = context.social?.summary.recommendation.action;

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
          boostTransmutation: context.homeostasis.stressScore > 0.8 || socialRecommendation === 'shield',
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
          boostTransmutation: context.homeostasis.stressScore > 0.6 || socialRecommendation === 'amplify',
        };
      case 'CALM':
      default:
        return {
          ...base,
          throttleNonCritical: socialRecommendation === 'observe' ? base.throttleNonCritical : base.throttleNonCritical,
        };
    }
  }

  private applyFieldAlignment(
    decision: IntentDecision,
    field?: FieldSnapshot,
    noosphere?: NoosphereSnapshot,
  ): IntentDecision {
    const support = noosphere?.supportLevel ?? 0;
    const tension = noosphere?.tensionLevel ?? 0;
    const alignment = this.classifyAlignment(support, tension, field?.futureField.confidence ?? 0);

    return {
      ...decision,
      fieldAlignment: alignment,
      noosphereSupport: support,
      noosphereTension: tension,
    } satisfies IntentDecision;
  }

  private classifyAlignment(support: number, tension: number, futureConfidence: number): IntentFieldAlignment {
    if (tension >= ALIGNMENT_THRESHOLDS.highTension && support < ALIGNMENT_THRESHOLDS.supportive) {
      return 'against_field';
    }
    if (support >= ALIGNMENT_THRESHOLDS.supportive && tension <= ALIGNMENT_THRESHOLDS.relaxedTension) {
      return 'aligned';
    }
    if (futureConfidence > ALIGNMENT_THRESHOLDS.supportive && tension < ALIGNMENT_THRESHOLDS.highTension) {
      return 'aligned';
    }
    return 'neutral';
  }
}
