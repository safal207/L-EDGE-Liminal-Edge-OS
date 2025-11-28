import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import type { ExternalSignalsAggregate } from '@/nerve/L12_external_signals_types';
import type { ActionIntent, ResponseFrame } from '@/nerve/L13_response_types';
import { v4 as uuidv4 } from 'uuid';

export interface ResponseContextInputs {
  snapshot: OrganismSnapshot;
  external?: ExternalSignalsAggregate;
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const buildThrottleIntents = (
  overloadRisk: number,
  externalStress: number,
): ActionIntent[] => {
  if (overloadRisk <= 0.7 && !(overloadRisk > 0.7 || externalStress > 0.4)) return [];

  const highRisk = overloadRisk > 0.85;
  const intents: ActionIntent[] = [
    {
      id: uuidv4(),
      scope: 'system',
      kind: 'throttle',
      urgency: highRisk ? 'critical' : 'high',
      strength: 'hard_limit',
      confidence: clamp01(0.7 + overloadRisk * 0.3),
      reasonKey: 'overload_risk',
      params: {
        max_load_factor: 0.6,
      },
      ttlMs: 5000,
    },
    {
      id: uuidv4(),
      scope: 'network',
      kind: 'pause_non_critical',
      urgency: 'high',
      strength: 'strong_recommendation',
      confidence: 0.75,
      reasonKey: 'overload_risk',
      ttlMs: 5000,
    },
  ];

  return intents;
};

const buildRecoveryIntents = (
  growthMode: string,
  recoveryScore: number,
  growthConfidence: number,
): ActionIntent[] => {
  if (growthMode !== 'therapeutic' || recoveryScore >= 0.6) return [];

  return [
    {
      id: uuidv4(),
      scope: 'scheduling',
      kind: 'enter_recovery_mode',
      urgency: 'normal',
      strength: 'strong_recommendation',
      confidence: growthConfidence,
      reasonKey: 'deep_recovery_needed',
      params: { allow_only_essential: true },
      ttlMs: 15000,
    },
  ];
};

const buildExplorationIntents = (
  growthMode: string,
  harmonyIndex: number,
  stabilityIndex: number,
  overloadRisk: number,
  externalExploration: number,
): ActionIntent[] => {
  if (
    growthMode !== 'exploratory' ||
    harmonyIndex <= 0.6 ||
    stabilityIndex <= 0.5 ||
    overloadRisk >= 0.4 ||
    externalExploration <= 0.3
  ) {
    return [];
  }

  return [
    {
      id: uuidv4(),
      scope: 'llm_runtime',
      kind: 'open_exploration_window',
      urgency: 'normal',
      strength: 'soft_recommendation',
      confidence: clamp01(0.5 + externalExploration * 0.4),
      reasonKey: 'good_growth_window',
      params: { max_parallel_experiments: 3 },
      ttlMs: 20000,
    },
  ];
};

const buildStabilizingIntent = (
  overloadRisk: number,
  harmonyIndex: number,
  stabilityIndex: number,
  growthMode: string,
): ActionIntent[] => {
  if (!(overloadRisk < 0.5 && harmonyIndex < 0.6 && stabilityIndex < 0.6 && growthMode === 'stabilizing')) {
    return [];
  }

  return [
    {
      id: uuidv4(),
      scope: 'system',
      kind: 'stabilize',
      urgency: 'normal',
      strength: 'soft_recommendation',
      confidence: 0.65,
      reasonKey: 'need_stability',
      ttlMs: 10000,
    },
  ];
};

export const computeResponseFrame = (
  { snapshot, external }: ResponseContextInputs,
  now: number = Date.now(),
): ResponseFrame => {
  const metabolism = snapshot.metabolism;
  const crystal = snapshot.crystal;
  const growth = snapshot.growthMode;

  const overloadRisk = metabolism?.overloadRisk ?? 0;
  const stressIndex = metabolism?.stressIndex ?? 0.5;
  const recoveryScore = metabolism?.recoveryScore ?? 0.5;
  const harmonyIndex = crystal?.harmony.harmonyIndex ?? 0.5;
  const stabilityIndex = crystal?.growth.stabilityIndex ?? 0.5;

  const growthMode = growth?.mode ?? 'gentle';
  const growthConfidence = growth?.confidence ?? 0.6;

  const externalStress = external?.externalStress ?? 0;
  const externalExploration = external?.externalExploration ?? 0;

  const intents: ActionIntent[] = [
    ...buildThrottleIntents(overloadRisk, externalStress),
    ...buildRecoveryIntents(growthMode, recoveryScore, growthConfidence),
    ...buildExplorationIntents(
      growthMode,
      harmonyIndex,
      stabilityIndex,
      overloadRisk,
      externalExploration,
    ),
    ...buildStabilizingIntent(overloadRisk, harmonyIndex, stabilityIndex, growthMode),
  ];

  if (!intents.length) {
    intents.push({
      id: uuidv4(),
      scope: 'system',
      kind: 'log_and_observe',
      urgency: 'low',
      strength: 'hint',
      confidence: 0.5,
      reasonKey: 'baseline_health_check',
      ttlMs: 3000,
    });
  }

  return {
    timestamp: now,
    stage: snapshot.stage ?? 0,
    growthMode,
    overloadRisk,
    harmonyIndex,
    intents,
  };
};
