export type DecisionFlow = 'deterministic' | 'probabilistic' | 'multi-branch';

export interface DecisionArchetype {
  id: number;
  label: string;
  decisionFlow: DecisionFlow;
}

const flows: DecisionFlow[] = ['deterministic', 'probabilistic', 'multi-branch'];

export const DECISION_ARCHETYPES: DecisionArchetype[] = Array.from({ length: 78 }, (_, index) => {
  const id = index + 1;
  const decisionFlow = flows[index % flows.length];
  return {
    id,
    label: `Decision-${id.toString().padStart(2, '0')}`,
    decisionFlow,
  };
});

export const selectDecisionArchetype = (score: number): DecisionArchetype => {
  const clamped = Math.min(1, Math.max(0, score));
  const index = Math.min(DECISION_ARCHETYPES.length - 1, Math.round(clamped * (DECISION_ARCHETYPES.length - 1)));
  return DECISION_ARCHETYPES[index];
};
