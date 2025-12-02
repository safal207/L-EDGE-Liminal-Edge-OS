export type RhythmMode = "baseline" | "focus" | "deep" | "recovery";

export interface RhythmProfile {
  /**
   * Текущий режим работы дыхания: базовая стабильность, фокус, глубокое погружение или восстановление.
   */
  mode: RhythmMode;
  /**
   * Частота дыхательных циклов в условных тактах времени.
   */
  frequency: number;
  /**
   * Глубина цикла: сколько внутренних состояний и подсистем проходит обработку за один цикл.
   */
  depth: number;
  /**
   * Фазовый сдвиг относительно других слоёв (0–1), помогает синхронизировать дыхание с циркуляцией и восприятием.
   */
  phase: number;
}

export interface BreathingStateSnapshot {
  /**
   * Метка времени, когда фиксируется текущее состояние дыхания.
   */
  timestamp: number;
  /**
   * Режим, в котором находится система во время замера.
   */
  mode: RhythmMode;
  /**
   * Итоговая нагрузка на организм (от 0 до 1 или любая нормализованная шкала).
   */
  loadFactor: number;
  /**
   * Уровень ошибок или аномалий, влияющих на дыхательный цикл.
   */
  errorLevel: number;
  /**
   * Доступный ресурс для вычислений и адаптации в текущем цикле.
   */
  energyAvailable: number;
}

export interface L29RespirationEngine {
  /**
   * Текущий ритмический профиль, по которому движется дыхание системы.
   */
  currentProfile: RhythmProfile;

  /**
   * Вдох: сбор входных стимулов и предварительная подготовка состояния.
   */
  inhale(prev: BreathingStateSnapshot): BreathingStateSnapshot;
  /**
   * Метаболизм: переработка входа, оценка нагрузки и распределение энергии.
   */
  process(state: BreathingStateSnapshot): BreathingStateSnapshot;
  /**
   * Выдох: фиксация результатов и отдача эффекта наружу.
   */
  exhale(state: BreathingStateSnapshot): BreathingStateSnapshot;
  /**
   * Интеграция: обновление глобальных регистров состояния после цикла.
   */
  integrate(state: BreathingStateSnapshot): BreathingStateSnapshot;

  /**
   * Адаптация ритма под текущий снимок состояния организма.
   */
  adjustProfile(state: BreathingStateSnapshot): void;
}
