import type {
  FluidRegionState,
  InformationalFluidSnapshot,
} from "./L23_informational_fluid";

export interface LuckVector {
  // Вектор из L21: направление, куда "хочет" система
  focusTags: string[]; // темы, которые сейчас в приоритете
  riskAppetite: number; // 0..1 (0 - избегать риска, 1 - агрессивно)
  changeDrive: number; // 0..1 (0 - сохранять статус-кво, 1 - менять)
}

export interface TrajectoryStep {
  description: string;
  expectedDurationMs?: number;
  involvedRegions?: string[]; // какие регионы L23 затронет
  tags?: string[]; // смысловые теги шага
}

export interface TrajectoryCandidate {
  id: string;
  label: string;
  originLayer: string; // кто предложил (агент / модуль)
  steps: TrajectoryStep[];

  // Прогнозы, которые дают нижележащие слои / агенты
  predictedGain: number; // ожидаемая "выгода" 0..1
  predictedCost: number; // ожидаемая "цена" 0..1
  predictedRisk: number; // базовый риск 0..1
  timeHorizonMs?: number;
  tags?: string[];
}

export interface DecisionContext {
  goalDescription: string;
  horizonMs: number;
  hardConstraints?: string[]; // "avoid:conflict-with-user", etc
  preferredRegions?: string[]; // где лучше действовать
  forbiddenRegions?: string[];
  timestamp: number;
}

export interface TrajectoryScores {
  resonanceScore: number; // 0..1 - насколько хорошо траектория "ложится" на среду L23
  luckAlignment: number; // 0..1 - соответствие LuckVector
  environmentRisk: number; // 0..1 - насколько среда "нестабильна" для этой траектории
  structuralRisk: number; // 0..1 - риск по внутренней структуре шага
  combinedScore: number; // итоговая свёртка
}

export interface TrajectoryDecision {
  chosen: TrajectoryCandidate | null;
  ranked: Array<{ trajectory: TrajectoryCandidate; scores: TrajectoryScores }>;
  context: DecisionContext;
  reasonSummary: string;
}

export interface TrajectoryHarmonizerConfig {
  weightResonance: number; // вес резонанса со средой
  weightLuck: number; // вес совпадения с вектором L21
  weightRisk: number; // штраф за риск
  weightGain: number; // сколько учитываем predictedGain
}

export class TrajectoryHarmonizer {
  constructor(private config: TrajectoryHarmonizerConfig) {}

  decide(
    candidates: TrajectoryCandidate[],
    context: DecisionContext,
    env: InformationalFluidSnapshot,
    luck: LuckVector,
  ): TrajectoryDecision {
    const ranked = candidates
      .map((trajectory) => {
        const scores = this.scoreTrajectory(trajectory, context, env, luck);
        return { trajectory, scores };
      })
      .sort((a, b) => b.scores.combinedScore - a.scores.combinedScore);

    const chosen = ranked.length > 0 ? ranked[0].trajectory : null;

    return {
      chosen,
      ranked,
      context,
      reasonSummary: this.buildReasonSummary(ranked),
    };
  }

  // 🔽 Внутренняя логика

  private scoreTrajectory(
    trajectory: TrajectoryCandidate,
    context: DecisionContext,
    env: InformationalFluidSnapshot,
    luck: LuckVector,
  ): TrajectoryScores {
    const resonanceScore = this.computeResonance(trajectory, env);
    const luckAlignment = this.computeLuckAlignment(trajectory, luck);
    const environmentRisk = this.computeEnvironmentRisk(trajectory, env);
    const structuralRisk = trajectory.predictedRisk;
    const contextPenalty = this.computeContextPenalty(trajectory, context);

    const gain = trajectory.predictedGain;
    const riskPenalty = ((environmentRisk + structuralRisk) / 2) * this.config.weightRisk;

    const combined =
      resonanceScore * this.config.weightResonance +
      luckAlignment * this.config.weightLuck +
      gain * this.config.weightGain -
      riskPenalty -
      contextPenalty;

    return {
      resonanceScore,
      luckAlignment,
      environmentRisk,
      structuralRisk,
      combinedScore: combined,
    };
  }

