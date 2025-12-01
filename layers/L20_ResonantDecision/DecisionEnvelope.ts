import type { DecisionInputs } from "./DecisionInputs";
import type {
  ResonanceWeights,
  ScoredResonantCandidate,
} from "./ResonantStateTransitionEngine";
import type { DecisionMode } from "./ResonantStateCandidate";

export type RiskBand = "low" | "medium" | "high";

export interface DecisionEnvelope {
  chosenCandidateId: string;
  mode: string;
  intensity: number;
  resonanceScore: number;
  riskBand: RiskBand;
  flow_alignment?: {
    value: number;
    quality?: string;
  };
  luck_window?: {
    isOpen: boolean;
    openness: number;
    timing?: string;
  };
  cooperative_field?: {
    score: number;
    mode?: string;
  };
  flow_suggestion?: {
    mode: string;
    confidence?: number;
  };
  flow_explain?: string[];
  alignment: {
    inner: number;
    social: number;
    cosmic: number;
  };
  reasoning: {
    flowMode: DecisionMode;
    flowAlignment: number;
    contextPressure: string;
    phaseState: string;
    luckWindowOpen: boolean;
  };
  weights?: ResonanceWeights;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const computeRiskBand = (entropy: number, resonance: number): RiskBand => {
  if (entropy < 0.2 || resonance > 0.75) return "low";
  if (entropy < 0.4) return "medium";
  return "high";
};

export const buildDecisionEnvelope = (
  inputs: DecisionInputs,
  scored: ScoredResonantCandidate[],
  meta: { flowMode?: DecisionMode; weights?: ResonanceWeights } = {}
): DecisionEnvelope => {
  const sorted = [...scored].sort((a, b) => b.resonanceScore - a.resonanceScore);
  const best = sorted[0];

  const riskBand = computeRiskBand(best.entropyCost, best.resonanceScore);

  const { innerAlignment, socialAlignment, cosmicAlignment } = inputs.flow;
  const flowAlignmentValue = inputs.flow.fai;
  const flowQuality = inputs.flow.quality;

  return {
    chosenCandidateId: best.id,
    mode: best.mode,
    intensity: clamp01(best.intensity),
    resonanceScore: best.resonanceScore,
    riskBand,
    flow_alignment: {
      value: flowAlignmentValue,
      quality: flowQuality,
    },
    luck_window: {
      isOpen: inputs.flow.luckWindowOpen,
      openness: inputs.flow.luckWindowStrength,
      timing: inputs.flow.luckWindowTiming,
    },
    cooperative_field: {
      score: inputs.flow.cooperativeScore ?? 0,
      mode: inputs.flow.cooperativeMode,
    },
    flow_suggestion: {
      mode: meta.flowMode ?? inputs.flow.mode,
      confidence: inputs.flow.confidence,
    },
    flow_explain: inputs.flow.explain,
    alignment: {
      inner: innerAlignment,
      social: socialAlignment,
      cosmic: cosmicAlignment,
    },
    reasoning: {
      flowMode: meta.flowMode ?? inputs.flow.mode,
      flowAlignment: best.flowAlignment,
      contextPressure: `${inputs.context.pressureType}:${inputs.context.pressureIntensity.toFixed(2)}`,
      phaseState: inputs.phase.state,
      luckWindowOpen: inputs.flow.luckWindowOpen,
    },
    weights: meta.weights,
  };
};
