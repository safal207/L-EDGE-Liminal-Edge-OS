import { v4 as uuidv4 } from 'uuid';

import type { OrganismSnapshot } from '@/core/types/organismSnapshot';

import {
  type AutopoieticConfig,
  type AutopoieticInputs,
  type AutopoieticSnapshot,
  type BalanceVector,
  type DisturbanceScenario,
  type FrameId,
  type ImmuneCycleState,
  type MultiframeConfig,
  type StabilityMetrics,
  type YinYangTaoState,
} from './L16_autopoietic_types';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const DEFAULT_FRAMES: MultiframeConfig[] = [
  {
    frameId: 'near',
    balance: { inner: 0.7, social: 0.2, cosmic: 0.1 },
    yinYangTao: { yin: 0.4, yang: 0.4, tao: 0.2 },
    tensegrityPotential: 0.3,
  },
  {
    frameId: 'mid',
    balance: { inner: 0.4, social: 0.4, cosmic: 0.2 },
    yinYangTao: { yin: 0.3, yang: 0.5, tao: 0.2 },
    tensegrityPotential: 0.5,
  },
  {
    frameId: 'far',
    balance: { inner: 0.2, social: 0.3, cosmic: 0.5 },
    yinYangTao: { yin: 0.2, yang: 0.5, tao: 0.3 },
    tensegrityPotential: 0.7,
  },
];

export const DEFAULT_AUTOPOIETIC_CONFIG: AutopoieticConfig = {
  frames: DEFAULT_FRAMES,
  disturbance: {
    maxMagnitude: 0.4,
    defaultDurationMs: 5000,
    safeGuard: true,
  },
  immuneCycle: {
    stabilityThreshold: 0.75,
    maxRecoveryTimeMs: 15000,
    learningGainFactor: 0.05,
  },
  tensegrityTolerance: 0.65,
};

const findFrame = (frames: MultiframeConfig[], id: FrameId): MultiframeConfig => {
  return frames.find((f) => f.frameId === id) ?? frames[0];
};

const blendScalar = (from: number, to: number, t: number): number => from + (to - from) * t;

const blendBalance = (from: BalanceVector, to: BalanceVector, t: number): BalanceVector => ({
  inner: blendScalar(from.inner, to.inner, t),
  social: blendScalar(from.social, to.social, t),
  cosmic: blendScalar(from.cosmic, to.cosmic, t),
});

const blendYinYangTao = (from: YinYangTaoState, to: YinYangTaoState, t: number): YinYangTaoState => ({
  yin: blendScalar(from.yin, to.yin, t),
  yang: blendScalar(from.yang, to.yang, t),
  tao: blendScalar(from.tao, to.tao, t),
});

const blendFrames = (from: MultiframeConfig, to: MultiframeConfig, t: number): MultiframeConfig => ({
  frameId: to.frameId,
  balance: blendBalance(from.balance, to.balance, t),
  yinYangTao: blendYinYangTao(from.yinYangTao, to.yinYangTao, t),
  tensegrityPotential: blendScalar(from.tensegrityPotential, to.tensegrityPotential, t),
});

const computeTensegrity = (frame: MultiframeConfig, snapshot: OrganismSnapshot): number => {
  const triAxis = snapshot.triAxis;
  const avgAxisDelta =
    (Math.abs(frame.balance.inner - triAxis.L.value) +
      Math.abs(frame.balance.social - triAxis.S.value) +
      Math.abs(frame.balance.cosmic - triAxis.C.value)) /
    3;

  const stress = snapshot.metabolism?.stressIndex ?? 0.5;
  const recovery = snapshot.metabolism?.recoveryScore ?? 0.5;
  const overload = snapshot.metabolism?.overloadRisk ?? 0.4;

  const metabolicTension = Math.max(0, stress - recovery * 0.7) + overload * 0.2;
  return clamp01(avgAxisDelta * 0.6 + metabolicTension * 0.4);
};

