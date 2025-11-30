import { buildFlowInputs } from "./FlowInputs.js";
import { computeFlowAlignmentIndex } from "./FlowAlignmentIndex.js";
import { detectLuckWindow } from "./LuckWindowDetector.js";
import { evaluateCooperativeField } from "./CooperativeField.js";
import { buildFlowSuggestion } from "./FlowSuggestion.js";

/**
 * L21 — Flow Alignment Layer (Axis-F)
 * Сенсор удачи / танцованности / выравнивания с полем
 */
export function L21_FlowAlignment(innerState, contextState, phaseState, collectiveState = null) {
  const inputs = buildFlowInputs(innerState, contextState, phaseState, collectiveState);

  const alignment = computeFlowAlignmentIndex(inputs);
  const luckWindow = detectLuckWindow(inputs, alignment);
  const cooperativeField = evaluateCooperativeField(inputs, collectiveState);
  const flowSuggestion = buildFlowSuggestion(inputs, alignment, luckWindow, cooperativeField);

  return {
    inputs,
    alignment,
    luck_window: luckWindow,
    cooperative_field: cooperativeField,
    flow_suggestion: flowSuggestion
  };
}
