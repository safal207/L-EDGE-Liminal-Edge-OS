import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import type { BehavioralModulator } from '@/atlas/behavior_modulators';
import type { EnvironmentalDriver } from '@/atlas/environment_drivers';
import type { StabilizationMode } from '@/atlas/stabilization_modes';
import type { SimStepInput } from './sim_types';

interface DynamicsArgs {
  snapshot: OrganismSnapshot;
  dt: number;
  input: SimStepInput;
  rng: () => number;
}

interface Influence {
  relax: number;
  conserve: number;
  coherence: number;
  centering: number;
  press: number;
  boost: number;
  align: number;
  navigate: number;
  heat: number;
  drag: number;
  turbulence: number;
  uncertainty: number;
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const envEffect = (env: EnvironmentalDriver): Pick<Influence, 'heat' | 'drag' | 'turbulence' | 'uncertainty'> => {
  const base = env.pressure ?? 0.5;
  return {
    heat: env.label === 'Energy' ? 0.7 + base * 0.3 : base,
    drag: env.label === 'Structure' ? 0.7 + base * 0.2 : base * 0.5,
    turbulence: env.label === 'Dynamics' ? 0.7 + base * 0.2 : base * 0.5,
    uncertainty: env.label === 'Charge' ? 0.7 + base * 0.2 : base * 0.5,
  };
};

const fsmEffect = (fsm: StabilizationMode): Pick<Influence, 'relax' | 'conserve' | 'coherence' | 'centering'> => {
  switch (fsm.label) {
    case 'Coherence Mode':
      return { relax: 0.8, conserve: 0.3, coherence: 0.9, centering: 0.8 };
    case 'Expansion Mode':
      return { relax: 0.2, conserve: 0.1, coherence: 0.4, centering: 0.3 };
    case 'Protection Mode':
      return { relax: 0.6, conserve: 0.8, coherence: 0.5, centering: 0.7 };
    case 'Integration Mode':
      return { relax: 0.5, conserve: 0.4, coherence: 0.7, centering: 0.6 };
    default:
      return { relax: 0.4, conserve: 0.4, coherence: 0.4, centering: 0.4 };
  }
};

const modEffect = (mod: BehavioralModulator): Pick<Influence, 'press' | 'boost' | 'align' | 'navigate'> => {
  switch (mod.label) {
    case 'Initiator':
      return { press: 0.5, boost: 0.6, align: 0.2, navigate: 0.3 };
    case 'Stabilizer':
      return { press: 0.2, boost: 0.2, align: 0.7, navigate: 0.6 };
    case 'Navigator':
      return { press: 0.3, boost: 0.3, align: 0.5, navigate: 0.9 };
    case 'Catalyst':
      return { press: 0.6, boost: 0.8, align: 0.3, navigate: 0.4 };
    default:
      return { press: 0.3, boost: 0.3, align: 0.4, navigate: 0.4 };
  }
};

export const applyDynamics = ({ snapshot, dt, input, rng }: DynamicsArgs) => {
  const noiseLevel = input.noise ?? 0;
  const noise = (amp = 0.02) => (rng() - 0.5) * 2 * amp * noiseLevel;

  const currentMetabolism = snapshot.metabolism ?? {
    mode: 'normal',
    totalEnergy: 0.5,
    totalStress: 0.5,
    totalRecovery: 0.5,
    stressIndex: 0.5,
    recoveryScore: 0.5,
    overloadRisk: 0.25,
    axes: [],
    overloadAxes: [],
    recommendedSlowdown: false,
    recommendedDeepRest: false,
  };

  const currentCrystal = snapshot.crystal ?? {
    harmony: { harmonyIndex: 0.5, axisImbalance: { L: 0.33, S: 0.33, C: 0.33 }, metabolicTension: 0.5 },
    growth: { growthMomentum: 0.5, stabilityIndex: 0.5, preferredAdjustments: [] },
    overallScore: 0.5,
  };

  const env = envEffect(input.env);
  const fsm = fsmEffect(input.fsm);
  const mod = modEffect(input.mod);

  const stress = currentMetabolism.stressIndex;
  const energy = currentMetabolism.totalEnergy;
  const recovery = currentMetabolism.totalRecovery;
  const harmony = currentCrystal.harmony.harmonyIndex;
  const metabolicTension = currentCrystal.harmony.metabolicTension;

  const dStress = clamp((-0.1 * fsm.relax + 0.08 * env.heat + 0.05 * mod.press + noise()) * dt, -0.2, 0.2);
  const dEnergy = clamp((0.1 * mod.boost - 0.06 * env.drag - 0.05 * fsm.conserve + noise()) * dt, -0.2, 0.2);
  const dHarmony = clamp((0.12 * fsm.coherence - 0.08 * env.turbulence + 0.05 * mod.align + noise()) * dt, -0.25, 0.25);
  const dTension = clamp((0.09 * env.uncertainty - 0.07 * fsm.centering - 0.04 * mod.navigate + noise()) * dt, -0.2, 0.2);

  const nextStress = clamp01(stress + dStress);
  const nextEnergy = clamp01(energy + dEnergy);
  const nextRecovery = clamp01(recovery + 0.06 * fsm.relax - 0.04 * env.drag + noise());
  const nextHarmony = clamp01(harmony + dHarmony);
  const nextTension = clamp01(metabolicTension + dTension);

  const recoveryScore = clamp01((nextRecovery + (snapshot.metabolism?.recoveryScore ?? nextRecovery)) / 2);
  const overloadRisk = clamp01(nextStress * (1 - recoveryScore));

  const delta: Partial<OrganismSnapshot> = {
    metabolism: {
      ...currentMetabolism,
      totalStress: nextStress,
      stressIndex: nextStress,
      totalEnergy: nextEnergy,
      totalRecovery: nextRecovery,
      recoveryScore,
      overloadRisk,
    },
    crystal: {
      ...currentCrystal,
      harmony: {
        ...currentCrystal.harmony,
        harmonyIndex: nextHarmony,
        metabolicTension: nextTension,
      },
      growth: {
        ...currentCrystal.growth,
        growthMomentum: clamp01(
          currentCrystal.growth.growthMomentum + 0.05 * mod.boost - 0.04 * env.drag + noise(),
        ),
        stabilityIndex: clamp01(
          currentCrystal.growth.stabilityIndex + 0.08 * fsm.coherence - 0.05 * env.turbulence + noise(),
        ),
      },
    },
  };

  const notes: string[] = [];
  if (delta.metabolism?.stressIndex && delta.metabolism.stressIndex > 0.8) notes.push('high_stress');
  if (delta.crystal?.harmony.harmonyIndex && delta.crystal.harmony.harmonyIndex > 0.75) notes.push('high_harmony');

  return { delta, notes };
};
