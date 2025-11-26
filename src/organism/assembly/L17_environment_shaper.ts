import type { FuzzyEvolutionState } from '../../../core/fuzzyEvolution/types';
import type { ResonanceTuningPlan } from '../../../core/resonanceTuner/types';
import type { CivilizationState } from '../../../core/civilization/types';
import type { OntogenesisVector } from '../ontogenesis3d';

export interface L17Context {
  fuzzy: FuzzyEvolutionState | null;
  tuning: ResonanceTuningPlan | null;
  civilization: CivilizationState | null;
  lastVector: OntogenesisVector | null;
}

export interface L17Signals {
  isCandidate: boolean;
  initiativeScore: number;
  microProjectTendency: number;
  environmentShapingTension: number;
}

/**
 * Soft heuristic to estimate how much the system behaves like the L17
 * “Environment Shaper” phase. We avoid hard thresholds and instead
 * surface graded scores that upstream modules can remix.
 */
export function evaluateL17EnvironmentShaper(ctx: L17Context): L17Signals {
  const { fuzzy, tuning, civilization, lastVector } = ctx;

  const baseAssembly = lastVector?.assemblyPoint ?? 16;
  const baseSocialAge = lastVector?.socialAge ?? 16;

  const alignment = fuzzy?.pressure.alignment.high ?? 0.5;
  const tension = fuzzy?.pressure.tension.medium ?? 0.3;
  const coherence = fuzzy?.pressure.coherence.medium ?? 0.5;

  const allies = civilization?.resonance.alliesCount ?? 0;
  const opponents = civilization?.resonance.opponentsCount ?? 0;
  const neutral = civilization?.resonance.neutralCount ?? 0;
  const totalConnections = Math.max(1, allies + opponents + neutral);

  const initiativeScore =
    coherence * 0.6 +
    alignment * 0.3 -
    tension * 0.2 +
    Math.max(0, allies * 0.05);

  const microProjectTendency =
    (baseSocialAge >= 16 && baseSocialAge <= 19 ? 0.5 : 0) +
    (alignment > 0.4 ? 0.25 : 0) +
    (tuning?.mode === 'steady_growth' ? 0.2 : 0) +
    (tuning?.mode === 'careful_exploration' ? 0.1 : 0);

  const opponentPressure = opponents / totalConnections;
  const environmentShapingTension = Math.min(1, tension * 0.7 + opponentPressure * 0.3);

  const isCandidate =
    baseAssembly >= 16 &&
    baseAssembly <= 18 &&
    baseSocialAge >= 16 &&
    baseSocialAge <= 20 &&
    initiativeScore > 0.4 &&
    microProjectTendency > 0.4;

  return {
    isCandidate,
    initiativeScore,
    microProjectTendency,
    environmentShapingTension,
  };
}
