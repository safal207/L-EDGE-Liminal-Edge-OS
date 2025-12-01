import type { DecisionInputs } from "./DecisionInputs";
import type { ResonantStateCandidate, DecisionMode } from "./ResonantStateCandidate";
import { defaultResonanceWeights, normalizeResonanceWeights } from "./flowModeWeights";

export interface ScoredResonantCandidate extends ResonantStateCandidate {
  coherenceScore: number;
  entropyCost: number;
  harmonicFit: number;
  phaseAlignment: number;
  contextConductivity: number;
  futurePathSmoothness: number;
  globalUtility: number;
  flowAlignment: number;
  resonanceScore: number;
}

export interface ResonanceWeights {
  coherence?: number;
  harmonicFit?: number;
  phaseAlignment?: number;
  contextConductivity?: number;
  futureSmoothness?: number;
  globalUtility?: number;
  flowAlignment?: number;
  entropyCost?: number;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const MODE_ENTROPY: Record<DecisionMode, number> = {
  stabilize: 0.15,
  explore: 0.35,
  push: 0.45,
  pivot: 0.55,
  slow_down: 0.2,
  connect: 0.25,
  rest: 0.1,
};

const computeCoherence = (candidate: ResonantStateCandidate, inputs: DecisionInputs) => {
  const meaningAnchor = (inputs.meaning.purposeAlignment + inputs.meaning.contentment) / 2;
  const finitenessTension = 1 - Math.abs(inputs.meaning.finiteness - 0.5) * 2;
  const modeFactor = candidate.mode === "pivot" ? 0.7 : 1;
  return clamp01(meaningAnchor * 0.7 + finitenessTension * 0.3) * modeFactor;
};

const computeHarmonicFit = (candidate: ResonantStateCandidate, inputs: DecisionInputs) => {
  const axisBlend =
    (inputs.flow.innerAlignment + inputs.flow.socialAlignment + inputs.flow.cosmicAlignment) / 3;
  const driftPenalty = 1 - inputs.time.drift * 0.6;
  const modeBias = candidate.mode === "connect" ? 1.05 : 1;
  return clamp01(axisBlend * driftPenalty * modeBias);
};

const computePhaseAlignment = (candidate: ResonantStateCandidate, inputs: DecisionInputs) => {
  const stability = inputs.phase.stability;
  const isFragile = inputs.phase.state === "vapor" || stability < 0.35;
  const stress = candidate.mode === "push" || candidate.mode === "pivot";
  const safety = candidate.mode === "rest" || candidate.mode === "slow_down";

  if (isFragile && stress) return clamp01(0.3 * stability);
  if (isFragile && safety) return clamp01(0.6 + stability * 0.4);
  return clamp01(0.5 + stability * 0.5);
};

const computeContextConductivity = (
  candidate: ResonantStateCandidate,
  inputs: DecisionInputs
) => {
  const { pressureType, pressureIntensity, relevance } = inputs.context;
  const pressureBlock = pressureType === "challenge" ? pressureIntensity * 0.5 : 0;
  const supportBoost = pressureType === "support" ? pressureIntensity * 0.4 : 0;
  const modeStress = candidate.mode === "push" || candidate.mode === "pivot";
  const stressPenalty = modeStress ? pressureIntensity * 0.4 : 0;

  return clamp01(0.5 + relevance * 0.3 + supportBoost - pressureBlock - stressPenalty);
};

const computeFutureSmoothness = (candidate: ResonantStateCandidate, inputs: DecisionInputs) => {
  const tmiPenalty = inputs.time.tmi * 0.4;
  const driftPenalty = inputs.time.drift * 0.3;
  const expectedDrift = candidate.expectedEffect?.deltaDrift ?? 0;
  const driftRelief = expectedDrift < 0 ? Math.abs(expectedDrift) * 2 : -expectedDrift;
  return clamp01(0.8 - tmiPenalty - driftPenalty + driftRelief);
};

const computeGlobalUtility = (candidate: ResonantStateCandidate, inputs: DecisionInputs) => {
  const relevance = inputs.context.relevance;
  const contentment = inputs.meaning.contentment;
  const base = (relevance * 0.5 + contentment * 0.5) * (candidate.basePriority ?? 1);
  const stabilityLift = candidate.expectedEffect?.deltaStability ?? 0;
  return clamp01(base + stabilityLift);
};

const computeFlowAlignment = (candidate: ResonantStateCandidate, inputs: DecisionInputs) => {
  const { fai, luckWindowOpen, luckWindowStrength } = inputs.flow;
  const luckBoost = luckWindowOpen ? 0.1 + luckWindowStrength * 0.2 : 0;
  const modeBoost = candidate.mode === "connect" ? 0.05 : 0;
  return clamp01(fai * 0.8 + luckBoost + modeBoost);
};

const computeEntropyCost = (candidate: ResonantStateCandidate): number => {
  const base = MODE_ENTROPY[candidate.mode] ?? 0.3;
  const intensity = clamp01(candidate.intensity);
  return clamp01(base * (0.8 + intensity * 0.4));
};

export const runResonantStateTransitionEngine = (
  inputs: DecisionInputs,
  candidates: ResonantStateCandidate[],
  weights: ResonanceWeights = {}
): ScoredResonantCandidate[] => {
  const w = normalizeResonanceWeights(Object.keys(weights).length ? weights : defaultResonanceWeights());

  return candidates.map((candidate) => {
    const coherenceScore = computeCoherence(candidate, inputs);
    const harmonicFit = computeHarmonicFit(candidate, inputs);
    const phaseAlignment = computePhaseAlignment(candidate, inputs);
    const contextConductivity = computeContextConductivity(candidate, inputs);
    const futurePathSmoothness = computeFutureSmoothness(candidate, inputs);
    const globalUtility = computeGlobalUtility(candidate, inputs);
    const flowAlignment = computeFlowAlignment(candidate, inputs);
    const entropyCost = computeEntropyCost(candidate);

    const resonanceScore = clamp01(
      w.coherence * coherenceScore +
        w.harmonicFit * harmonicFit +
        w.phaseAlignment * phaseAlignment +
        w.contextConductivity * contextConductivity +
        w.futureSmoothness * futurePathSmoothness +
        w.globalUtility * globalUtility +
        w.flowAlignment * flowAlignment -
        w.entropyCost * entropyCost
    );

    return {
      ...candidate,
      coherenceScore,
      harmonicFit,
      phaseAlignment,
      contextConductivity,
      futurePathSmoothness,
      globalUtility,
      flowAlignment,
      entropyCost,
      resonanceScore,
    };
  });
};