const chooseTargetFrame = (
  snapshot: OrganismSnapshot,
  frames: MultiframeConfig[],
): MultiframeConfig => {
  const overload = snapshot.metabolism?.overloadRisk ?? 0.5;
  const harmony = snapshot.crystal?.harmony.harmonyIndex ?? 0.5;
  const growthMode = snapshot.growthMode?.mode ?? 'gentle';

  if (overload > 0.65 || snapshot.stage <= 3) return findFrame(frames, 'near');
  if (growthMode === 'exploratory' && overload < 0.4 && harmony > 0.6) {
    return findFrame(frames, 'far');
  }
  return findFrame(frames, 'mid');
};

const capMagnitude = (value: number, max: number): number => Math.min(max, Math.max(0, value));

const buildTrainingDisturbance = (targetFrame: FrameId, maxMagnitude: number): DisturbanceScenario => ({
  id: `disturbance_${uuidv4()}`,
  targetFrame,
  magnitude: capMagnitude(maxMagnitude * 0.5, maxMagnitude),
  durationMs: 4000,
  safeGuard: true,
});

const applyDisturbanceToFrame = (frame: MultiframeConfig, scenario: DisturbanceScenario): MultiframeConfig => {
  const bias = scenario.axisBias ?? { inner: 0.4, social: 0.35, cosmic: 0.25 };
  const scale = scenario.magnitude;
  return {
    ...frame,
    balance: {
      inner: clamp01(frame.balance.inner + bias.inner * scale * 0.5),
      social: clamp01(frame.balance.social + bias.social * scale * 0.3),
      cosmic: clamp01(frame.balance.cosmic + bias.cosmic * scale * 0.2),
    },
    tensegrityPotential: clamp01(frame.tensegrityPotential + scale * 0.2),
  };
};

const computeStabilityMetrics = (
  snapshot: OrganismSnapshot,
  tensegrityPotential: number,
  config: AutopoieticConfig,
  previous?: StabilityMetrics,
  now?: number,
  cycleStartMs?: number,
): StabilityMetrics => {
  const overload = snapshot.metabolism?.overloadRisk ?? 0.5;
  const harmony = snapshot.crystal?.harmony.harmonyIndex ?? 0.5;
  const recovery = snapshot.metabolism?.recoveryScore ?? 0.5;
  const stabilityIndex = clamp01(
    0.4 * (1 - overload) + 0.35 * harmony + 0.25 * (1 - tensegrityPotential),
  );

  const overshootLevel = clamp01(
    Math.max(0, (snapshot.metabolism?.stressIndex ?? 0.5) - (1 - recovery)),
  );

  const recoveryBaseline = cycleStartMs ?? previous?.recoveryTimeMs ?? 0;
  const recoveryTimeMs = recoveryBaseline
    ? Math.max(0, (now ?? Date.now()) - recoveryBaseline)
    : 0;

  const learningGain = previous
    ? clamp01((stabilityIndex - previous.stabilityIndex) * config.immuneCycle.learningGainFactor)
    : 0;

  return {
    stabilityIndex,
    recoveryTimeMs,
    overshootLevel,
    learningGain,
  };
};

const nextPhase = (
  current: ImmuneCycleState,
  stability: StabilityMetrics,
  config: AutopoieticConfig,
  now: number,
): ImmuneCycleState => {
  const threshold = config.immuneCycle.stabilityThreshold;
  const overshootGuard = stability.overshootLevel > 0.6;

  if (current.phase === 'Idle') return current;
  if (current.phase === 'Detecting') {
    return { ...current, phase: 'Compensating' };
  }
  if (current.phase === 'Compensating') {
    if (stability.stabilityIndex >= threshold && !overshootGuard) {
      return { ...current, phase: 'Stabilizing' };
    }
    return current;
  }
  if (current.phase === 'Stabilizing') {
    const elapsed = current.cycleStartMs ? now - current.cycleStartMs : 0;
    if (stability.stabilityIndex >= threshold && elapsed >= 500) {
      return { ...current, phase: 'Integrating', metricsSnapshot: stability };
    }
    return current;
  }
  if (current.phase === 'Integrating') {
    const elapsed = current.cycleStartMs ? now - current.cycleStartMs : 0;
    if (elapsed >= config.immuneCycle.maxRecoveryTimeMs || stability.stabilityIndex >= threshold) {
      return { ...current, phase: 'Idle', activeDisturbance: undefined, disturbanceStartedAt: undefined };
    }
    return current;
  }
  return current;
};

