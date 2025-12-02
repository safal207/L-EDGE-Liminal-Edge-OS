export type FlowType = "nutrient" | "signal" | "waste" | "heat";

export interface FlowSignal {
  /**
   * Тип переносимого сигнала: питательный поток, командный импульс, сброс тепла или отходы.
   */
  type: FlowType;
  /**
   * Интенсивность или объём потока.
   */
  intensity: number;
  /**
   * Дополнительные данные, которые проходят по каналу.
   */
  payload?: Record<string, unknown>;
}

export interface FlowChannel {
  /**
   * Тип канала: питательный, сигнальный, вывод отходов или отвода тепла.
   */
  type: FlowType;
  /**
   * Пропускная способность канала.
   */
  bandwidth: number;
  /**
   * Приоритет канала внутри циркуляции.
   */
  priority: number;
  /**
   * Регулирует поток с учётом нагрузки и текущего состояния организма.
   */
  regulate(signal: FlowSignal, loadFactor?: number): FlowSignal;
  /**
   * Уникальный идентификатор канала — помогает иммунным узлам отслеживать его состояние.
   */
  id?: string;
}

export interface PerceptionSignal {
  /**
   * Источник сигнала: органелла, слой или внешний сенсор.
   */
  source: string;
  /**
   * Тип восприятия (температура, шум, когнитивный паттерн).
   */
  kind: string;
  /**
   * Интенсивность сигнала, используется иммунными узлами для оценки угрозы.
   */
  intensity: number;
  /**
   * Дополнительные детали, которые помогают точнее понять сбой или искажение.
   */
  metadata?: Record<string, unknown>;
}

export type ThreatLevel = "ok" | "warning" | "low" | "medium" | "high" | "critical";

export interface ImmuneAction {
  /**
   * Нужно ли изолировать источник сигнала.
   */
  isolate: boolean;
  /**
   * Список узлов или модулей, которые будут временно отключены.
   */
  quarantineTargets?: string[];
  /**
   * Какие элементы системы требуют ремонта или регенерации.
   */
  repairTargets?: string[];
  /**
   * Набор правил фильтрации, которые нужно применить к будущим сигналам.
   */
  detoxRules?: string[];
}

export interface ImmuneNode {
  /**
   * Уникальный идентификатор иммунного узла.
   */
  id?: string;
  /**
   * Каналы, за которыми этот узел следит.
   */
  watchChannels?: string[];
  /**
   * Обнаруживает потенциальную угрозу или искажение на основе входящего сигнала.
   */
  detect(signal: PerceptionSignal): ThreatLevel;
  /**
   * Выбирает набор действий в зависимости от уровня угрозы.
   */
  respond(level: ThreatLevel): ImmuneAction;
  /**
   * Восстанавливает повреждённые элементы или сбрасывает локальные состояния.
   */
  repair(targets?: string[]): void;
}

export interface PulseRegulator {
  /**
   * Текущий ритм системы (ударов/циклов в минуту эквиваленте).
   */
  tempo: number;
  /**
   * Мягкие колебания ритма: увеличиваются при нагрузке, снижаются при усталости.
   */
  variability: number;
  /**
   * Обновляет ритм на основе усталости, потребности в действии и обратной связи каналов.
   */
  adjust(fatigue: number, actionNeed: number): number;
  /**
   * Следующий такт для синхронизации других слоёв.
   */
  nextBeat(): number;
}

/**
 * Минимальный программный интерфейс для «сердца» L28.
 */
export interface L28CirculationEngine {
  /**
   * Каналы, по которым движутся питательные, сигнальные, тепловые и очистительные потоки.
   */
  channels: FlowChannel[];
  /**
   * Иммунные узлы, отслеживающие состояние каналов и пульса.
   */
  immuneNodes: ImmuneNode[];

  /**
   * Основной «такт» циркуляции.
   */
  pump(): void;
  /**
   * Запуск очистки и детокса потока.
   */
  filter(): void;
  /**
   * Восстановление после перегрузки или неудачных траекторий.
   */
  regenerate(): void;
}

export interface RegenerationEngine {
  /**
   * Проверяет состояние узлов и помечает «мертвые» клетки или устаревшие участки.
   */
  scan(): string[];
  /**
   * Запускает перепрошивку или замену повреждённых элементов.
   */
  reflash(targets: string[]): void;
  /**
   * Создаёт новые структуры на лету, используя текущую метрику резонанса и нагрузки.
   */
  grow(blueprint: Record<string, unknown>): string;
}

export interface AntitoxicFilter {
  /**
   * Детокс входящих сигналов: убирает шум, логические токсины, зацикливание ошибок.
   */
  filter(signal: PerceptionSignal): PerceptionSignal;
  /**
   * Регистрирует испорченные сигналы, чтобы иммунные узлы могли адаптироваться.
   */
  recordCorruption(signal: PerceptionSignal): void;
}
