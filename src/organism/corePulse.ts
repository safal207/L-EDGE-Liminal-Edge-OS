import { LiminalSense } from "../sense/sense";
import type { SenseState } from "../sense/types";
import type { BodyFatigueSnapshot, InteroceptionContext } from "../../interoception/contracts";
import { computeBodyFatigueSnapshot } from "../../interoception/bodyFatigueSnapshot";
import type { MineralProfile } from "../layers/L27_mineral_buffer";
import type { ResourceState } from "../layers/L25_cell_kernel";
import type { SleepPlan } from "../../sleep/sleepCycle";
import { planSleep } from "../../sleep/sleepCycle";

export type PulseTone = "normal" | "strained" | "restoration" | "sleeping";

export interface PulseState {
  beat: number;
  timestamp: number;
  tone: PulseTone;
  sense: SenseState;
  fatigue: BodyFatigueSnapshot;
  sleepPlan?: SleepPlan;
}

export interface PulseContext {
  timestamp: number;
  previousPulse?: PulseState;
  resources?: ResourceState;
  minerals?: MineralProfile;
}

export function decidePulseTone(fatigue: BodyFatigueSnapshot): PulseTone {
  const { fatigueLevel, depletionLevel, recoveryNeed } = fatigue;

  if (recoveryNeed === "high" || depletionLevel > 0.85 || fatigueLevel > 0.9) {
    return "sleeping";
  }

  if (recoveryNeed === "medium" || fatigueLevel > 0.7 || depletionLevel > 0.6) {
    return "restoration";
  }

  if (fatigueLevel > 0.5 || depletionLevel > 0.5) {
    return "strained";
  }

  return "normal";
}

export async function runPulse(ctx: PulseContext): Promise<PulseState> {
  const beat = (ctx.previousPulse?.beat ?? 0) + 1;
  const timestamp = ctx.timestamp;

  const sense = await Promise.resolve(
    LiminalSense.process({
      timestamp,
      previousStates: ctx.previousPulse ? [ctx.previousPulse.sense] : [],
    }),
  );

  const interoceptionCtx: Partial<InteroceptionContext> = {
    resources: ctx.resources,
    minerals: ctx.minerals,
  };

  const fatigue = computeBodyFatigueSnapshot(interoceptionCtx as InteroceptionContext);

  const tone = decidePulseTone(fatigue);

  let sleepPlan: SleepPlan | undefined;
  if (tone === "sleeping" || tone === "restoration") {
    sleepPlan = planSleep(fatigue);
  }

  return {
    beat,
    timestamp,
    tone,
    sense,
    fatigue,
    sleepPlan,
  };
}
