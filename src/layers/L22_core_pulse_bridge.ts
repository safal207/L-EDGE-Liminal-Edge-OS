import type { CorePulseDrift, CorePulseState, PulsePhase } from "../../layers/L22_CorePulse/types";

export interface CorePulseSnapshot {
  phase: PulsePhase;
  drift: CorePulseDrift;
  modulationLevel: number; // 0..1
  baselineLevel: number; // 0..1
}

function clamp(value: number, min = 0, max = 1): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

/**
 * Reduce a full CorePulseState into a compact snapshot that L23 can consume
 * without pulling the entire L22 surface area.
 */
export function toCorePulseSnapshot(pulse: CorePulseState): CorePulseSnapshot {
  const modulationInfluence =
    pulse.modulation.breathingInfluence * 0.25 +
    pulse.modulation.luckInfluence * 0.35 +
    pulse.modulation.emotionalInfluence * 0.25;

  const readinessInfluence = pulse.readiness * 0.15;
  const overloadImpact = pulse.overloadLevel * 0.15;
  const variabilityImpact = pulse.current.variability * 0.1;

  const modulationLevel = clamp(
    modulationInfluence + readinessInfluence - overloadImpact + variabilityImpact,
  );

  const baselineLevel = clamp((pulse.baseline.intensity + pulse.baseline.stability) / 2);

  return {
    phase: pulse.current.phase,
    drift: pulse.drift ?? "stable",
    modulationLevel,
    baselineLevel,
  };
}
