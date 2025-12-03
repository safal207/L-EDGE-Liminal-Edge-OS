import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import type { ExternalSignalsAggregate } from '@/nerve/L12_external_signals_types';
import type { ActionIntent, ResponseFrame } from '@/nerve/L13_response_types';
import type { OrganismTone } from '@/layers/shared/organismTone';
import { v4 as uuidv4 } from 'uuid';

export interface ResponseContextInputs {
  snapshot: OrganismSnapshot;
  external?: ExternalSignalsAggregate;
  tone?: OrganismTone;
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

const applyToneToOverloadRisk = (overloadRisk: number, tone?: OrganismTone): number => {
  if (!tone) return overloadRisk;

  const overwhelmedBoost = tone.isOverwhelmed ? 0.12 : 0;
  const recoveryBoost = tone.needsRecovery ? 0.08 : 0;

  return clamp01(overloadRisk + overwhelmedBoost + recoveryBoost);
};

const buildToneSafetyIntents = (
  tone: OrganismTone,
  overloadRisk: number,
  recoveryScore: number,
): ActionIntent[] => {
  const intents: ActionIntent[] = [];

  if (tone.isOverwhelmed) {
    intents.push({
      id: uuidv4(),
      scope: 'system',
      kind: 'throttle',
      urgency: 'high',
      strength: 'hard_limit',
      confidence: clamp01(0.6 + overloadRisk * 0.3),
      reasonKey: 'overload_risk',
      params: { max_load_factor: 0.5 },
      ttlMs: 8000,
    });
  }

  if (tone.needsRecovery && recoveryScore < 0.7) {
    intents.push({
      id: uuidv4(),
      scope: 'scheduling',
      kind: 'enter_recovery_mode',
      urgency: 'normal',
      strength: 'strong_recommendation',
      confidence: clamp01(0.5 + (0.7 - recoveryScore)),
      reasonKey: 'deep_recovery_needed',
      params: { allow_only_essential: true, prefer_async: true },
      ttlMs: 15000,
    });
  }

  return intents;
};

export const computeResponseFrame = (
  { snapshot, external, tone: toneFromContext }: ResponseContextInputs,
  now: number = Date.now(),
): ResponseFrame => {
  const metabolism = snapshot.metabolism;
  const crystal = snapshot.crystal;
  const growth = snapshot.growthMode;
  const tone = toneFromContext ?? snapshot.tone;

  const overloadRisk = applyToneToOverloadRisk(metabolism?.overloadRisk ?? 0, tone);
  const stressIndex = metabolism?.stressIndex ?? 0.5;
  const recoveryScore = metabolism?.recoveryScore ?? 0.5;
  const harmonyIndex = crystal?.harmony.harmonyIndex ?? 0.5;
  const stabilityIndex = crystal?.growth.stabilityIndex ?? 0.5;

  const growthMode = growth?.mode ?? 'gentle';
  const growthConfidence = growth?.confidence ?? 0.6;

  const externalStress = external?.externalStress ?? 0;
  const externalExploration = clamp01(
    (external?.externalExploration ?? 0) + (tone?.isInFlow ? 0.05 : 0) - (tone?.needsRecovery ? 0.1 : 0),
  );

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
    ...(tone ? buildToneSafetyIntents(tone, overloadRisk, recoveryScore) : []),
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
