import { computeAtlasFingerprint } from '@/atlas/full_atlas';
import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import { applyDynamics } from './sim_dynamics';
import { createMetricsTracker } from './sim_metrics';
import type { SimConfig, SimEvent, SimState, SimStepInput, SimTrace } from './sim_types';
import { initRng } from './sim_logging';

const mergeSnapshot = (
  base: OrganismSnapshot,
  delta: Partial<OrganismSnapshot>,
  timestamp: number,
): OrganismSnapshot => {
  return {
    ...base,
    ...delta,
    triAxis: delta.triAxis ?? base.triAxis,
    orientation: delta.orientation ?? base.orientation,
    observer: delta.observer ?? base.observer,
    externalSignals: delta.externalSignals ?? base.externalSignals,
    metabolism: delta.metabolism ? { ...(base.metabolism ?? {}), ...delta.metabolism } : base.metabolism,
    crystal: delta.crystal ? { ...(base.crystal ?? {}), ...delta.crystal } : base.crystal,
    growthMode: delta.growthMode ?? base.growthMode,
    responseFrame: delta.responseFrame ?? base.responseFrame,
    timestamp,
  };
};

export const runSimulation = (
  initial: SimState,
  inputFn: (state: SimState) => SimStepInput,
  config: SimConfig,
): SimTrace => {
  const rng = initRng(config.seed ?? 42);
  const metrics = createMetricsTracker();
  const steps: SimEvent[] = [];

  let state: SimState = { ...initial };

  for (let i = 1; i <= config.steps; i += 1) {
    const input = inputFn(state);
    const { delta, notes } = applyDynamics({ snapshot: state.snapshot, dt: config.dt, input, rng });
    const nextSnapshot = mergeSnapshot(state.snapshot, delta, Date.now());
    const atlas = computeAtlasFingerprint(nextSnapshot);

    const event: SimEvent = {
      t: i,
      delta,
      inputs: input,
      atlas,
      snapshot: nextSnapshot,
      notes,
    };

    metrics.track(event);
    steps.push(event);
    state = { t: i, snapshot: nextSnapshot, atlas };
  }

  return {
    config,
    initial: initial.snapshot,
    steps,
    summary: metrics.finalize(),
  };
};
