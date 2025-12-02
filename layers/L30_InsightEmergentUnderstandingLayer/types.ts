export interface EmergentLink {
  /**
   * Уникальный идентификатор инсайта или новой связи.
   */
  id: string;
  /**
   * Человеко-понятное описание инсайта.
   */
  description: string;
  /**
   * Слои или органы, на стыке которых возник инсайт.
   */
  originLayers: string[];
  /**
   * Момент формирования инсайта (timestamp).
   */
  createdAt: number;
  /**
   * Уверенность системы в устойчивости новой связи.
   */
  confidence: number;
}

export interface InsightState {
  /**
   * Напряжение между слоями (несоответствие ожиданий и текущих траекторий).
   */
  tension: number;
  /**
   * Степень синхронизации с дыханием и ритмом L29.
   */
  rhythmAlignment: number;
  /**
   * Окно удачи и временной возможности из L21.
   */
  temporalOpportunity: number;
  /**
   * Доступная энергетика и ресурсные буферы из L26–L28.
   */
  energy: number;
  /**
   * Итоговый интегральный показатель, готов ли организм к вспышке инсайта.
   */
  score: number;
}

export interface InsightTrigger {
  /**
   * Анализирует состояние и определяет, созрели ли условия для инсайта.
   */
  shouldTrigger(state: InsightState): boolean;
}

export interface ResonanceAnalyzer {
  /**
   * Сканирует резонанс между ключевыми слоями и вычисляет напряжение.
   */
  scan(): InsightState;
}

export interface EmergentMapper {
  /**
   * Формирует новую связь или паттерн на основе текущего состояния.
   */
  create(state: InsightState): EmergentLink;
}

export interface TemporalSelector {
  /**
   * Определяет лучший момент для применения инсайта.
   */
  select(state: InsightState): number;
}

export interface IntegrationWeaver {
  /**
   * Встраивает новый инсайт, сохраняя целостность ритмов и иммунитета.
   */
  weave(link: EmergentLink): void;
}

export interface L30InsightEngine {
  /**
   * Получает метрики резонанса и обновляет state.
   */
  analyze(state: InsightState): InsightState;
  /**
   * Проверяет, стоит ли инициировать вспышку инсайта.
   */
  shouldTrigger(state: InsightState): boolean;
  /**
   * Создаёт новую связь, когда score превышает порог.
   */
  createEmergentLink(state: InsightState): EmergentLink;
  /**
   * Вплетает инсайт в организм для долговременного эффекта.
   */
  integrate(link: EmergentLink): void;
}
