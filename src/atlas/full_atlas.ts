import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import { BEHAVIORAL_MATRICES, selectBehavioralMatrix } from './behavior_matrices';
import { BEHAVIORAL_MODULATORS, selectBehavioralModulator } from './behavior_modulators';
import { COMPETENCE_VECTORS, selectCompetenceVector } from './competence_vectors';
import { DECISION_ARCHETYPES, selectDecisionArchetype } from './decision_archetypes';
import { ENVIRONMENTAL_DRIVERS, selectEnvironmentalDriver } from './environment_drivers';
import { GATE_LEVELS, selectGateByScore } from './gates';
import { PATH_TYPES, selectPathByScore } from './paths';
import { STABILIZATION_MODES, selectStabilizationMode } from './stabilization_modes';

export interface AtlasResult {
  gate: (typeof GATE_LEVELS)[number];
  path: (typeof PATH_TYPES)[number];
  behavior: (typeof BEHAVIORAL_MATRICES)[number];
  competence: (typeof COMPETENCE_VECTORS)[number];
  decision: (typeof DECISION_ARCHETYPES)[number];
  stabilization: (typeof STABILIZATION_MODES)[number];
  modulator: (typeof BEHAVIORAL_MODULATORS)[number];
  environment: (typeof ENVIRONMENTAL_DRIVERS)[number];
  summary: string;
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((acc, value) => acc + value, 0) / values.length;

const deriveScoresFromState = (state: OrganismSnapshot) => {
  const triAxisValues = [state.triAxis.L.value, state.triAxis.S.value, state.triAxis.C.value];
  const triAxisNourishment = [
    state.triAxis.L.nourishment,
    state.triAxis.S.nourishment,
    state.triAxis.C.nourishment,
  ];
  const triAxisPressure = [state.triAxis.L.pressure, state.triAxis.S.pressure, state.triAxis.C.pressure];

  const metabolic = state.metabolism;
  const crystal = state.crystal;
  const growth = state.growthMode;
  const external = state.externalSignals;

  const complexityScore = clamp01(
    average(triAxisValues) * 0.5 + average(triAxisPressure) * 0.3 + (state.stage ?? 0) * 0.02,
  );

  const pathScore = clamp01(
    ((growth?.mode === 'exploratory' ? 0.7 : 0.4) + (growth?.confidence ?? 0.5) + (metabolic?.stressIndex ?? 0.5)) /
      3,
  );

  const behaviorScore = clamp01(
    average(triAxisValues) * 0.4 + (metabolic?.recoveryScore ?? 0.5) * 0.3 + (crystal?.harmony.harmonyIndex ?? 0.5) * 0.3,
  );

  const competenceScore = clamp01(
    average(triAxisNourishment) * 0.5 + (1 - average(triAxisPressure)) * 0.3 + (crystal?.growth.growthMomentum ?? 0.5) * 0.2,
  );

  const decisionScore = clamp01(
    (crystal?.growth.stabilityIndex ?? 0.5) * 0.5 + (metabolic?.overloadRisk ?? 0.5) * 0.3 + (growth?.confidence ?? 0.5) * 0.2,
  );

  const stabilizationScore = clamp01((1 - (metabolic?.overloadRisk ?? 0.5)) * 0.6 + (metabolic?.recoveryScore ?? 0.5) * 0.4);

  const modulationScore = clamp01(
    (crystal?.harmony.metabolicTension ?? 0.4) * 0.4 + (growth?.confidence ?? 0.5) * 0.3 + average(triAxisPressure) * 0.3,
  );

  const environmentScore = clamp01(
    (external?.externalStress ?? 0.4) * 0.4 + (external?.externalExploration ?? 0.4) * 0.3 + (external?.externalRecovery ?? 0.4) * 0.3,
  );

  return {
    complexityScore,
    pathScore,
    behaviorScore,
    competenceScore,
    decisionScore,
    stabilizationScore,
    modulationScore,
    environmentScore,
  };
};

const buildSummary = (result: AtlasResult): string => {
  const pattern = result.behavior.pattern.join('');
  return [
    `${result.gate.label} via ${result.path.label}`,
    `${result.competence.label} · ${result.decision.label}`,
    `Behavior ${pattern} with ${result.stabilization.label.toLowerCase()}`,
    `Modulator ${result.modulator.label} in ${result.environment.label} field`,
  ].join(' | ');
};

export const computeAtlasFingerprint = (state: OrganismSnapshot): AtlasResult => {
  const scores = deriveScoresFromState(state);

  const gate = selectGateByScore(scores.complexityScore);
  const path = selectPathByScore(scores.pathScore);
  const behavior = selectBehavioralMatrix(scores.behaviorScore);
  const competence = selectCompetenceVector(scores.competenceScore);
  const decision = selectDecisionArchetype(scores.decisionScore);
  const stabilization = selectStabilizationMode(scores.stabilizationScore);
  const modulator = selectBehavioralModulator(scores.modulationScore);
  const environment = selectEnvironmentalDriver(scores.environmentScore);

  const summary = buildSummary({
    gate,
    path,
    behavior,
    competence,
    decision,
    stabilization,
    modulator,
    environment,
    summary: '',
  });

  return {
    gate,
    path,
    behavior,
    competence,
    decision,
    stabilization,
    modulator,
    environment,
    summary,
  };
};
