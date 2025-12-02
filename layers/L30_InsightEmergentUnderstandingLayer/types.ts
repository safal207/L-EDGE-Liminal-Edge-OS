export type InsightPhase = "seed" | "growing" | "mature" | "legacy";

export interface InsightMeta {
  /**
   * Уникальный идентификатор инсайта и его семени/мотивa.
   */
  id: string;
  /**
   * Момент появления инсайта (timestamp).
   */
  createdAt: number;
  /**
   * Краткое описание того, что родилось.
   */
  summary: string;
  /**
   * С какими слоями инсайт резонирует сильнее всего (L21, L25, L29, L26–L28 и т.д.).
   */
  originLayers: string[];
  /**
   * Насколько сильно инсайт «звенит» по системе (вес внимания, а не фильтр).
   */
  resonanceScore: number;
  /**
   * Текущая фаза жизни инсайта.
   */
  phase: InsightPhase;
  /**
   * Может ли инсайт менять цель или курс системы.
   */
  canAffectGoal: boolean;
}

export interface L30InsightField {
  /**
   * Регистрация нового инсайта (без цензуры или порогов).
   */
  registerInsight(summary: string, originLayers: string[]): InsightMeta;

  /**
   * Обновление фаз инсайтов во времени (дозревание, интеграция, уход в наследие).
   */
  evolveInsights(now: number): void;

  /**
   * Получение инсайтов, которые «звенят» сильнее всего в текущей конфигурации организма.
   */
  getActiveInsights(limit?: number): InsightMeta[];

  /**
   * Пометка инсайта как изменившего цель/курс системы.
   */
  markAsGoalShifting(id: string): void;
}
