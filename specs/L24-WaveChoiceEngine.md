# L24 — Wave-Choice Engine (WCE)

> Слой органической удачи и резонансного выбора пути

---

## 1. Назначение слоя

L24 отвечает за **выбор лучшего варианта поведения / траектории** из множества возможных опций на основе:

- состояния среды (L23 — Informational Fluid / Meta-Stability),
- вектора воли/удачи (L21 — Luck / Will Vector),
- текущего контекста задачи (цели, горизонта, ограничений),
- набора возможных опций (`WaveOption[]`).

Цель: не просто "выбрать максимум функции", а найти траекторию максимального **резонанса** между:

- внутренним состоянием,
- внешней ситуацией,
- долгосрочной целью.

Так реализуется **органическая удача** — не магия, а синхронизация слоёв.

---

## 2. Входные сущности

### 2.1. `WaveOption`

Кандидат для выбора — вариант действия или траектории.

```ts
export interface WaveOption {
  id: string;
  label: string;
  description?: string;

  // Прогнозируемая "выгода" (0..1): 0 — нет пользы, 1 — максимум эффекта
  predictedGain: number;

  // Прогнозируемый риск (0..1): 0 — нет риска, 1 — высокий риск
  predictedRisk: number;

  // Горизонт реализации в миллисекундах
  timeHorizonMs: number;

  // Какие регионы среды будут затронуты этой опцией
  targetRegions?: string[];

  // Семантические теги: "stability", "growth", "family-safe", "aggressive", ...
  tags?: string[];
}
```

### 2.2. `WaveContext`

Контекст выбора: зачем вообще принимается решение.

```ts
export interface WaveContext {
  goalDescription: string;
  horizonMs?: number;

  // Жёсткие ограничения: например, "avoid:critical-health-impact"
  hardConstraints?: string[];

  // Предпочитаемые теги и направления
  preferredTags?: string[];

  // Запрещённые теги
  forbiddenTags?: string[];

  timestamp: number;
}
```

### 2.3. `LuckVector` (из L21)

Упрощённый интерфейс (фактическая реализация хранится в L21):

```ts
export interface LuckVector {
  focusTags: string[];
  riskAppetite: number; // 0..1: 0 — минимальный риск, 1 — готовность к высоким рискам
  changeDrive: number;  // 0..1: 0 — стремление сохранять статус-кво, 1 — стремление к изменениям
}
```

### 2.4. `InformationalFluidSnapshot` (из L23)

Снимок состояния информационной среды:

```ts
export type Phase = "fluid" | "metastable" | "frozen" | "vapor";

export interface CrystalPattern {
  phase: Phase;
  coherence: number;  // 0..1: структурированность
  plasticity: number; // 0..1: способность менять форму
  inertia: number;    // 0..1: сопротивление изменениям
}

export interface FluidRegionState {
  id: string;
  pattern: CrystalPattern;
  lastUpdatedAt: number;
}

export interface InformationalFluidSnapshot {
  generatedAt: number;
  regions: Record<string, FluidRegionState>;
}
```

---

## 3. Выходные сущности

### 3.1. `WaveScore`

Подробная оценка опции:

```ts
export interface WaveScore {
  resonanceScore: number;   // 0..1: резонанс со средой L23
  luckAlignment: number;    // 0..1: согласованность с LuckVector (L21)
  environmentRisk: number;  // 0..1: риск, вытекающий из состояния среды
  structuralRisk: number;   // 0..1: внутренний риск опции (predictedRisk)
  combinedScore: number;    // интегральный балл (может быть >1 или <0)
}
```

### 3.2. `RankedWaveOption`

```ts
export interface RankedWaveOption {
  option: WaveOption;
  score: WaveScore;
}
```

### 3.3. `WaveDecision`

```ts
export interface WaveDecision {
  chosen: WaveOption | null;
  ranked: RankedWaveOption[];
  context: WaveContext;
  reasonSummary: string;
}
```

---

## 4. Конфигурация

### 4.1. `WaveChoiceConfig`

```ts
export interface WaveChoiceConfig {
  weightResonance: number; // вес резонанса среды
  weightLuck: number;      // вес совпадения с вектором воли
  weightRisk: number;      // насколько штрафуем риск
  weightGain: number;      // насколько ценим выгоду

  // Порог ниже которого выбор не делается (можно вернуть chosen = null)
  minimalAcceptableScore?: number;
}
```

Рекомендуемые дефолтные значения для начала:

```ts
const defaultConfig: WaveChoiceConfig = {
  weightResonance: 0.4,
  weightLuck: 0.3,
  weightRisk: 0.4,
  weightGain: 0.5,
  minimalAcceptableScore: undefined,
};
```

---

## 5. Логика расчёта

Для каждой опции:

1. **Расчёт `environmentRisk` и `resonanceScore`:**

   По каждому региону `targetRegions` смотрим:

   - `phase`:
     - `fluid` → базовый риск низкий, резонанс выше
     - `metastable` → средний риск, резонанс зависит от `coherence`
     - `frozen` → высокий риск для резких изменений
     - `vapor` → хаос, высокий риск, низкий резонанс

   - `coherence`:
     - высокая структурированность (~1) → предсказуемость, можно аккуратно менять
     - низкая → хаотичность, рост риска

   Результат агрегируется в 0..1:

   - `environmentRisk` — усреднение рисков по регионам
   - `resonanceScore` — усреднение "мягкости" взаимодействия с регионами

   Если `targetRegions` не указаны, используется нейтральное значение:

   - `environmentRisk ≈ 0.5`
   - `resonanceScore ≈ 0.5`

2. **Расчёт `luckAlignment`:**

   Учитывается:

   - совпадение `tags` и `focusTags`
   - соответствие `predictedRisk` и `riskAppetite`
   - соответствие `timeHorizonMs` и `changeDrive` (быстрые/медленные изменения)

   Примерно:

   ```ts
   luckAlignment =
     0.5 * tagOverlap +
     0.25 * riskMatch +
     0.25 * changeMatch;
   ```

3. **Совокупный риск**

   ```ts
   structuralRisk = clamp01(option.predictedRisk);

   const riskPenalty =
     (environmentRisk + structuralRisk) / 2 * config.weightRisk;
   ```

4. **Итоговый балл**

   ```ts
   const combinedScore =
     resonanceScore * config.weightResonance +
     luckAlignment  * config.weightLuck +
     option.predictedGain * config.weightGain -
     riskPenalty;
   ```

5. **Выбор**

   Все опции сортируются по `combinedScore` по убыванию.

   Если `minimalAcceptableScore` задан и лучший `combinedScore` ниже порога — `chosen = null`.

   Иначе `chosen = ranked[0].option`.

---

## 6. Класс `WaveChoiceEngine`

Интерфейс:

```ts
export class WaveChoiceEngine {
  constructor(config?: Partial<WaveChoiceConfig>);

  decide(
    options: WaveOption[],
    context: WaveContext,
    luck: LuckVector,
    fluid: InformationalFluidSnapshot
  ): WaveDecision;
}
```

---

## 7. Пример использования

См. `docs/examples/L24_wave_choice_demo.md` для нарративного и кодового примера.

---

## 8. Будущее развитие слоя

- Добавление истории решений (memory trace) для обучения WaveChoiceEngine.
- Адаптивная настройка WaveChoiceConfig под конкретный организм/агента.
- Интеграция с внутренним голосом (L25) для объяснения решений в человекочитаемой форме.
- Поддержка "ветвящихся" траекторий (несколько шагов вперёд).
