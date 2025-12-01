// L24_wave_choice_engine.ts
// Wave-Choice Engine — слой органической удачи и резонансного выбора пути

import type { FluidRegionState, InformationalFluidSnapshot } from "./L23_informational_fluid";
import type { LuckVector } from "./L24_trajectory_harmonizer";

export interface WaveOption {
  id: string;
  label: string;
  description?: string;

  predictedGain: number; // 0..1
  predictedRisk: number; // 0..1
  timeHorizonMs: number;

  targetRegions?: string[];
  tags?: string[];
}

export interface WaveContext {
  goalDescription: string;
  horizonMs?: number;

  hardConstraints?: string[];
  preferredTags?: string[];
  forbiddenTags?: string[];

  timestamp: number;
}

export interface WaveScore {
  resonanceScore: number; // 0..1
  luckAlignment: number; // 0..1
  environmentRisk: number; // 0..1
  structuralRisk: number; // 0..1
  combinedScore: number; // может быть <0 или >1
}

export interface RankedWaveOption {
  option: WaveOption;
  score: WaveScore;
}

export interface WaveDecision {
  chosen: WaveOption | null;
  ranked: RankedWaveOption[];
  context: WaveContext;
  reasonSummary: string;
}

export interface WaveChoiceConfig {
  weightResonance: number;
  weightLuck: number;
  weightRisk: number;
  weightGain: number;
  minimalAcceptableScore?: number;
}

const defaultConfig: WaveChoiceConfig = {
  weightResonance: 0.4,
  weightLuck: 0.3,
  weightRisk: 0.4,
  weightGain: 0.5,
  minimalAcceptableScore: undefined,
};

export class WaveChoiceEngine {
  private config: WaveChoiceConfig;

  constructor(config?: Partial<WaveChoiceConfig>) {
    this.config = { ...defaultConfig, ...(config || {}) } satisfies WaveChoiceConfig;
  }

  decide(
    options: WaveOption[],
    context: WaveContext,
    luck: LuckVector,
    fluid: InformationalFluidSnapshot,
  ): WaveDecision {
    if (!options || options.length === 0) {
      return {
        chosen: null,
        ranked: [],
        context,
        reasonSummary: "No options provided — nothing to decide.",
      };
    }

    const ranked = options.map((option) => {
      const score = this.scoreOption(option, context, luck, fluid);
      return { option, score };
    });

    ranked.sort((a, b) => b.score.combinedScore - a.score.combinedScore);

    const best = ranked[0];
    const chosen =
      this.config.minimalAcceptableScore !== undefined &&
      best.score.combinedScore < this.config.minimalAcceptableScore
        ? null
        : best.option;

    const reasonSummary = this.buildReasonSummary(chosen, ranked, context);

    return {
      chosen,
      ranked,
      context,
      reasonSummary,
    };
  }

  private scoreOption(
    option: WaveOption,
    context: WaveContext,
    luck: LuckVector,
    fluid: InformationalFluidSnapshot,
  ): WaveScore {
    const { environmentRisk, resonanceScore } = this.evaluateEnvironment(option, fluid);

    const luckAlignment = this.evaluateLuckAlignment(option, context, luck);

    const structuralRisk = clamp01(option.predictedRisk);

    const riskPenalty = ((environmentRisk + structuralRisk) / 2) * this.config.weightRisk;

    const combinedScore =
      resonanceScore * this.config.weightResonance +
      luckAlignment * this.config.weightLuck +
      clamp01(option.predictedGain) * this.config.weightGain -
      riskPenalty;

    return {
      resonanceScore,
      luckAlignment,
      environmentRisk,
      structuralRisk,
      combinedScore,
    };
  }

