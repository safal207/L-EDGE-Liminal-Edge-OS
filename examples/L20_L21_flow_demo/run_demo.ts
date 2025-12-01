// @ts-nocheck
// L21 is authored in JS; the demo consumes runtime API only
import { L21_FlowAlignment } from "../../layers/L21_FlowAlignment/index.js";
import {
  buildDecisionInputs,
  buildResonantCandidates,
  runResonantStateTransitionEngine,
  buildDecisionEnvelope,
  defaultResonanceWeights,
  adjustWeightsByFlowMode,
  normalizeResonanceWeights,
} from "../../layers/L20_ResonantDecision/index.js";
import demo from "./inputs_example.json";
import type { DecisionMode } from "../../layers/L20_ResonantDecision/ResonantStateCandidate";

const normalizeInnerStateForL20 = (raw: any) => ({
  time: {
    agePhase: raw.time?.agePhase ?? raw.time?.age_phase,
    tmi: raw.time?.tmi,
    drift: raw.time?.drift,
  },
  meaning: {
    purposeAlignment: raw.meaning?.purposeAlignment ?? raw.meaning?.purpose_alignment,
    contentment: raw.meaning?.contentment,
    finiteness: raw.meaning?.finiteness,
  },
  phase: {
    state: raw.phase?.state,
    stability: raw.phase?.stability,
  },
});

const normalizeContextForL20 = (raw: any) => ({
  pressureType: raw.pressureType ?? raw.pressure_type,
  pressureIntensity: raw.pressureIntensity ?? raw.pressure_intensity,
  relevance: raw.relevance,
});

const normalizeCandidates = (candidates: any[]): any[] =>
  candidates.map((c) => ({
    id: c.id,
    mode: c.mode as DecisionMode,
    intensity: c.intensity,
    description: c.description,
    expectedEffect: {
      deltaContentment: c.expected_effect?.delta_contentment,
      deltaStability: c.expected_effect?.delta_stability,
      deltaDrift: c.expected_effect?.delta_drift,
    },
  }));

function runDemo() {
  const { innerState, contextState, collectiveState, externalCandidates } = demo;

  const phaseState = innerState.phase;
  const flowState = L21_FlowAlignment(innerState, contextState, phaseState, collectiveState);

  console.log("=== L21 Flow Alignment ===");
  console.dir(flowState, { depth: null });

  const l20Inner = normalizeInnerStateForL20(innerState);
  const l20Context = normalizeContextForL20(contextState);
  const l20Candidates = normalizeCandidates(externalCandidates);

  const inputs = buildDecisionInputs(l20Inner, l20Context, flowState);
  const candidates = buildResonantCandidates(inputs, l20Candidates);
  const flowMode = (flowState.flow_suggestion?.mode as DecisionMode) ?? "stabilize";

  const baseWeights = normalizeResonanceWeights(defaultResonanceWeights());
  const flowWeights = normalizeResonanceWeights(
    adjustWeightsByFlowMode({ ...baseWeights }, flowMode)
  );

  const scoredBefore = runResonantStateTransitionEngine(inputs, candidates, baseWeights);
  const scoredAfter = runResonantStateTransitionEngine(inputs, candidates, flowWeights);

  const decisionBefore = buildDecisionEnvelope(inputs, scoredBefore, {
    flowMode: "stabilize",
    weights: baseWeights,
  });
  const decisionAfter = buildDecisionEnvelope(inputs, scoredAfter, {
    flowMode,
    weights: flowWeights,
  });

  const result = {
    flowState,
    decision_before_flow: decisionBefore,
    decision_after_flow: decisionAfter,
    decision_delta_score: decisionAfter.resonanceScore - decisionBefore.resonanceScore,
    candidates_before_flow: scoredBefore,
    candidates_after_flow: scoredAfter,
  };

  console.log("\n=== L20 Decision with Flow Mode ===");
  console.log("Flow mode:", result.decision_after_flow.flow_suggestion?.mode);
  console.log("Chosen decision (after flow):");
  console.dir(result.decision_after_flow, { depth: null });

  console.log("\nDecision before flow adjustments:");
  console.dir(result.decision_before_flow, { depth: null });
  console.log("Decision delta (after - before):", result.decision_delta_score.toFixed(3));

  console.log("\nScored candidates (before flow):");
  result.candidates_before_flow
    .sort((a, b) => b.resonanceScore - a.resonanceScore)
    .forEach((c) => {
      console.log(`- ${c.id}: score=${c.resonanceScore.toFixed(3)} mode=${c.mode}`);
    });

  console.log("\nScored candidates (after flow):");
  result.candidates_after_flow
    .sort((a, b) => b.resonanceScore - a.resonanceScore)
    .forEach((c) => {
      console.log(`- ${c.id}: score=${c.resonanceScore.toFixed(3)} mode=${c.mode}`);
    });
}

runDemo();
