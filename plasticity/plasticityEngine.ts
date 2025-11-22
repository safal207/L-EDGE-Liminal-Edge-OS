import { clamp } from '../meta/patternDetector';
import { IntentDecision } from '../intent/types';
import {
  AdaptationEpisode,
  AdaptationSuggestions,
  AdaptedIntentDecision,
  PlasticityContext,
  PlasticityEngineOptions,
  PlasticityState,
} from './contracts';

const DEFAULT_SUGGESTIONS: AdaptationSuggestions = {
  stressSensitivity: 1,
  reflexPriorityBias: 0,
  intentBias: { HEALING: 0, FOCUSED: 0, DEGRADED: 0 },
  perceptionNoiseTolerance: 0.1,
  notes: [],
};

const STRESS_FLOOR = 0.7;

export class PlasticityEngine {
  private readonly maxHistory: number;
  private state: PlasticityState;
  private lastContext?: PlasticityContext;

  constructor(options?: PlasticityEngineOptions) {
    this.maxHistory = options?.maxHistory ?? 120;
    this.state = {
      episodes: [],
      suggestions: { ...DEFAULT_SUGGESTIONS },
      status: 'stable',
      lastUpdated: Date.now(),
      volatility: 0,
    };
  }

  evaluate(context: PlasticityContext): PlasticityState {
    if (this.lastContext) {
      const episode = this.buildEpisode(this.lastContext, context);
      this.state.episodes = this.trim([...this.state.episodes, episode]);
      this.state.suggestions = this.updateSuggestions(this.state.suggestions, episode);
      this.state.volatility = this.computeVolatility(this.state.episodes);
      this.state.status = this.state.episodes.length > 1 ? 'learning' : 'stable';
      this.state.lastUpdated = episode.ts;
    }

    this.lastContext = context;
    return this.state;
  }

  getState(): PlasticityState {
    return this.state;
  }

  listEpisodes(limit: number): AdaptationEpisode[] {
    return this.state.episodes.slice(-limit).reverse();
  }

  adaptIntentDecision(decision: IntentDecision): AdaptedIntentDecision {
    const appliedNotes: string[] = [];
    let adaptedDecision = { ...decision } satisfies IntentDecision;
    const { intentBias, reflexPriorityBias } = this.state.suggestions;

    if (intentBias.HEALING > 0.25) {
      adaptedDecision = {
        ...adaptedDecision,
        forceSleepSoon: true,
        throttleNonCritical: true,
        allowHeavyTasks: false,
      };
      appliedNotes.push('healing-priority');
    }

    if (intentBias.DEGRADED > 0.25) {
      adaptedDecision = {
        ...adaptedDecision,
        degradedMode: true,
        throttleNonCritical: true,
      };
      appliedNotes.push('degraded-guard');
    }

    if (reflexPriorityBias > 0.15) {
      adaptedDecision = {
        ...adaptedDecision,
        boostTransmutation: true,
        throttleNonCritical: true,
      };
      appliedNotes.push('reflex-reinforce');
    }

    return {
      decision: adaptedDecision,
      adapted: appliedNotes.length > 0,
      appliedBias: appliedNotes.join(','),
    } satisfies AdaptedIntentDecision;
  }

  clear(): void {
    this.state = {
      episodes: [],
      suggestions: { ...DEFAULT_SUGGESTIONS },
      status: 'stable',
      lastUpdated: Date.now(),
      volatility: 0,
    };
    this.lastContext = undefined;
  }

  private buildEpisode(prev: PlasticityContext, next: PlasticityContext): AdaptationEpisode {
    const stressBefore = clamp(prev.homeostasis.stressScore);
    const stressAfter = clamp(next.homeostasis.stressScore);
    const reflexDelta = next.reflex.lastActions.length - prev.reflex.lastActions.length;
    const stressDelta = stressBefore - stressAfter;
    const outcome = clamp(0.5 + stressDelta * 0.8 + (next.emotion?.current.confidence ?? 0) * 0.05 - (next.social?.summary.fieldResonance.pressure ?? 0) * 0.1);

    let note: string | undefined;
    if (stressAfter > stressBefore && reflexDelta <= 0) {
      note = 'stress-persist';
    } else if (reflexDelta > 0 && stressDelta > 0) {
      note = 'reflex-helpful';
    }

    return {
      ts: Date.now(),
      stressBefore,
      stressAfter,
      reflexDelta,
      intentMode: next.intent.mode,
      emotionState: next.emotion?.current.state,
      socialCoherence: next.social?.summary.selfResonance.score,
      outcome,
      note,
    } satisfies AdaptationEpisode;
  }

  private updateSuggestions(current: AdaptationSuggestions, episode: AdaptationEpisode): AdaptationSuggestions {
    const suggestions = { ...current, notes: [...current.notes] } satisfies AdaptationSuggestions;

    if (episode.stressAfter > STRESS_FLOOR && episode.outcome < 0.05) {
      suggestions.stressSensitivity = clamp(suggestions.stressSensitivity - 0.05, 0.7, 1.25);
      suggestions.intentBias.HEALING = clamp(suggestions.intentBias.HEALING + 0.05, 0, 0.6);
      suggestions.notes.push('reduced-stress-sensitivity');
    }

    if (episode.reflexDelta > 0 && episode.outcome > 0.05) {
      suggestions.reflexPriorityBias = clamp(suggestions.reflexPriorityBias + 0.05, -0.3, 0.5);
      suggestions.notes.push('reinforce-reflex');
    }

    if (episode.intentMode === 'HEALING' && episode.outcome > 0.05) {
      suggestions.intentBias.HEALING = clamp(suggestions.intentBias.HEALING + 0.03, 0, 0.6);
    }

    if (episode.intentMode === 'FOCUSED' && episode.outcome < 0.02) {
      suggestions.intentBias.FOCUSED = clamp(suggestions.intentBias.FOCUSED - 0.03, -0.4, 0.4);
    }

    if (episode.intentMode === 'DEGRADED' && episode.outcome > 0.08) {
      suggestions.intentBias.DEGRADED = clamp(suggestions.intentBias.DEGRADED + 0.04, 0, 0.5);
    }

    if (episode.outcome < 0.02 && episode.reflexDelta <= 0) {
      suggestions.perceptionNoiseTolerance = clamp(suggestions.perceptionNoiseTolerance + 0.05, 0.05, 0.6);
      suggestions.notes.push('raise-noise-tolerance');
    }

    suggestions.notes = this.trimNotes(suggestions.notes);
    return suggestions;
  }

  private computeVolatility(episodes: AdaptationEpisode[]): number {
    if (episodes.length < 2) return 0;
    const stresses = episodes.map((ep) => ep.stressAfter);
    const mean = stresses.reduce((acc, value) => acc + value, 0) / stresses.length;
    const variance = stresses.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / stresses.length;
    return clamp(Math.sqrt(variance));
  }

  private trim<T>(items: T[]): T[] {
    if (items.length <= this.maxHistory) return items;
    return items.slice(items.length - this.maxHistory);
  }

  private trimNotes(notes: string[], maxNotes = 10): string[] {
    if (notes.length <= maxNotes) return notes.slice(-maxNotes);
    return notes.slice(notes.length - maxNotes);
  }
}
