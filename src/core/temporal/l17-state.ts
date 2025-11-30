import type { AutopoieticSnapshot } from '@/organism/autopoietic/L16_autopoietic_types';
import type { TemporalBuildInputs, TemporalSnapshot, TemporalState, TransitionFeeling } from './l17-types';
import { proposeTemporalSteeringDecision } from './l17-steering';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

const deriveTransitionFeeling = (autopoietic?: AutopoieticSnapshot | null): TransitionFeeling => {
  const currentTensegrity =
    autopoietic?.tensegrityPotential ?? autopoietic?.currentFrame?.tensegrityPotential ?? 0.5;
  const previousTensegrity =
    autopoietic?.immuneCycle.previousFrame?.tensegrityPotential ?? currentTensegrity;
  const delta = currentTensegrity - previousTensegrity;
  const overshoot = autopoietic?.stability.overshootLevel ?? 0.3;

  return {
    intensity: clamp01(Math.abs(delta) * 0.6 + overshoot * 0.6),
    direction: delta > 0.05 ? 'toward_vapor' : delta < -0.05 ? 'toward_solid' : 'toward_fluidity',
    deltaPhase: delta,
    rate: autopoietic?.stability.recoveryTimeMs ? 1 / Math.max(1, autopoietic.stability.recoveryTimeMs) : 0.0001,
    axisShift: {
      inner:
        (autopoietic?.currentFrame.balance.inner ?? 0) -
        (autopoietic?.immuneCycle.previousFrame?.balance.inner ?? 0),
      social:
        (autopoietic?.currentFrame.balance.social ?? 0) -
        (autopoietic?.immuneCycle.previousFrame?.balance.social ?? 0),
      cosmic:
        (autopoietic?.currentFrame.balance.cosmic ?? 0) -
        (autopoietic?.immuneCycle.previousFrame?.balance.cosmic ?? 0),
    },
    phaseBefore: previousTensegrity,
    phaseAfter: currentTensegrity,
  };
};

const buildTemporalSnapshot = (
  inputs: TemporalBuildInputs,
  stepIndex: number,
): TemporalSnapshot => {
  const { triAxis, autopoietic, metabolism, goalProjection, now = Date.now() } = inputs;
  const feeling = deriveTransitionFeeling(autopoietic);
  const stability = autopoietic?.stability.stabilityIndex ?? 0.5;
  const recoveryTime = autopoietic?.stability.recoveryTimeMs ?? 0;
  const tension = autopoietic?.stability.overshootLevel ?? metabolism?.overloadRisk ?? 0.4;
  const phase = autopoietic?.currentFrame.tensegrityPotential ?? autopoietic?.stability.stabilityIndex ?? 0.5;

  return {
    stepIndex,
    timestamp: now,
    axes: { inner: triAxis.L.value, social: triAxis.S.value, cosmic: triAxis.C.value },
    phase,
    stability,
    recoveryTime,
    tension: clamp01(tension),
    feeling,
    goalProjection,
  };
};

export const buildTemporalState = (
  inputs: TemporalBuildInputs,
): { state: TemporalState; steering: ReturnType<typeof proposeTemporalSteeringDecision> } => {
  const history = inputs.temporalHistory ?? [];
  const stepIndex = history.length > 0 ? history[history.length - 1].stepIndex + 1 : 0;
  const nowSnapshot = buildTemporalSnapshot(inputs, stepIndex);

  const state: TemporalState = {
    past: history,
    now: nowSnapshot,
    future: [],
    autopoietic: inputs.autopoietic ?? undefined,
  };

  const steering = proposeTemporalSteeringDecision(state);
  return { state, steering };
};
