import type { SimStepInput } from './sim_types';
import { pickEnv, pickFSM, pickMod } from './sim_logging';
import type { SimState } from './sim_types';

export const Scenarios = {
  baselineGrowth: (noise = 0.4) => (_state: SimState): SimStepInput => ({
    env: pickEnv('Dynamics'),
    fsm: pickFSM('Integration Mode'),
    mod: pickMod('Navigator'),
    noise,
  }),
  overloadThenRecovery: (phaseLength = 20, noise = 0.5) => (state: SimState): SimStepInput => {
    const t = state.t ?? 0;
    if (t < phaseLength) {
      return { env: pickEnv('Energy'), fsm: pickFSM('Protection Mode'), mod: pickMod('Catalyst'), noise };
    }
    return { env: pickEnv('Structure'), fsm: pickFSM('Coherence Mode'), mod: pickMod('Stabilizer'), noise: noise * 0.4 };
  },
};
