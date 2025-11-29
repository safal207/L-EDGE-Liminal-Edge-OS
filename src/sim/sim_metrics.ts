import type { SimEvent, SimSummary } from './sim_types';

interface MetricsAccumulator {
  steps: number;
  accOverloadRisk: number;
  accTrajectoryQuality: number;
  maxDrift: number;
  gateStart: number | null;
  gateEnd: number | null;
  lastPath: number | null;
  pathSwitches: number;
}

const getTrajectoryQuality = (event: SimEvent): number => {
  const stabilityScore = event.atlas.behavior?.stabilityScore ?? 0.5;
  const harmony = event.snapshot.crystal?.harmony.harmonyIndex ?? 0.5;
  return Math.max(0, Math.min(1, (stabilityScore + harmony) / 2));
};

export const createMetricsTracker = () => {
  const acc: MetricsAccumulator = {
    steps: 0,
    accOverloadRisk: 0,
    accTrajectoryQuality: 0,
    maxDrift: 0,
    gateStart: null,
    gateEnd: null,
    lastPath: null,
    pathSwitches: 0,
  };

  return {
    track(event: SimEvent) {
      acc.steps += 1;
      const risk = event.snapshot.metabolism?.overloadRisk ?? 0;
      acc.accOverloadRisk += risk;

      const tq = getTrajectoryQuality(event);
      acc.accTrajectoryQuality += tq;

      const drift = event.snapshot.crystal?.harmony.metabolicTension ?? 0;
      acc.maxDrift = Math.max(acc.maxDrift, drift);

      const gateId = event.atlas.gate?.id ?? 0;
      const pathId = event.atlas.path?.id ?? 0;
      if (acc.gateStart === null) acc.gateStart = gateId;
      acc.gateEnd = gateId;

      if (acc.lastPath === null) {
        acc.lastPath = pathId;
      } else if (acc.lastPath !== pathId) {
        acc.pathSwitches += 1;
        acc.lastPath = pathId;
      }
    },
    finalize(): SimSummary {
      const avgOverloadRisk = acc.steps ? acc.accOverloadRisk / acc.steps : 0;
      const avgTrajectoryQuality = acc.steps ? acc.accTrajectoryQuality / acc.steps : 0;
      const gateGain =
        acc.gateStart !== null && acc.gateEnd !== null ? acc.gateEnd - acc.gateStart : 0;
      const pathVolatility = acc.steps ? acc.pathSwitches / acc.steps : 0;
      return {
        avgOverloadRisk,
        avgTrajectoryQuality,
        maxDrift: acc.maxDrift,
        gateGain,
        pathVolatility,
      };
    },
  };
};
