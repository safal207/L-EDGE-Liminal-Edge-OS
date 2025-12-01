// src/core/DecisionBus.ts
// Простая шина для распространения решающих импульсов по организму

import { ResonantSignal } from "./ResonantSignal";

type Listener = (signal: ResonantSignal) => void;

export class DecisionBus {
  private static listeners: Listener[] = [];

  /**
   * Отправить сигнал всем подписчикам.
   */
  static emit(signal: ResonantSignal): void {
    for (const listener of this.listeners) {
      try {
        listener(signal);
      } catch (error) {
        // Логика обработки ошибок может быть улучшена позже
        // Сейчас — просто не роняем весь bus.
        // eslint-disable-next-line no-console
        console.error("[DecisionBus] listener error:", error);
      }
    }
  }

  /**
   * Подписаться на все сигналы в системе.
   * Обычно вызывается ForceRegistry при регистрации силы.
   */
  static subscribe(listener: Listener): void {
    this.listeners.push(listener);
  }
}
