import { clamp } from '../meta/patternDetector';
import { SelfModelSummary } from '../self/contracts';
import {
  CollectiveResonanceContext,
  CollectiveResonanceMatch,
  CollectiveResonanceOptions,
  CollectiveResonanceSnapshot,
  CollectiveResonanceState,
  CollectiveTemplate,
  CollectiveTemplateKind,
} from './collectiveContracts';
import { defaultCollectiveTemplates } from './templates';

const buildSelfTags = (self: SelfModelSummary): string[] => {
  const { traits } = self;
  const tags: string[] = [];
  if (traits.riskTaking > 0.6) tags.push('risk-taker');
  if (traits.riskTaking < 0.35) tags.push('risk-averse');
  if (traits.calmRecovery > 0.55) tags.push('calm');
  if (traits.patternSeeking > 0.55) tags.push('pattern-seeker');
  if (traits.socialOrientation > 0.55) tags.push('social');
  if (traits.reflexReliance > 0.55) tags.push('reactive');
  if (traits.exploration > 0.55) tags.push('explorer');
  if (traits.avoidantUnderLoad > 0.55) tags.push('avoidant');
  return tags;
};

export class CollectiveResonanceEngine {
  private readonly templates: CollectiveTemplate[];
  private readonly maxHistory: number;
  private readonly volatilityWindow: number;
  private readonly matchThreshold: number;
  private state: CollectiveResonanceState;

  constructor(templates: CollectiveTemplate[] = defaultCollectiveTemplates, options?: CollectiveResonanceOptions) {
    this.templates = templates;
    this.maxHistory = options?.historyLimit ?? 60;
    this.volatilityWindow = options?.volatilityWindow ?? 8;
    this.matchThreshold = options?.matchThreshold ?? 0.3;
    const baseline = this.buildSnapshotFromMatches([]);
    this.state = { snapshot: baseline, history: [] };
  }

  evaluate(context: CollectiveResonanceContext): CollectiveResonanceSnapshot {
    const matches = this.scoreTemplates(context.self, context);
    const snapshot = this.buildSnapshotFromMatches(matches);
    this.state = {
      snapshot,
      history: this.trimHistory([...this.state.history, ...matches.filter((match) => match.score >= this.matchThreshold)]),
    };
    return snapshot;
  }

  getSnapshot(): CollectiveResonanceSnapshot {
    return this.state.snapshot;
  }

  listHistory(limit = 30): CollectiveResonanceMatch[] {
    return this.state.history.slice(-limit).reverse();
  }

  clear(): void {
    const baseline = this.buildSnapshotFromMatches([]);
    this.state = { snapshot: baseline, history: [] };
  }

  private scoreTemplates(self: SelfModelSummary, context: CollectiveResonanceContext): CollectiveResonanceMatch[] {
    const selfTags = buildSelfTags(self);
    return this.templates.map((template) => {
      const matchedTags = template.tags.filter((tag) => selfTags.includes(tag));
      const baseTagScore = matchedTags.length / Math.max(1, template.tags.length);
      const emotionOverlap = this.computeEmotionOverlap(template, context);
      const traitScore = this.computeTraitScore(template, self);
      const score = clamp(baseTagScore * 0.6 + emotionOverlap * 0.25 + traitScore * 0.15);
      return {
        templateId: template.id,
        kind: template.kind,
        score,
        matchedTags,
        dominantEmotionOverlap: emotionOverlap,
        timestamp: Date.now(),
      } satisfies CollectiveResonanceMatch;
    });
  }

  private computeEmotionOverlap(template: CollectiveTemplate, context: CollectiveResonanceContext): number {
    if (!template.dominantEmotions?.length || !context.emotion) return 0;
    const emotionState = context.emotion.state.toLowerCase();
    const normalizedDominants = template.dominantEmotions.map((e) => e.toLowerCase());
    const overlaps = normalizedDominants.filter((emo) => emotionState.includes(emo)).length;
    return clamp(overlaps / normalizedDominants.length);
  }

  private computeTraitScore(template: CollectiveTemplate, self: SelfModelSummary): number {
    if (!template.traits) return 0;
    const entries = Object.entries(template.traits);
    if (!entries.length) return 0;
    const diffs = entries.map(([trait, target]) => {
      const value = self.traits[trait as keyof typeof self.traits] ?? 0.5;
      return 1 - Math.abs(value - target);
    });
    return clamp(diffs.reduce((acc, v) => acc + v, 0) / entries.length);
  }

  private buildSnapshotFromMatches(matches: CollectiveResonanceMatch[]): CollectiveResonanceSnapshot {
    const topMirrors = this.pickTop(matches, 'mirror');
    const topEchoes = this.pickTop(matches, 'echo');
    const topSeeds = this.pickTop(matches, 'seed');
    const volatility = this.computeVolatility([...topMirrors, ...topEchoes, ...topSeeds]);
    const primaryMode = this.resolvePrimaryMode([...topMirrors, ...topEchoes, ...topSeeds]);

    return {
      primaryMode,
      topMirrors,
      topEchoes,
      topSeeds,
      volatility,
      lastUpdated: Date.now(),
    } satisfies CollectiveResonanceSnapshot;
  }

  private pickTop(matches: CollectiveResonanceMatch[], kind: CollectiveTemplateKind): CollectiveResonanceMatch[] {
    return matches
      .filter((match) => match.kind === kind && match.score >= this.matchThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  private computeVolatility(matches: CollectiveResonanceMatch[]): number {
    const history = [...(this.state?.history ?? []), ...matches].slice(-(this.volatilityWindow * 2));
    const topScores = history
      .filter((match) => match.score >= this.matchThreshold)
      .slice(-this.volatilityWindow)
      .map((match) => match.score);
    if (topScores.length < 2) return 0;
    const mean = topScores.reduce((sum, v) => sum + v, 0) / topScores.length;
    const variance = topScores.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / topScores.length;
    return clamp(Math.sqrt(variance));
  }

  private resolvePrimaryMode(matches: CollectiveResonanceMatch[]): CollectiveResonanceSnapshot['primaryMode'] {
    const highest = matches.sort((a, b) => b.score - a.score)[0];
    if (!highest || highest.score < this.matchThreshold) return 'isolated';

    const history = this.state?.history?.slice(-5) ?? [];
    const stableCount = history.filter((match) => match.templateId === highest.templateId).length;
    if (stableCount >= 3) return 'resonant';

    const distinctTop = new Set(history.map((match) => match.templateId));
    return distinctTop.size > 3 ? 'fragmented' : 'resonant';
  }

  private trimHistory(history: CollectiveResonanceMatch[]): CollectiveResonanceMatch[] {
    if (history.length <= this.maxHistory) return history;
    return history.slice(history.length - this.maxHistory);
  }
}

