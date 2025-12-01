import { buildFlowInputs } from "./FlowInputs.js";
import { computeFlowAlignmentIndex } from "./FlowAlignmentIndex.js";
import { detectLuckWindow } from "./LuckWindowDetector.js";
import { evaluateCooperativeField } from "./CooperativeField.js";
import { buildFlowSuggestion } from "./FlowSuggestion.js";
import { defaultL21FlowConfig } from "./L21_config.js";

/**
 * L21 — Flow Alignment Layer (Axis-F)
 * Сенсор удачи / танцованности / выравнивания с полем
 */
export function L21_FlowAlignment(
  innerState,
  contextState,
  phaseState,
  collectiveState = null,
  config = defaultL21FlowConfig
) {
  const inputs = buildFlowInputs(innerState, contextState, phaseState, collectiveState);

  const alignment = computeFlowAlignmentIndex(inputs, config);
  const luckWindow = detectLuckWindow(inputs, alignment, config);
  const cooperativeField = evaluateCooperativeField(inputs, collectiveState);
  const flowSuggestion = buildFlowSuggestion(inputs, alignment, luckWindow, cooperativeField, config);

  return {
    inputs,
    alignment,
    luck_window: luckWindow,
    cooperative_field: cooperativeField,
    flow_suggestion: flowSuggestion,
    flow_explain: flowSuggestion.explain
  };
}

export { defaultL21FlowConfig } from "./L21_config.js";
