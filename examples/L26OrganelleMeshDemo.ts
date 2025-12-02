import { OrganelleMesh } from "../src/core/l26-organelleMesh";
import { OrganelleDescriptor, OrganelleTask } from "../src/core/types/organelle";

const mesh = new OrganelleMesh();

const mitochondria: OrganelleDescriptor = {
  state: {
    id: { layer: "L10_RUNTIME", name: "mito-main", type: "MITOCHONDRIA" },
    capacity: { maxConcurrentTasks: 10, energyLimit: 100 },
    load: { runningTasks: 2, queuedTasks: 0, recentFailures: 0, energyInUse: 15 },
    health: 0.9,
  },
  roles: ["ENERGY"],
};

const ribosome: OrganelleDescriptor = {
  state: {
    id: { layer: "L11_PIPELINE", name: "ribo-a", type: "RIBOSOME" },
    capacity: { maxConcurrentTasks: 5, energyLimit: 40 },
    load: { runningTasks: 1, queuedTasks: 0, recentFailures: 0, energyInUse: 5 },
    health: 0.8,
  },
  roles: ["EXECUTION"],
};

mesh.registerOrganelle(mitochondria);
mesh.registerOrganelle(ribosome);

const task: OrganelleTask = {
  id: "example-task-1",
  sourceLayer: "L25_CELL_KERNEL",
  desiredRoles: ["EXECUTION"],
  energyCost: 8,
  payload: { kind: "RUN_TEST", target: "ws-orderbook" },
  priority: 0.7,
};

const dispatchResult = mesh.dispatchTask(task);
const snapshot = mesh.snapshot();

console.log("Dispatch Result:", dispatchResult);
console.log("Mesh snapshot:", JSON.stringify(snapshot, null, 2));
