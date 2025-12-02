import {
  MineralMatrix,
  OrganelleDescriptor,
  OrganelleState,
  OrganelleTask,
} from "./types/organelle";

export interface OrganelleMeshMetrics {
  totalOrganelleCount: number;
  avgHealth: number;
  loadBalanceIndex: number;
  congestionScore: number;
  structuralIntegrity: number;
  ionFlowStability: number;
  microRepairPotential: number;
  mineralBalanceStability: number;
}

export interface OrganelleMeshSnapshot {
  organelles: OrganelleState[];
  mineralMatrix: MineralMatrix;
  metrics: OrganelleMeshMetrics;
}

type MineralMatrixUpdate = Partial<MineralMatrix> & {
  mineralBalance?: Record<string, number>;
};

export type OrganelleMeshDispatchResult =
  | { status: "ACCEPTED"; organelle: OrganelleState }
  | { status: "QUEUED"; organelle: OrganelleState }
  | { status: "REJECTED"; reason: string };

export class OrganelleMesh {
  private organelles: OrganelleDescriptor[] = [];
  private mineralMatrix: MineralMatrix = {
    structuralIntegrity: 0.75,
    ionFlowStability: 0.75,
    microRepairRate: 0.6,
    adaptationSpeed: 0.65,
    mineralBalance: {
      Ca: 1,
      Mg: 1,
      Si: 0.8,
      Fe: 0.9,
    },
  };

  registerOrganelle(descriptor: OrganelleDescriptor) {
    this.organelles.push(descriptor);
  }

  setMineralMatrix(matrix: MineralMatrix) {
    this.mineralMatrix = {
      ...matrix,
      mineralBalance: { ...matrix.mineralBalance },
    };
  }

  updateMineralMatrix(update: MineralMatrixUpdate) {
    this.mineralMatrix = {
      ...this.mineralMatrix,
      ...update,
      mineralBalance: {
        ...this.mineralMatrix.mineralBalance,
        ...(update.mineralBalance || {}),
      },
    };
  }

  getMineralMatrix(): MineralMatrix {
    return {
      ...this.mineralMatrix,
      mineralBalance: { ...this.mineralMatrix.mineralBalance },
    };
  }

  dispatchTask(task: OrganelleTask): OrganelleMeshDispatchResult {
    const candidates = this.organelles.filter((organelle) =>
      task.desiredRoles.some((role) => organelle.roles.includes(role)),
    );

    if (candidates.length === 0) {
      return { status: "REJECTED", reason: "NO_MATCHING_ORGANELLE" } as const;
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

    if (
      projectedEnergy > chosen.state.capacity.energyLimit * this.structuralGuardrail()
    ) {
      return { status: "QUEUED", organelle: chosen.state } as const;
    }

    return { status: "ACCEPTED", organelle: chosen.state } as const;
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
    const avgHealth = healthSum / total;

    const structuralIntegrity = this.clamp01(
      (this.mineralMatrix.structuralIntegrity + avgHealth) / 2,
    );

    const ionFlowStability = this.clamp01(
      this.mineralMatrix.ionFlowStability * 0.6 +
        loadBalanceIndex * 0.25 +
        (1 - congestionScore) * 0.15,
    );

    const totalFailures = this.organelles.reduce(
      (acc, organelle) => acc + organelle.state.load.recentFailures,
      0,
    );
    const failurePressure = Math.min(1, totalFailures / Math.max(1, total));
    const microRepairPotential = this.clamp01(
      this.mineralMatrix.microRepairRate * (1 - failurePressure) +
        this.mineralMatrix.adaptationSpeed * 0.25,
    );

    const mineralBalanceValues = Object.values(this.mineralMatrix.mineralBalance);
    let mineralBalanceStability = 1;
    if (mineralBalanceValues.length > 1) {
      const max = Math.max(...mineralBalanceValues);
      const min = Math.min(...mineralBalanceValues);
      mineralBalanceStability = this.clamp01(1 - (max - min) / (max || 1));
    }

    return {
      organelles: this.organelles.map((organelle) => organelle.state),
      mineralMatrix: this.getMineralMatrix(),
      metrics: {
        totalOrganelleCount: this.organelles.length,
        avgHealth,
        loadBalanceIndex,
        congestionScore,
        structuralIntegrity,
        ionFlowStability,
        microRepairPotential,
        mineralBalanceStability,
      },
    };
  }

  private structuralGuardrail() {
    return this.clamp01(0.7 + this.mineralMatrix.structuralIntegrity * 0.3);
  }

  private clamp01(value: number) {
    return Math.max(0, Math.min(1, value));
  }
}
