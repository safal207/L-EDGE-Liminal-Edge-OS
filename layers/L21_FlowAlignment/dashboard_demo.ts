import type { DecisionEnvelope } from "../L20_ResonantDecision/DecisionEnvelope";
import type {
  DecisionSummary,
  FlowMode,
  FlowQuality,
  L21FlowAlignmentState,
  L21FlowDashboardPayload,
  LuckTiming,
} from "./L21FlowDashboard.types";

const fallbackQuality: FlowQuality = "low";
const fallbackTiming: LuckTiming = "later";
const fallbackMode: FlowMode = "stabilize";

const summarizeDecision = (decision?: DecisionEnvelope | null): DecisionSummary | undefined => {
  if (!decision) return undefined;
  const top_candidate = decision.chosenCandidateId ?? decision.mode ?? "unknown";
  const score = typeof decision.resonanceScore === "number" ? decision.resonanceScore : 0;
  return { top_candidate, score };
};

export const buildL21FlowDashboardPayload = (
  flowState: L21FlowAlignmentState,
  decisionBefore?: DecisionEnvelope | null,
  decisionAfter?: DecisionEnvelope | null
): L21FlowDashboardPayload => {
  const luckWindow = flowState.luck_window;
  const cooperativeField = flowState.cooperative_field;
  const flowSuggestion = flowState.flow_suggestion;

  const before = summarizeDecision(decisionBefore);
  const after = summarizeDecision(decisionAfter);

  const payload: L21FlowDashboardPayload = {
    flow_alignment: {
      value: flowState.alignment.fai,
      quality: flowState.alignment.quality ?? fallbackQuality,
    },
    luck_window: {
      isOpen: luckWindow.is_open,
      openness: luckWindow.openness ?? luckWindow.strength ?? 0,
      timing: luckWindow.timing ?? (luckWindow.is_open ? "soon" : fallbackTiming),
    },
    cooperative_field: {
      score: cooperativeField.score,
      mode: cooperativeField.mode,
    },
    flow_suggestion: {
      mode: flowSuggestion.mode ?? fallbackMode,
      confidence: flowSuggestion.confidence ?? 0,
    },
    flow_explain: flowState.flow_explain ?? flowSuggestion.explain ?? [],
  };

  if (before) {
    payload.decision_before_flow = before;
  }
  if (after) {
    payload.decision_after_flow = after;
  }
  if (before && after) {
    payload.decision_delta_score = after.score - before.score;
  }

  return payload;
};

export const demoL21DashboardPayload = (): L21FlowDashboardPayload => {
  const demoFlowState: L21FlowAlignmentState = {
    alignment: {
      fai: 0.78,
      quality: "high",
    },
    luck_window: {
      is_open: true,
      openness: 0.63,
      timing: "now",
    },
    cooperative_field: {
      score: 0.71,
      mode: "team",
    },
    flow_suggestion: {
      mode: "push",
      confidence: 0.82,
      explain: [
        "высокий flow и открытое окно удачи",
        "сильное коллективное поле → режим push",
      ],
    },
    flow_explain: [
      "высокий flow и открытое окно удачи",
      "сильное коллективное поле → режим push",
    ],
  };

  return buildL21FlowDashboardPayload(demoFlowState, {
    chosenCandidateId: "Option B",
    mode: "stabilize",
    intensity: 0.5,
    resonanceScore: 0.52,
    riskBand: "medium",
    alignment: { inner: 0.5, social: 0.5, cosmic: 0.5 },
    reasoning: {
      flowMode: "stabilize",
      flowAlignment: 0.52,
      contextPressure: "support:0.10",
      phaseState: "solid",
      luckWindowOpen: true,
    },
  } as DecisionEnvelope, {
    chosenCandidateId: "Option A",
    mode: "push",
    intensity: 0.7,
    resonanceScore: 0.83,
    riskBand: "low",
    flow_alignment: { value: 0.78, quality: "high" },
    luck_window: { isOpen: true, openness: 0.63, timing: "now" },
    cooperative_field: { score: 0.71, mode: "team" },
    flow_suggestion: { mode: "push", confidence: 0.82 },
    flow_explain: demoFlowState.flow_explain,
    alignment: { inner: 0.7, social: 0.75, cosmic: 0.9 },
    reasoning: {
      flowMode: "push",
      flowAlignment: 0.83,
      contextPressure: "support:0.10",
      phaseState: "solid",
      luckWindowOpen: true,
    },
  } as DecisionEnvelope);
};

if (require.main === module) {
  const payload = demoL21DashboardPayload();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload, null, 2));
}
