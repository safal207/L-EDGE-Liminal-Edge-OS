export type OutcomeValence = "positive" | "negative" | "mixed" | "neutral";

export interface RealizedOutcome {
  id: string;
  decisionId: string;
  occurredAt: number;
  successScore: number; // 0..1 — насколько успешно завершился исход
  valence: OutcomeValence;
  predictability: number; // 0..1 — 0 значит полный сюрприз
  metrics?: Record<string, number>;
  notes?: string;
}

const realizedOutcomes: RealizedOutcome[] = [];

export function registerRealizedOutcome(outcome: RealizedOutcome): void {
  realizedOutcomes.push(outcome);
}

export function getRealizedOutcomeByDecisionId(
  decisionId: string,
): RealizedOutcome | undefined {
  return realizedOutcomes.find((entry) => entry.decisionId === decisionId);
}

export function clearRealizedOutcomes(): void {
  realizedOutcomes.length = 0;
}
