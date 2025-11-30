import type { DecisionInputs } from "./DecisionInputs";
import type { ScoredResonantCandidate } from "./ResonantStateTransitionEngine";

export type RiskBand = "low" | "medium" | "high";

export interface DecisionEnvelope {
  chosenCandidateId: string;
  mode: string;
  intensity: number;
  resonanceScore: number;
  riskBand: RiskBand;
  alignment: {
    inner: number;
    social: number;
    cosmic: number;
  };
  reasoning: {
    flowAlignment: number;
    contextPressure: string;
    phaseState: string;
    luckWindowOpen: boolean;
  };
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const computeRiskBand = (entropy: number, resonance: number): RiskBand => {
  if (entropy < 0.2 || resonance > 0.75) return "low";
  if (entropy < 0.4) return "medium";
  return "high";
};

export const buildDecisionEnvelope = (
  inputs: DecisionInputs,
  scored: ScoredResonantCandidate[]
): DecisionEnvelope => {
  const sorted = [...scored].sort((a, b) => b.resonanceScore - a.resonanceScore);
  const best = sorted[0];

  const riskBand = computeRiskBand(best.entropyCost, best.resonanceScore);

  const { innerAlignment, socialAlignment, cosmicAlignment } = inputs.flow;

  return {
    chosenCandidateId: best.id,
    mode: best.mode,
    intensity: clamp01(best.intensity),
    resonanceScore: best.resonanceScore,
    riskBand,
    alignment: {
      inner: innerAlignment,
      social: socialAlignment,
      cosmic: cosmicAlignment,
    },
    reasoning: {
      flowAlignment: best.flowAlignment,
      contextPressure: `${inputs.context.pressureType}:${inputs.context.pressureIntensity.toFixed(2)}`,
      phaseState: inputs.phase.state,
      luckWindowOpen: inputs.flow.luckWindowOpen,
    },
  };
};
