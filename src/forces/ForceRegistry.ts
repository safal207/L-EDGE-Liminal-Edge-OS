// src/forces/ForceRegistry.ts
// Реестр действующих сил (в т.ч. будущие 24 силы)

import { DecisionBus } from "../core/DecisionBus";
import { ResonantSignal } from "../core/ResonantSignal";

export type ForceHandler = (signal: ResonantSignal) => void;

export class ForceRegistry {
  private static forces: Record<string, ForceHandler> = {};
  private static initialized = false;

  /**
   * Зарегистрировать новую действующую силу.
   *
   * name — человекочитаемое имя силы, например:
   *  - "L21-Luck"
   *  - "L22-ThoughtStream"
   *  - "L23-InfoFluid"
   *  - "L24-WaveChoice"
   */
  static register(name: string, handler: ForceHandler): void {
    this.forces[name] = handler;

    if (!this.initialized) {
      this.attachToBus();
      this.initialized = true;
    }
  }

  private static attachToBus(): void {
    DecisionBus.subscribe((signal) => {
      const { target } = signal;

      if (target === "ALL" || target === null) {
        // широковещательный сигнал — всем силам
        for (const [name, handler] of Object.entries(this.forces)) {
          try {
            handler(signal);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`[ForceRegistry] handler error for ${name}:`, error);
          }
        }
      } else {
        // адресованный сигнал — только одной силе
        const handler = this.forces[target];
        if (handler) {
          try {
            handler(signal);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`[ForceRegistry] handler error for ${target}:`, error);
          }
        }
      }
    });
  }
}
