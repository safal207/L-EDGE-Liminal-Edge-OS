import { BEHAVIORAL_MODULATORS } from '@/atlas/behavior_modulators';
import type { BehavioralModulator } from '@/atlas/behavior_modulators';
import { ENVIRONMENTAL_DRIVERS } from '@/atlas/environment_drivers';
import type { EnvironmentalDriver } from '@/atlas/environment_drivers';
import { STABILIZATION_MODES } from '@/atlas/stabilization_modes';
import type { StabilizationMode } from '@/atlas/stabilization_modes';

export const initRng = (seed: number): (() => number) => {
  let x = seed | 0;
  return () => {
    x = (x * 1664525 + 1013904223) | 0;
    return ((x >>> 0) % 0x100000000) / 0x100000000;
  };
};

const pickByLabel = <T extends { label: string }>(collection: T[], label: string): T =>
  collection.find((item) => item.label === label) ?? collection[0];

export const pickEnv = (label: string): EnvironmentalDriver => pickByLabel(ENVIRONMENTAL_DRIVERS, label);

export const pickFSM = (label: string): StabilizationMode => pickByLabel(STABILIZATION_MODES, label);

export const pickMod = (label: string): BehavioralModulator => pickByLabel(BEHAVIORAL_MODULATORS, label);
