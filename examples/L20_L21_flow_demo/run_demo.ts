// @ts-nocheck
// L21 is authored in JS; the demo consumes runtime API only
import { L21_FlowAlignment } from "../../layers/L21_FlowAlignment/index.js";
import { L20_ResonantDecisionOrchestrator } from "../../layers/L20_ResonantDecision/index.js";
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

  const result = L20_ResonantDecisionOrchestrator(
    l20Inner,
    l20Context,
    flowState,
    l20Candidates
  );

  console.log("\n=== L20 Decision with Flow Mode ===");
  console.log("Flow mode:", result.decision.reasoning.flowMode);
  console.log("Chosen decision:");
  console.dir(result.decision, { depth: null });

  console.log("\nScored candidates:");
  result.candidates
    .sort((a, b) => b.resonanceScore - a.resonanceScore)
    .forEach((c) => {
      console.log(`- ${c.id}: score=${c.resonanceScore.toFixed(3)} mode=${c.mode}`);
    });
}

runDemo();
