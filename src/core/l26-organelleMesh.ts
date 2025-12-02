import {
  OrganelleDescriptor,
  OrganelleTask,
  OrganelleState,
} from "./types/organelle";

export interface OrganelleMeshMetrics {
  totalOrganelleCount: number;
  avgHealth: number;
  loadBalanceIndex: number;
  congestionScore: number;
}

export interface OrganelleMeshSnapshot {
  organelles: OrganelleState[];
  metrics: OrganelleMeshMetrics;
}

export type OrganelleMeshDispatchResult =
  | { status: "ACCEPTED"; organelle: OrganelleState }
  | { status: "QUEUED"; organelle: OrganelleState }
  | { status: "REJECTED"; reason: string };

export class OrganelleMesh {
  private organelles: OrganelleDescriptor[] = [];

  registerOrganelle(descriptor: OrganelleDescriptor) {
    this.organelles.push(descriptor);
  }

  dispatchTask(task: OrganelleTask): OrganelleMeshDispatchResult {
    const candidates = this.organelles.filter((organelle) =>
      task.desiredRoles.some((role) => organelle.roles.includes(role)),
    );

    if (candidates.length === 0) {
      return { status: "REJECTED", reason: "NO_MATCHING_ORGANELLE" };
    }

    const sorted = candidates.sort((a, b) => {
      const loadA = a.state.load.runningTasks / a.state.capacity.maxConcurrentTasks;
      const loadB = b.state.load.runningTasks / b.state.capacity.maxConcurrentTasks;
      const scoreA = loadA - a.state.health;
      const scoreB = loadB - b.state.health;
      return scoreA - scoreB;
    });

    const chosen = sorted[0];

    const projectedEnergy = chosen.state.load.energyInUse + task.energyCost;

    if (projectedEnergy > chosen.state.capacity.energyLimit) {
      return { status: "QUEUED", organelle: chosen.state };
    }

    return { status: "ACCEPTED", organelle: chosen.state };
  }

  snapshot(): OrganelleMeshSnapshot {
    const total = this.organelles.length || 1;
    const healthSum = this.organelles.reduce((acc, organelle) => acc + organelle.state.health, 0);

    const loads = this.organelles.map(
      (organelle) => organelle.state.load.runningTasks / (organelle.state.capacity.maxConcurrentTasks || 1),
    );
    const avgLoad = loads.reduce((a, b) => a + b, 0) / total;
    const variance = loads.reduce((acc, load) => acc + Math.pow(load - avgLoad, 2), 0) / total;
    const loadBalanceIndex = 1 - Math.min(1, variance);

    const congestionScore = Math.min(1, avgLoad);

    return {
      organelles: this.organelles.map((organelle) => organelle.state),
      metrics: {
        totalOrganelleCount: this.organelles.length,
        avgHealth: healthSum / total,
        loadBalanceIndex,
        congestionScore,
      },
    };
  }
}
