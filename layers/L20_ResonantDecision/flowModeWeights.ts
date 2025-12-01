import type { DecisionMode } from "./ResonantStateCandidate";
import type { ResonanceWeights } from "./ResonantStateTransitionEngine";

export const defaultResonanceWeights = (): Required<ResonanceWeights> => ({
  coherence: 0.22,
  harmonicFit: 0.14,
  phaseAlignment: 0.12,
  contextConductivity: 0.12,
  futureSmoothness: 0.12,
  globalUtility: 0.14,
  flowAlignment: 0.1,
  entropyCost: 0.08,
});

export const adjustWeightsByFlowMode = (
  base: Required<ResonanceWeights>,
  mode: DecisionMode
): Required<ResonanceWeights> => {
  const w = { ...base };

  switch (mode) {
    case "push":
      w.flowAlignment *= 1.3;
      w.globalUtility *= 1.2;
      w.futureSmoothness *= 1.2;
      w.entropyCost *= 0.6;
      break;

    case "stabilize":
      w.phaseAlignment *= 1.3;
      w.contextConductivity *= 1.2;
      w.entropyCost *= 1.3;
      w.flowAlignment *= 0.9;
      break;

    case "slow_down":
      w.phaseAlignment *= 1.4;
      w.entropyCost *= 1.4;
      w.futureSmoothness *= 0.8;
      w.globalUtility *= 0.8;
      w.flowAlignment *= 0.9;
      break;

    case "explore":
      w.flowAlignment *= 1.2;
      w.futureSmoothness *= 1.1;
      w.entropyCost *= 0.9;
      break;

    case "pivot":
      w.harmonicFit *= 1.3;
      w.globalUtility *= 1.2;
      w.entropyCost *= 0.8;
      break;

    default:
      break;
  }

  return w;
};

export const normalizeResonanceWeights = (
  weights: ResonanceWeights = {}
): Required<ResonanceWeights> => {
  const merged = { ...defaultResonanceWeights(), ...weights } as Required<ResonanceWeights>;
  const sum =
    merged.coherence +
    merged.harmonicFit +
    merged.phaseAlignment +
    merged.contextConductivity +
    merged.futureSmoothness +
    merged.globalUtility +
    merged.flowAlignment +
    merged.entropyCost;

  if (sum === 0) return defaultResonanceWeights();

  return {
    coherence: merged.coherence / sum,
    harmonicFit: merged.harmonicFit / sum,
    phaseAlignment: merged.phaseAlignment / sum,
    contextConductivity: merged.contextConductivity / sum,
    futureSmoothness: merged.futureSmoothness / sum,
    globalUtility: merged.globalUtility / sum,
    flowAlignment: merged.flowAlignment / sum,
    entropyCost: merged.entropyCost / sum,
  };
};
