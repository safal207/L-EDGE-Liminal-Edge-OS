import { v4 as uuidv4 } from 'uuid';
import { clamp } from '../meta/patternDetector';
import {
  Episode,
  IdentityTraits,
  NarrativeArc,
  SelfModelContext,
  SelfModelEngineOptions,
  SelfModelState,
  SelfModelSummary,
} from './contracts';

const DEFAULT_TRAITS: IdentityTraits = {
  riskTaking: 0.45,
  calmRecovery: 0.55,
  patternSeeking: 0.5,
  avoidantUnderLoad: 0.45,
  socialOrientation: 0.5,
  reflexReliance: 0.45,
  exploration: 0.5,
};

const ARC_LABELS = {
  pressureSafeIntent: 'under-pressure-safe-intent',
  healingStabilizes: 'healing-stabilizes',
  reflexiveDefense: 'reflex-defense',
  fieldOverload: 'field-overload-response',
  explorationWin: 'opportunity-exploration',
};

export class SelfModelEngine {
  private readonly maxHistory: number;
  private readonly traitDecay: number;
  private state: SelfModelState;

  constructor(options?: SelfModelEngineOptions) {
    this.maxHistory = options?.maxHistory ?? 120;
    this.traitDecay = options?.traitDecay ?? 0.97;
    this.state = {
      episodes: [],
      traits: { ...DEFAULT_TRAITS },
      arcs: [],
      identitySummary: 'forming',
      lastUpdated: Date.now(),
      volatility: 0,
    } satisfies SelfModelState;
  }

  evaluate(context: SelfModelContext): SelfModelState {
    const episode = this.buildEpisode(context);
    this.state.episodes = this.trim([...this.state.episodes, episode]);
    this.state.traits = this.updateTraits(this.state.traits, episode);
    this.state.arcs = this.updateArcs(this.state.arcs, episode);
    this.state.identitySummary = this.buildIdentitySummary(this.state.traits, episode);
    this.state.volatility = this.computeVolatility(this.state.traits);
    this.state.lastUpdated = episode.timestamp;
    return this.state;
  }

  getState(): SelfModelState {
    return this.state;
  }

  getSummary(): SelfModelSummary {
    return {
      traits: this.state.traits,
      identitySummary: this.state.identitySummary,
      arcCount: this.state.arcs.length,
      lastUpdated: this.state.lastUpdated,
      volatility: this.state.volatility,
    } satisfies SelfModelSummary;
  }

  listEpisodes(limit: number): Episode[] {
    return this.state.episodes.slice(-limit).reverse();
  }

  private buildEpisode(context: SelfModelContext): Episode {
    const previous = this.state.episodes[this.state.episodes.length - 1];
    const stressDelta = previous ? context.homeostasis.stressScore - previous.context.homeostasis.stressScore : 0;
    const homeostasisScore = clamp(1 - context.homeostasis.stressScore);
    const emotionScore = clamp(context.emotion.confidence);
    const socialScore = context.social ? clamp(context.social.selfResonance.coherence) : undefined;

    return {
      id: uuidv4(),
      timestamp: Date.now(),
      context,
      intent: context.intent?.decision ?? null,
      reflexes: context.reflex?.lastActions ?? [],
      outcome: {
        stressDelta,
        homeostasisScore,
        emotionScore,
        socialScore,
      },
    } satisfies Episode;
  }

