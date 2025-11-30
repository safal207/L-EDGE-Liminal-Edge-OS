import type { DecisionInputs } from "./DecisionInputs";

export type DecisionMode =
  | "stabilize"
  | "explore"
  | "push"
  | "pivot"
  | "slow_down"
  | "connect"
  | "rest";

export interface CandidateEffect {
  deltaContentment?: number;
  deltaStability?: number;
  deltaDrift?: number;
}

export interface ResonantStateCandidate {
  id: string;
  mode: DecisionMode;
  intensity: number; // 0..1
  description?: string;
  expectedEffect?: CandidateEffect;
  origin?: "auto" | "external";
  basePriority?: number;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const DEFAULT_CANDIDATES: Array<
  Omit<ResonantStateCandidate, "id"> & { id: string }
> = [
  {
    id: "stabilize_now",
    mode: "stabilize",
    intensity: 0.6,
    description: "Сохранить устойчивость и выровнять дрейф.",
    expectedEffect: { deltaStability: 0.15, deltaDrift: -0.05 },
    origin: "auto",
  },
  {
    id: "explore_softly",
    mode: "explore",
    intensity: 0.4,
    description: "Мягкая разведка новых траекторий.",
    expectedEffect: { deltaContentment: 0.08, deltaDrift: 0.02 },
    origin: "auto",
  },
  {
    id: "rest_and_integrate",
    mode: "rest",
    intensity: 0.5,
    description: "Восстановление и интеграция опыта.",
    expectedEffect: { deltaStability: 0.1, deltaDrift: -0.04 },
    origin: "auto",
  },
];

const normalizeIntensity = (candidate: ResonantStateCandidate): ResonantStateCandidate => ({
  ...candidate,
  intensity: clamp01(candidate.intensity ?? 0.5),
});

const enrichWithDefaults = (
  inputs: DecisionInputs,
  candidates: ResonantStateCandidate[]
): ResonantStateCandidate[] => {
  if (candidates.length > 0) return candidates.map(normalizeIntensity);

  const suggested: ResonantStateCandidate[] = DEFAULT_CANDIDATES.map((c) => {
    const pressureBoost = inputs.context.pressureIntensity > 0.7 ? 0.1 : 0;
    const stabilityGuard = inputs.phase.stability < 0.4 ? -0.1 : 0;
    const intensity = clamp01(c.intensity + pressureBoost + stabilityGuard);
    return normalizeIntensity({ ...c, intensity });
  });

  return suggested;
};

export const buildResonantCandidates = (
  inputs: DecisionInputs,
  externalCandidates: Partial<ResonantStateCandidate>[] = []
): ResonantStateCandidate[] => {
  const cleaned = externalCandidates
    .filter((c) => c.id && c.mode)
    .map((c) =>
      normalizeIntensity({
        id: c.id as string,
        mode: c.mode as DecisionMode,
        intensity: c.intensity ?? 0.5,
        description: c.description,
        expectedEffect: c.expectedEffect,
        origin: c.origin ?? "external",
        basePriority: c.basePriority,
      })
    );

  return enrichWithDefaults(inputs, cleaned);
};
