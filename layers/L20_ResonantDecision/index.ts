import {
  buildDecisionInputs,
  type DecisionInputs,
  type InnerStateInput,
  type ContextStateInput,
  type FlowStateInput,
} from "./DecisionInputs";
import {
  buildResonantCandidates,
  type ResonantStateCandidate,
} from "./ResonantStateCandidate";
import {
  runResonantStateTransitionEngine,
  type ScoredResonantCandidate,
  type ResonanceWeights,
} from "./ResonantStateTransitionEngine";
import { buildDecisionEnvelope, type DecisionEnvelope } from "./DecisionEnvelope";

export interface ResonantDecisionOutput {
  inputs: DecisionInputs;
  candidates: ScoredResonantCandidate[];
  decision: DecisionEnvelope;
}

/**
 * L20 — Harmonized Decision Orchestrator
 */
export const L20_ResonantDecisionOrchestrator = (
  innerState: InnerStateInput = {},
  contextState: ContextStateInput = {},
  flowState: FlowStateInput = {},
  externalCandidates: Partial<ResonantStateCandidate>[] = [],
  weights: ResonanceWeights = {}
): ResonantDecisionOutput => {
  const inputs = buildDecisionInputs(innerState, contextState, flowState);
  const candidates = buildResonantCandidates(inputs, externalCandidates);
  const scored = runResonantStateTransitionEngine(inputs, candidates, weights);
  const decision = buildDecisionEnvelope(inputs, scored);

  return { inputs, candidates: scored, decision };
};

export * from "./DecisionInputs";
export * from "./ResonantStateCandidate";
export * from "./ResonantStateTransitionEngine";
export * from "./DecisionEnvelope";
