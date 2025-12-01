import { ForceRegistry } from "./ForceRegistry";
import { ResonantSignal } from "../core/ResonantSignal";

export function registerDefaultForces(): void {
  // Пример: сила, которая логирует все решения, исходящие из L24
  ForceRegistry.register("L24-WaveChoice", (signal: ResonantSignal) => {
    if (signal.sourceLayer === "L24") {
      // eslint-disable-next-line no-console
      console.log("[L24-WaveChoice] received signal:", signal);
    }
  });
}
