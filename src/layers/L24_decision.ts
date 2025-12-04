import type { InformationalFieldState } from "./L23_informational_fluid";
import type { BreathingState } from "./L33_breathing";
import type { CorePulseSnapshot } from "./L22_core_pulse";
import type { DecisionOutcome } from "./L31_foresight_engine";

export interface FlowContext {
  informationalField?: InformationalFieldState;
  corePulse?: CorePulseSnapshot;
  breathing?: BreathingState;
}

let decisionCounter = 0;

export function createDecision(
  partial: Omit<DecisionOutcome, "id" | "createdAt"> & {
    id?: string;
    createdAt?: number;
  },
  context?: FlowContext,
): DecisionOutcome & { flowContext?: FlowContext } {
  const { id, createdAt, ...rest } = partial;
  const now = Date.now();

  return {
    id: id ?? `decision_${++decisionCounter}`,
    createdAt: createdAt ?? now,
    ...rest,
    ...(context ? { flowContext: context } : {}),
  };
}
