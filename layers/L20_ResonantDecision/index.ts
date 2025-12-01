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
import {
  adjustWeightsByFlowMode,
  defaultResonanceWeights,
  normalizeResonanceWeights,
} from "./flowModeWeights";

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
  const flowMode = flowState?.flow_suggestion?.mode ?? inputs.flow.mode;
  const baseWeights = defaultResonanceWeights();
  const adjustedWeights = adjustWeightsByFlowMode({ ...baseWeights, ...weights }, flowMode);
  const normalizedWeights = normalizeResonanceWeights(adjustedWeights);
  const scored = runResonantStateTransitionEngine(inputs, candidates, normalizedWeights);
  const decision = buildDecisionEnvelope(inputs, scored, {
    flowMode,
    weights: normalizedWeights,
  });

  return { inputs, candidates: scored, decision };
};

export * from "./DecisionInputs";
export * from "./ResonantStateCandidate";
export * from "./ResonantStateTransitionEngine";
export * from "./DecisionEnvelope";
export * from "./flowModeWeights";