  private computeResonance(
    trajectory: TrajectoryCandidate,
    env: InformationalFluidSnapshot,
  ): number {
    let total = 0;
    let count = 0;

    for (const step of trajectory.steps) {
      const regions = step.involvedRegions ?? [];
      for (const regionId of regions) {
        const region: FluidRegionState | undefined = env.regions[regionId];
        if (!region) continue;
        const pattern = region.pattern;
        let score = 0.5;

        switch (pattern.phase) {
          case "fluid":
            score = 0.8;
            break;
          case "metastable":
            score = 0.6;
            break;
          case "frozen":
            score = 0.3;
            break;
          case "vapor":
            score = 0.2;
            break;
        }

        // Добавляем влияние coherence: чем более упорядочено, тем безопаснее "опираться"
        score = score * 0.7 + pattern.coherence * 0.3;

        total += score;
        count += 1;
      }
    }

    if (count === 0) return 0.5; // если нет регионов, считаем средним
    return total / count;
  }

  private computeLuckAlignment(trajectory: TrajectoryCandidate, luck: LuckVector): number {
    const trajectoryTags = new Set(trajectory.tags ?? []);
    let tagMatch = 0;

    for (const tag of luck.focusTags) {
      if (trajectoryTags.has(tag)) {
        tagMatch += 1;
      }
    }
    const tagScore = luck.focusTags.length > 0 ? tagMatch / luck.focusTags.length : 0.5;

    const riskDiff = Math.abs(trajectory.predictedRisk - luck.riskAppetite);
    const riskScore = 1 - riskDiff; // чем ближе, тем лучше

    const isChangeHeavy =
      (trajectory.timeHorizonMs ?? 0) > 0 && trajectory.predictedGain > 0.6 ? 1 : 0;
    const changeScore = 1 - Math.abs(isChangeHeavy - luck.changeDrive);

    return (tagScore + riskScore + changeScore) / 3;
  }

  private computeEnvironmentRisk(
    trajectory: TrajectoryCandidate,
    env: InformationalFluidSnapshot,
  ): number {
    let riskTotal = 0;
    let count = 0;

    for (const step of trajectory.steps) {
      const regions = step.involvedRegions ?? [];
      for (const regionId of regions) {
        const region = env.regions[regionId];
        if (!region) continue;

        const pattern = region.pattern;
        let localRisk = 0.5;

        switch (pattern.phase) {
          case "fluid":
            localRisk = 0.2;
            break;
          case "metastable":
            localRisk = 0.5;
            break;
          case "frozen":
            localRisk = 0.7;
            break;
          case "vapor":
            localRisk = 0.8;
            break;
        }

        // Чем ниже coherence, тем выше риск (хаотичная вода)
        localRisk = localRisk * 0.7 + (1 - pattern.coherence) * 0.3;

        riskTotal += localRisk;
        count += 1;
      }
    }

    if (count === 0) return 0.5;
    return riskTotal / count;
  }

  private computeContextPenalty(trajectory: TrajectoryCandidate, context: DecisionContext): number {
    const involvedRegions = new Set<string>();
    const trajectoryTags = new Set(trajectory.tags ?? []);

    for (const step of trajectory.steps) {
      for (const regionId of step.involvedRegions ?? []) {
        involvedRegions.add(regionId);
      }
      for (const tag of step.tags ?? []) {
        trajectoryTags.add(tag);
      }
    }

    let penalty = 0;

    if (context.forbiddenRegions?.some((region) => involvedRegions.has(region))) {
      penalty += 0.5;
    }

    if (context.preferredRegions && context.preferredRegions.length > 0) {
      let matches = 0;
      for (const preferred of context.preferredRegions) {
        if (involvedRegions.has(preferred)) {
          matches += 1;
        }
      }
      const coverage = matches / context.preferredRegions.length;
      penalty += (1 - coverage) * 0.3;
    }

    if (context.hardConstraints) {
      for (const constraint of context.hardConstraints) {
        if (constraint.startsWith("avoid:")) {
          const target = constraint.slice("avoid:".length);
          if (trajectoryTags.has(target)) {
            penalty += 0.4;
          }
        }
      }
    }

    return Math.min(1, penalty);
  }

  private buildReasonSummary(
    ranked: Array<{ trajectory: TrajectoryCandidate; scores: TrajectoryScores }>,
  ): string {
    if (ranked.length === 0) return "No trajectories provided.";

    const top = ranked[0];
    return [
      `Chosen trajectory: ${top.trajectory.label}`,
      `Resonance: ${(top.scores.resonanceScore * 100).toFixed(1)}%`,
      `Luck alignment: ${(top.scores.luckAlignment * 100).toFixed(1)}%`,
      `Environment risk: ${(top.scores.environmentRisk * 100).toFixed(1)}%`,
      `Combined score: ${top.scores.combinedScore.toFixed(3)}`,
    ].join(" | ");
  }
}
