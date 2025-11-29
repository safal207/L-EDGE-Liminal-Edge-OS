import type { AtlasResult } from '@/atlas/full_atlas';
import type { BehavioralModulator } from '@/atlas/behavior_modulators';
import type { EnvironmentalDriver } from '@/atlas/environment_drivers';
import type { StabilizationMode } from '@/atlas/stabilization_modes';
import type { OrganismSnapshot } from '@/core/types/organismSnapshot';

export interface SimStepInput {
  env: EnvironmentalDriver;
  fsm: StabilizationMode;
  mod: BehavioralModulator;
  noise?: number;
}

export interface SimConfig {
  steps: number;
  dt: number;
  seed?: number;
  recordEvery?: number;
}

export interface SimState {
  t: number;
  snapshot: OrganismSnapshot;
  atlas: AtlasResult;
}

export interface SimEvent {
  t: number;
  delta: Partial<OrganismSnapshot>;
  inputs: SimStepInput;
  atlas: AtlasResult;
  snapshot: OrganismSnapshot;
  notes?: string[];
}

export interface SimSummary {
  avgOverloadRisk: number;
  avgTrajectoryQuality: number;
  maxDrift: number;
  gateGain: number;
  pathVolatility: number;
}

export interface SimTrace {
  config: SimConfig;
  initial: OrganismSnapshot;
  steps: SimEvent[];
  summary: SimSummary;
}
