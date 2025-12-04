import type { MineralProfile } from "../../layers/L27_MineralLayer/types";
import type { ResourceState } from "./L25_cell_kernel";

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function updateMineralProfile(profile: MineralProfile, resource: ResourceState): MineralProfile {
  const baselineReserve = clamp01(profile.baselineReserve);
  const currentReserve = clamp01(Math.min(profile.currentReserve, baselineReserve || 1));
  const strain = clamp01(resource.strain);
  const regeneration = clamp01(resource.regenerationTendency);
  const energy = clamp01(resource.energy);

  let nextReserve = currentReserve;

  // Sustained strain combined with high energy output drains long-term minerals.
  if (strain > 0.5) {
    const overloadDrain = (strain - 0.5) * 0.1 + energy * 0.05;
    nextReserve -= overloadDrain;
  } else {
    nextReserve -= strain * 0.025;
  }

  // Calmer, regenerative windows refill toward the baseline reserve.
  if (regeneration > 0.55 && strain < 0.55) {
    const refillPotential = baselineReserve - nextReserve;
    const refillRate = regeneration * (1 - strain) * 0.08;
    nextReserve += Math.min(refillPotential, refillRate);
  } else if (regeneration > 0.35 && strain < 0.4) {
    nextReserve += regeneration * 0.02;
  }

  const cappedReserve = clamp01(Math.min(baselineReserve || 1, Math.max(0, nextReserve)));
  const depletionLevel = baselineReserve > 0 ? clamp01(1 - cappedReserve / baselineReserve) : 1;

  return {
    baselineReserve,
    currentReserve: cappedReserve,
    depletionLevel,
  } satisfies MineralProfile;
}