  private evaluateEnvironment(
    option: WaveOption,
    fluid: InformationalFluidSnapshot,
  ): { environmentRisk: number; resonanceScore: number } {
    const targets = option.targetRegions || [];
    if (targets.length === 0) {
      return {
        environmentRisk: 0.5,
        resonanceScore: 0.5,
      };
    }

    let riskAccum = 0;
    let resonanceAccum = 0;
    let count = 0;

    for (const regionId of targets) {
      const region = fluid.regions[regionId];
      if (!region) continue;

      const { risk, resonance } = this.evaluateRegion(region);
      riskAccum += risk;
      resonanceAccum += resonance;
      count++;
    }

    if (count === 0) {
      return {
        environmentRisk: 0.5,
        resonanceScore: 0.5,
      };
    }

    return {
      environmentRisk: clamp01(riskAccum / count),
      resonanceScore: clamp01(resonanceAccum / count),
    };
  }

  private evaluateRegion(region: FluidRegionState): {
    risk: number;
    resonance: number;
  } {
    const { phase, coherence, plasticity, inertia } = region.pattern;

    let baseRisk: number;
    let baseResonance: number;

    switch (phase) {
      case "fluid":
        baseRisk = 0.2;
        baseResonance = 0.8;
        break;
      case "metastable":
        baseRisk = 0.5;
        baseResonance = 0.6;
        break;
      case "frozen":
        baseRisk = 0.8;
        baseResonance = 0.3;
        break;
      case "vapor":
      default:
        baseRisk = 0.9;
        baseResonance = 0.2;
        break;
    }

    const structureFactor = coherence;
    const flexibility = plasticity;
    const stickiness = inertia;

    const risk = baseRisk * (0.6 + 0.4 * stickiness) * (1 - 0.3 * flexibility);

    const resonance = baseResonance * (0.7 + 0.3 * structureFactor) * (0.8 + 0.2 * flexibility);

    return {
      risk: clamp01(risk),
      resonance: clamp01(resonance),
    };
  }

  private evaluateLuckAlignment(
    option: WaveOption,
    context: WaveContext,
    luck: LuckVector,
  ): number {
    const tags = option.tags || [];
    const focus = luck.focusTags || [];
    const preferred = context.preferredTags || [];
    const forbidden = context.forbiddenTags || [];

    const tagOverlap = jaccardIndex(tags, focus);
    const preferredOverlap = jaccardIndex(tags, preferred);
    const forbiddenOverlap = jaccardIndex(tags, forbidden);

    const riskMatch = 1 - Math.abs(clamp01(option.predictedRisk) - clamp01(luck.riskAppetite));

    const horizon = option.timeHorizonMs || context.horizonMs || 0;
    const longTerm = horizon > 180 * 24 * 60 * 60 * 1000; // > 6 месяцев
    const desiredChange = clamp01(luck.changeDrive);
    const changeMatch = longTerm ? 1 - desiredChange * 0.5 : 0.5 + desiredChange * 0.5;

    let base = 0.4 * tagOverlap + 0.2 * preferredOverlap + 0.3 * riskMatch + 0.1 * changeMatch;

    base -= forbiddenOverlap * 0.5;

    return clamp01(base);
  }

  private buildReasonSummary(
    chosen: WaveOption | null,
    ranked: RankedWaveOption[],
    context: WaveContext,
  ): string {
    if (!chosen) {
      return "No option exceeded minimal acceptable score — no decision taken.";
    }

    const best = ranked[0];
    const second = ranked[1];

    let summary = `Chosen option: ${chosen.label} (score=${best.score.combinedScore.toFixed(3)}). `;

    summary += `It balances environment resonance (${best.score.resonanceScore.toFixed(2)}), alignment with will/luck (${best.score.luckAlignment.toFixed(2)}) and risk (${((best.score.environmentRisk + best.score.structuralRisk) / 2).toFixed(2)}).`;

    if (second) {
      summary += ` Next best: ${second.option.label} (score=${second.score.combinedScore.toFixed(3)}).`;
    }

    summary += ` Goal: ${context.goalDescription}.`;

    return summary;
  }
}

function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function jaccardIndex(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const v of setA) {
    if (setB.has(v)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
