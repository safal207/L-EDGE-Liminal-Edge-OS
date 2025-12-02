export type OrganelleType =
  | "MITOCHONDRIA"
  | "RIBOSOME"
  | "GOLGI"
  | "ER"
  | "LYSOSOME"
  | "VACUOLE"
  | "CYTOSKELETON";

export interface OrganelleId {
  layer: string;
  name: string;
  type: OrganelleType;
}

export interface OrganelleCapacity {
  maxConcurrentTasks: number;
  energyLimit: number;
}

export interface OrganelleLoad {
  runningTasks: number;
  queuedTasks: number;
  recentFailures: number;
  energyInUse: number;
}

export interface OrganelleState {
  id: OrganelleId;
  capacity: OrganelleCapacity;
  load: OrganelleLoad;
  health: number;
}

export type OrganelleRoleTag =
  | "ENERGY"
  | "EXECUTION"
  | "ROUTING"
  | "TRANSPORT"
  | "CLEANUP"
  | "BUFFER";

export interface OrganelleDescriptor {
  state: OrganelleState;
  roles: OrganelleRoleTag[];
}

export interface OrganelleTask {
  id: string;
  sourceLayer: string;
  desiredRoles: OrganelleRoleTag[];
  energyCost: number;
  payload: unknown;
  deadlineMs?: number;
  priority?: number;
}