const ensureCycleStart = (
  snapshot: OrganismSnapshot,
  currentFrame: MultiframeConfig,
  previous?: ImmuneCycleState,
  config: AutopoieticConfig = DEFAULT_AUTOPOIETIC_CONFIG,
  now: number = Date.now(),
  pending?: DisturbanceScenario | null,
): ImmuneCycleState => {
  const overload = snapshot.metabolism?.overloadRisk ?? 0.0;
  const stress = snapshot.metabolism?.stressIndex ?? 0.5;
  const recovery = snapshot.metabolism?.recoveryScore ?? 0.5;
  const tensegrity = computeTensegrity(currentFrame, snapshot);

  const shouldStart =
    previous?.phase === 'Idle' &&
    (tensegrity > config.tensegrityTolerance || overload > 0.65 || (stress > 0.6 && recovery < 0.4));

  if (!shouldStart) return previous ?? { phase: 'Idle', currentFrame };

  return {
    phase: 'Detecting',
    activeDisturbance:
      pending || (config.disturbance.safeGuard ? buildTrainingDisturbance('near', config.disturbance.maxMagnitude) : undefined),
    currentFrame,
    previousFrame: previous?.currentFrame ?? currentFrame,
    disturbanceStartedAt: pending ? Date.now() : undefined,
    cycleStartMs: now,
  };
};

export const runAutopoieticStep = (inputs: AutopoieticInputs): AutopoieticSnapshot => {
  const { snapshot, previous, config = DEFAULT_AUTOPOIETIC_CONFIG, pendingDisturbance, now = Date.now() } = inputs;
  const frames = config.frames?.length ? config.frames : DEFAULT_AUTOPOIETIC_CONFIG.frames;

  const targetFrame = chooseTargetFrame(snapshot, frames);
  const prevFrame = previous?.currentFrame ?? targetFrame;
  const blendedFrame = targetFrame.frameId === prevFrame.frameId ? prevFrame : blendFrames(prevFrame, targetFrame, 0.35);

  const immuneCycle = ensureCycleStart(snapshot, blendedFrame, previous?.immuneCycle, config, now, pendingDisturbance);

  let disturbedFrame = blendedFrame;
  if (immuneCycle.activeDisturbance) {
    disturbedFrame = applyDisturbanceToFrame(blendedFrame, immuneCycle.activeDisturbance);
  } else if (
    !previous?.immuneCycle?.activeDisturbance &&
    (snapshot.growthMode?.mode === 'exploratory' || snapshot.growthMode?.mode === 'intensive') &&
    (snapshot.metabolism?.overloadRisk ?? 0) < 0.35 &&
    (snapshot.externalSignals?.externalRecovery ?? 0) > 0.4
  ) {
    disturbedFrame = applyDisturbanceToFrame(
      blendedFrame,
      buildTrainingDisturbance(targetFrame.frameId, config.disturbance.maxMagnitude * 0.5),
    );
  }

  const tensegrityPotential = computeTensegrity(disturbedFrame, snapshot);

  const stability = computeStabilityMetrics(
    snapshot,
    tensegrityPotential,
    config,
    previous?.stability,
    now,
    previous?.immuneCycle?.cycleStartMs,
  );

  const nextCycle = nextPhase(immuneCycle, stability, config, now);

  const disturbanceHistory = previous?.disturbanceHistory ?? [];
  if (immuneCycle.activeDisturbance && !disturbanceHistory.find((d) => d.id === immuneCycle.activeDisturbance?.id)) {
    disturbanceHistory.push(immuneCycle.activeDisturbance);
  }

  const noteParts = [
    `frame=${disturbedFrame.frameId}`,
    `phase=${nextCycle.phase}`,
    `tensegrity=${tensegrityPotential.toFixed(2)}`,
    `stability=${stability.stabilityIndex.toFixed(2)}`,
  ];

  return {
    currentFrame: disturbedFrame,
    targetFrame,
    tensegrityPotential,
    immuneCycle: nextCycle,
    stability,
    disturbanceHistory,
    note: noteParts.join(' | '),
  };
};
