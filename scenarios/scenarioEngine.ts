import { ScenarioContext, ScenarioResult, ScenarioRule } from './types';

export class ScenarioEngine {
  private readonly rules: ScenarioRule[];
  private lastResults: ScenarioResult[] = [];

  constructor(rules: ScenarioRule[]) {
    this.rules = rules;
  }

  evaluate(context: ScenarioContext): ScenarioResult[] {
    const results: ScenarioResult[] = [];

    for (const rule of this.rules) {
      const matchScore = this.computeMatchScore(rule, context);
      if (matchScore <= 0) continue;
      results.push({
        ruleId: rule.id,
        recommendedMode: rule.then.recommendedMode,
        message: rule.then.message,
        score: matchScore + rule.then.priority,
      });
    }

    this.lastResults = results.sort((a, b) => b.score - a.score);
    return this.lastResults;
  }

  getSuggestions(limit = 5): ScenarioResult[] {
    return this.lastResults.slice(0, limit);
  }

  private computeMatchScore(rule: ScenarioRule, context: ScenarioContext): number {
    const modeMatches = rule.when.noosphereMode
      ? context.noosphereReport.noosphere.mode === rule.when.noosphereMode
      : true;
    if (!modeMatches) return 0;

    const supportOk =
      typeof rule.when.minSupport === 'number'
        ? context.noosphereReport.noosphere.support >= rule.when.minSupport
        : true;
    if (!supportOk) return 0;

    const tensionOk =
      typeof rule.when.maxTension === 'number'
        ? context.noosphereReport.noosphere.tension <= rule.when.maxTension
        : true;
    if (!tensionOk) return 0;

    const alignmentOk =
      rule.when.lastIntentAlignment && context.heartbeat?.intent?.fieldAlignment
        ? context.heartbeat.intent.fieldAlignment === rule.when.lastIntentAlignment
        : true;
    if (!alignmentOk) return 0;

    const coherenceBonus = context.collectiveResonance?.primaryMode === 'resonant' ? 0.5 : 0;
    const supportBonus = context.noosphereReport.noosphere.support;
    const tensionPenalty = context.noosphereReport.noosphere.tension;
    const baseline = rule.when.noosphereMode === 'high_tension' ? 0.8 : rule.when.noosphereMode ? 0.35 : 0;

    return Math.max(0, baseline + supportBonus - tensionPenalty + coherenceBonus);
  }
}