  private updateTraits(current: IdentityTraits, episode: Episode): IdentityTraits {
    const previousCalm = current.calmRecovery;
    const decayed = this.decayTraits(current);
    let traits = { ...decayed } satisfies IdentityTraits;
    const { homeostasis, perception, intent, social, interoception, plasticity } = episode.context;

    if (homeostasis.loadLevel === 'high' || homeostasis.loadLevel === 'critical') {
      traits.avoidantUnderLoad = clamp(traits.avoidantUnderLoad + 0.06);
      traits.riskTaking = clamp(traits.riskTaking - 0.04);
    }

    if (intent?.mode === 'HEALING' || intent?.decision.forceSleepSoon || intent?.decision.degradedMode) {
      traits.calmRecovery = clamp(traits.calmRecovery + 0.05);
      traits.avoidantUnderLoad = clamp(traits.avoidantUnderLoad + 0.03);
    }

    if (intent?.mode === 'FOCUSED' && episode.outcome.homeostasisScore > 0.55) {
      traits.patternSeeking = clamp(traits.patternSeeking + 0.04);
      traits.riskTaking = clamp(traits.riskTaking + 0.02);
    }

    if (episode.outcome.stressDelta < -0.05) {
      traits.calmRecovery = clamp(traits.calmRecovery + 0.03);
    }

    if (perception.opportunityScore > perception.threatScore) {
      traits.exploration = clamp(traits.exploration + 0.04);
    } else if (perception.threatScore - perception.opportunityScore > 0.1) {
      traits.exploration = clamp(traits.exploration - 0.03);
    }

    if (episode.reflexes.length > 0) {
      traits.reflexReliance = clamp(traits.reflexReliance + 0.03);
    }

    if (social) {
      if (social.selfResonance.coherence > 0.65) {
        traits.socialOrientation = clamp(traits.socialOrientation + 0.03);
      }
      if (social.fieldResonance.pressure > 0.6) {
        traits.avoidantUnderLoad = clamp(traits.avoidantUnderLoad + 0.02);
      }
    }

    if (interoception.overload > 0.6 || interoception.fatigue > 0.65) {
      traits.riskTaking = clamp(traits.riskTaking - 0.03);
      traits.calmRecovery = clamp(traits.calmRecovery + 0.02);
    }

    if (plasticity?.suggestions && plasticity.suggestions.intentBias.HEALING > 0.25) {
      const reinforced = Math.max(traits.calmRecovery, previousCalm);
      traits.calmRecovery = clamp(Math.max(reinforced + 0.15, 0.85));
      traits.patternSeeking = clamp(traits.patternSeeking - 0.01);
    }

    return traits;
  }

  private updateArcs(current: NarrativeArc[], episode: Episode): NarrativeArc[] {
    const arcLabel = this.detectArc(episode);
    if (!arcLabel) return current;
    const existing = current.find((arc) => arc.label === arcLabel);
    if (existing) {
      existing.occurrences += 1;
      existing.lastSeen = episode.timestamp;
      existing.confidence = clamp(existing.confidence + 0.05, 0, 1);
    } else {
      current.push({
        id: uuidv4(),
        label: arcLabel,
        occurrences: 1,
        lastSeen: episode.timestamp,
        confidence: 0.2,
      });
    }

    return this.trim(current);
  }

  private detectArc(episode: Episode): string | undefined {
    const { homeostasis, intent, social, perception } = episode.context;
    const stressFalling = episode.outcome.stressDelta < -0.05;

    if (homeostasis.loadLevel === 'high' || homeostasis.loadLevel === 'critical') {
      if (intent?.decision.throttleNonCritical || intent?.mode === 'HEALING') {
        return ARC_LABELS.pressureSafeIntent;
      }
      if (episode.reflexes.length) {
        return ARC_LABELS.reflexiveDefense;
      }
    }

    if (intent?.mode === 'HEALING' && stressFalling) {
      return ARC_LABELS.healingStabilizes;
    }

    if (social?.fieldResonance.status === 'overloaded') {
      return ARC_LABELS.fieldOverload;
    }

    if (perception.opportunityScore > perception.threatScore && episode.outcome.homeostasisScore > 0.55) {
      return ARC_LABELS.explorationWin;
    }

    return undefined;
  }

  private decayTraits(traits: IdentityTraits): IdentityTraits {
    const base = DEFAULT_TRAITS;
    const decay = this.traitDecay;
    return Object.entries(traits).reduce((acc, [key, value]) => {
      const baseValue = base[key as keyof IdentityTraits];
      acc[key as keyof IdentityTraits] = clamp(value * decay + baseValue * (1 - decay));
      return acc;
    }, { ...traits } as IdentityTraits);
  }

  private buildIdentitySummary(traits: IdentityTraits, episode: Episode): string {
    const focus: string[] = [];
    if (traits.calmRecovery > 0.6) focus.push('calm');
    if (traits.patternSeeking > 0.58) focus.push('pattern-oriented');
    if (traits.riskTaking < 0.35) focus.push('risk-averse');
    if (traits.riskTaking > 0.6) focus.push('risk-tolerant');
    if (traits.socialOrientation > 0.55) focus.push('social');
    if (episode.context.homeostasis.stressScore > 0.7) focus.push('under-pressure');
    return focus.join(', ') || 'forming';
  }

  private computeVolatility(traits: IdentityTraits): number {
    const values = Object.values(traits);
    if (!values.length) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / values.length;
    return clamp(Math.sqrt(variance));
  }

  private trim<T>(items: T[]): T[] {
    if (items.length <= this.maxHistory) return items;
    return items.slice(items.length - this.maxHistory);
  }
}
