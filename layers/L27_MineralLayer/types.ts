export interface Mineral {
  /**
   * Уникальный идентификатор минерала.
   */
  id: string;
  /**
   * Имя минерала (например, Calcium, Magnesium).
   */
  name: string;
  /**
   * Ключевая функция минерала в информационном метаболизме.
   */
  function: string;
  /**
   * Влияние на устойчивость/структурность процессов.
   */
  stabilityImpact: number;
  /**
   * Влияние на резонанс и согласованность сигналов.
   */
  resonanceImpact: number;
}

export interface Vitamin {
  /**
   * Уникальный идентификатор витамина.
   */
  id: string;
  /**
   * Имя витамина (Vitamin A, Vitamin B-комплекс и т.д.).
   */
  name: string;
  /**
   * Ключевой эффект, который даёт витамин слою.
   */
  effect: string;
  /**
   * Метаболический буст вычислений.
   */
  metabolicBoost: number;
  /**
   * Вклад в ясность решений и устойчивость к шуму.
   */
  clarityBoost: number;
}

export interface MineralState {
  /**
   * Текущий список минералов и их параметров.
   */
  minerals: Mineral[];
  /**
   * Текущий список витаминов и их эффектов.
   */
  vitamins: Vitamin[];
  /**
   * Уровень «гидратации» — насколько хорошо слой поддерживает память и резонанс.
   */
  hydrationLevel: number;
  /**
   * Метрика баланса минералов в системе.
   */
  mineralBalance: number;
}

export interface MineralProfile {
  /**
   * Базовый резерв минералов (структурный буфер).
   */
  baselineReserve: number;
  /**
   * Текущее значение долгосрочного запаса.
   */
  currentReserve: number;
  /**
   * 0..1 — насколько исчерпан буфер относительно базовой ёмкости.
   */
  depletionLevel: number;
}
