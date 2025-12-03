import type { DecisionOutcome } from "./L31_foresight_engine";

let decisionCounter = 0;

export function createDecision(
  partial: Omit<DecisionOutcome, "id" | "createdAt"> & {
    id?: string;
    createdAt?: number;
  },
): DecisionOutcome {
  const { id, createdAt, ...rest } = partial;
  const now = Date.now();

  return {
    id: id ?? `decision_${++decisionCounter}`,
    createdAt: createdAt ?? now,
    ...rest,
  };
}
