import type { TemporalState, TimeCrystalVector } from "../temporal/l17-types";

export interface PurposeVector {
  /** 0..1 — насколько ядро направлено внутрь (саморазвитие, внутренняя глубина) */
  inner: number;
  /** 0..1 — насколько ядро направлено в социум (связи, служение, взаимодействие) */
  social: number;
  /** 0..1 — насколько ядро направлено в "космическое" (большие системы, будущее, планета) */
  cosmic: number;

  /**
   * Нормализуем сумму до 1 при инициализации, чтобы это был вектор, а не просто три числа.
   * (inner + social + cosmic ≈ 1)
   */

  /** Короткие смысловые теги (без эзотерики): например, ["education", "healing", "infrastructure"] */
  tags: string[];

  /** Свободное описание "зачем я здесь" (user/system supplied narrative) */
  narrative?: string;
}

/**
 * Насколько сильно система осознаёт конечность ресурса/времени.
 */
export interface FinitenessIndex {
  /** 0..1 — 0: живу как будто времени бесконечно, 1: очень острая конечность и ценность времени */
  value: number;

  /**
   * Для отладки: из чего сложился FI
   */
  timeHorizonComponent: number; // насколько короткий горизонт
  resourcePressureComponent: number; // насколько плотный ресурсный прессинг (CPU, budget, tokens)
}

/**
 * Экзистенциальная удовлетворённость / согласие с траекторией.
 */
export interface ContentmentSignal {
  /** 0..1 — 0: “я не согласен с тем, как живу/двигаюсь”, 1: “я в согласии с направлением” */
  value: number;

  /** Согласованность траектории с Purpose Vector */
  purposeAlignment: number; // 0..1

  /** Согласованность траектории с целями (из L17 GoalAlignmentScore) */
  goalAlignment: number; // 0..1

  /** Насколько траектория учитывает конечность (не прожигает / не замораживает) */
  finitenessCoherence: number; // 0..1
}

/**
 * Состояние ядра смысла.
 */
export interface MeaningKernelState {
  purpose: PurposeVector;
  finiteness: FinitenessIndex;
  contentment: ContentmentSignal;
}

/**
 * Исходные параметры для расчёта MeaningKernel.
 */
export interface MeaningKernelInput {
  temporal: TemporalState;
  timeCrystal: TimeCrystalVector;

  /** Явно заданный или выученный PurposeVector (от пользователя / системы). */
  purpose: PurposeVector;

  /**
   * Оценка ресурсов:
   * - timeBudgetSteps: сколько шагов/итераций у нас "в запасе"
   * - maxTimeBudgetSteps: некий референтный максимум (нормировка)
   * - resourceLoad: 0..1, текущая средняя нагрузка
   */
  resourceEstimate: {
    timeBudgetSteps: number;
    maxTimeBudgetSteps: number;
    resourceLoad: number; // 0..1
  };
}
