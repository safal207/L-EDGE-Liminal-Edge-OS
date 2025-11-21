import { HomeostasisState } from '../core/homeostasisManager';
import { computeReflexFrequency, computeStressTrend, clamp } from './patternDetector';
import { AdaptationPhase, MetaContext, MetaObservation, MetaState, StressTrend } from './types';

interface MetaEngineOptions {
  maxHistory?: number;
}

export class MetaEngine {
  private readonly maxHistory: number;
  private state: MetaState = {
    observations: [],
    summary: {
      coherence: 1,
      stressTrend: 'stable',
      adaptationPhase: 'steady-state',
      dominantIntent: 'CALM',
      anomalies: [],
      lastUpdated: Date.now(),
      reflexFrequency: 0,
      replayRelief: 0,
    },
  };

  constructor(options?: MetaEngineOptions) {
    this.maxHistory = options?.maxHistory ?? 100;
  }

  evaluate(context: MetaContext): MetaState {
    const observation = this.buildObservation(context);
    this.state.observations = this.trim([...this.state.observations, observation]);

    const stressTrend = computeStressTrend(this.state.observations);
    const reflexFrequency = computeReflexFrequency(this.state.observations);
    const emotionVolatility = context.emotion?.current.volatility ?? 0;
    const anomalies = this.detectAnomalies(context, stressTrend, reflexFrequency, emotionVolatility);
    const coherence = this.computeCoherence(
      context.homeostasis,
      reflexFrequency,
      observation.replayRelief,
      anomalies.length,
      emotionVolatility,
      context.social?.summary.fieldResonance.dissonance,
      context.plasticity?.volatility ?? 0,
    );
    const adaptationPhase = this.resolveAdaptationPhase(stressTrend, observation.replayRelief, context.homeostasis.stressScore);

    this.state.summary = {
      coherence,
      stressTrend,
      adaptationPhase,
      dominantIntent: context.intent.mode,
      anomalies,
      lastUpdated: observation.ts,
      reflexFrequency,
      replayRelief: observation.replayRelief,
    };

    return this.state;
  }

  getState(): MetaState {
    return this.state;
  }

  clear(): void {
    this.state = {
      observations: [],
      summary: {
        coherence: 1,
        stressTrend: 'stable',
        adaptationPhase: 'steady-state',
        dominantIntent: 'CALM',
        anomalies: [],
        lastUpdated: Date.now(),
        reflexFrequency: 0,
        replayRelief: 0,
      },
    };
  }

  private buildObservation(context: MetaContext): MetaObservation {
    const replayRelief = clamp(context.replay.reliefScore || context.replay.avgIntegrationScore * 0.5);
    const sleepRestoration = clamp(context.sleep.noiseCleared / 10);
    return {
      ts: Date.now(),
      stressScore: context.homeostasis.stressScore,
      intentMode: context.intent.mode,
      reflexActions: context.reflex.lastActions.length,
      replayRelief,
      sleepRestoration,
    };
  }

  private detectAnomalies(
    context: MetaContext,
    trend: StressTrend,
    reflexFrequency: number,
    emotionVolatility: number,
  ): string[] {
    const anomalies: string[] = [];
    if (context.homeostasis.loadLevel === 'critical') {
      anomalies.push('stress.critical');
    } else if (context.homeostasis.loadLevel === 'high') {
      anomalies.push('stress.high');
    }

    if (trend === 'rising') {
      anomalies.push('trend.rising');
    }

    if (reflexFrequency > 1.5) {
      anomalies.push('reflex.frequency');
    }

    const lastReflex = context.reflex.lastActions[context.reflex.lastActions.length - 1];
    if (lastReflex?.severity === 'critical') {
      anomalies.push('reflex.critical');
    }

    if (context.replay.reliefScore < 0.1) {
      anomalies.push('replay.lowRelief');
    }

    if (context.sleep.noiseCleared < 1 && Date.now() - context.sleep.lastSleep < 60 * 60 * 1000) {
      anomalies.push('sleep.lowRecovery');
    }

    if (context.intent.mode === 'DEGRADED' || context.intent.mode === 'CRITICAL') {
      anomalies.push('intent.degraded');
    }

    if ((context.transmutation?.signalStrength ?? 0) < 0.1) {
      anomalies.push('transmutation.weakSignal');
    }

    if (emotionVolatility > 0.6) {
      anomalies.push('emotion.volatility');
    }

    if (context.emotion?.current.state === 'overloadProtect') {
      anomalies.push('emotion.protective');
    }

    if (context.social?.summary.fieldResonance.status === 'overloaded') {
      anomalies.push('social.overloaded');
    } else if (context.social?.summary.fieldResonance.status === 'charged') {
      anomalies.push('social.charged');
    }

    if ((context.plasticity?.volatility ?? 0) > 0.35) {
      anomalies.push('plasticity.volatility');
    }

    return anomalies;
  }

  private computeCoherence(
    homeostasis: HomeostasisState,
    reflexFrequency: number,
    replayRelief: number,
    anomalies: number,
    emotionVolatility: number,
    fieldDissonance = 0,
    plasticityVolatility = 0,
  ): number {
    const stressPenalty = homeostasis.stressScore * 0.5;
    const reflexPenalty = clamp(reflexFrequency * 0.1, 0, 0.3);
    const reliefBonus = replayRelief * 0.2;
    const anomalyPenalty = clamp(anomalies * 0.05, 0, 0.4);
    const emotionPenalty = clamp(emotionVolatility * 0.15, 0, 0.25);
    const socialPenalty = clamp(fieldDissonance * 0.2, 0, 0.25);
    const plasticityPenalty = clamp((homeostasis.stressScore * plasticityVolatility) * 0.15, 0, 0.2);
    const raw =
      1 - stressPenalty - reflexPenalty - anomalyPenalty - emotionPenalty - socialPenalty - plasticityPenalty + reliefBonus;
    return clamp(raw);
  }

  private resolveAdaptationPhase(trend: StressTrend, relief: number, stressScore: number): AdaptationPhase {
    if (trend === 'rising' || stressScore > 0.8) {
      return 'escalation';
    }
    if (trend === 'falling' || relief > 0.3 || stressScore < 0.3) {
      return 'recovery';
    }
    return 'steady-state';
  }

  private trim<T>(items: T[]): T[] {
    if (items.length <= this.maxHistory) return items;
    return items.slice(items.length - this.maxHistory);
  }
}
