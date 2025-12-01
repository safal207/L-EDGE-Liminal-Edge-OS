# L24 Wave-Choice Demo

Мини-пример того, как слой L24 (Wave-Choice Engine) выбирает траекторию
на основе среды (L23) и вектора воли/удачи (L21).

---

## 1. Состояние среды (Informational Fluid — L23)

Предположим, что у нас есть три региона:

- `finance` — метастабильный (на грани перелома, но ещё управляемый),
- `family` — текучий, поддерживающий,
- `health` — "замороженный" (ресурса мало, перегружать нельзя).

Условно:

```ts
import { type InformationalFluidSnapshot } from "../../src/layers/L23_informational_fluid";

const fluidSnapshot: InformationalFluidSnapshot = {
  lastGlobalUpdate: Date.now(),
  regions: {
    finance: {
      regionId: "finance",
      pattern: { phase: "metastable", coherence: 0.7, plasticity: 0.6, inertia: 0.6 },
      recentImprints: [],
    },
    family: {
      regionId: "family",
      pattern: { phase: "fluid", coherence: 0.8, plasticity: 0.7, inertia: 0.5 },
      recentImprints: [],
    },
    health: {
      regionId: "health",
      pattern: { phase: "frozen", coherence: 0.9, plasticity: 0.2, inertia: 0.9 },
      recentImprints: [],
    },
  },
};
```

---

## 2. Вектор воли / удачи (L21)

Организм хочет изменений, но не любой ценой:

```ts
import { type LuckVector } from "../../src/layers/L24_trajectory_harmonizer";

const luck: LuckVector = {
  focusTags: ["stability", "long-term", "family-safe"],
  riskAppetite: 0.4, // умеренный риск
  changeDrive: 0.6, // хочется сдвигов, но без разрушения
};
```

---

## 3. Кандидаты-опции (`WaveOption[]`)

Три сценария:

1. **T1 — агрессивный рывок**
   Быстрый и рискованный поворот в финансах с нагрузкой на здоровье.

2. **T2 — мягкий разворот**
   Постепенная перенастройка финансов, опираясь на семейную поддержку.

3. **T3 — статус-кво**
   Оставить всё как есть.

```ts
import { type WaveOption } from "../../src/layers/L24_wave_choice_engine";

const options: WaveOption[] = [
  {
    id: "T1",
    label: "Aggressive financial pivot",
    description: "Резкая перенастройка финансовых потоков",
    predictedGain: 0.9,
    predictedRisk: 0.8,
    timeHorizonMs: 180 * 24 * 60 * 60 * 1000, // 6 месяцев
    targetRegions: ["finance", "health"],
    tags: ["growth", "aggressive", "short-term"],
  },
  {
    id: "T2",
    label: "Gentle course correction",
    description: "Плавная корректировка стратегии с опорой на семью",
    predictedGain: 0.7,
    predictedRisk: 0.5,
    timeHorizonMs: 365 * 24 * 60 * 60 * 1000, // 1 год
    targetRegions: ["finance", "family"],
    tags: ["stability", "long-term", "family-safe"],
  },
  {
    id: "T3",
    label: "Maintain current state",
    description: "Сохранить текущую стратегию без существенных изменений",
    predictedGain: 0.1,
    predictedRisk: 0.1,
    timeHorizonMs: 365 * 24 * 60 * 60 * 1000,
    targetRegions: ["finance"],
    tags: ["status-quo", "low-risk"],
  },
];
```

---

## 4. Контекст решения

```ts
import { type WaveContext } from "../../src/layers/L24_wave_choice_engine";

const context: WaveContext = {
  goalDescription: "Стабилизировать финансовую траекторию без разрушения здоровья и семьи",
  horizonMs: 365 * 24 * 60 * 60 * 1000,
  hardConstraints: ["avoid:critical-health-impact"],
  preferredTags: ["stability", "family-safe"],
  forbiddenTags: [],
  timestamp: Date.now(),
};
```

---

## 5. Запуск `WaveChoiceEngine`

```ts
import { WaveChoiceEngine } from "../../src/layers/L24_wave_choice_engine";

const engine = new WaveChoiceEngine({
  weightResonance: 0.4,
  weightLuck: 0.3,
  weightRisk: 0.4,
  weightGain: 0.5,
});

const decision = engine.decide(options, context, luck, fluidSnapshot);

console.log("Chosen:", decision.chosen?.id, decision.chosen?.label);
console.log("Reason:", decision.reasonSummary);
console.table(
  decision.ranked.map((r) => ({
    id: r.option.id,
    label: r.option.label,
    resonance: r.score.resonanceScore.toFixed(2),
    luck: r.score.luckAlignment.toFixed(2),
    envRisk: r.score.environmentRisk.toFixed(2),
    structRisk: r.score.structuralRisk.toFixed(2),
    combined: r.score.combinedScore.toFixed(3),
  })),
);
```

---

## 6. Ожидаемое поведение

**T1 (Aggressive)**

- Даёт большую выгоду, но:
  - опирается на `health` с фазой `frozen` (риск перегруза),
  - имеет высокий `predictedRisk`.
- → Высокий `environmentRisk` и `structuralRisk`, комбинированный балл снижается.

**T2 (Gentle)**

- Опирается на `family` (`fluid`, поддержка),
- аккуратно работает с `finance`,
- совпадает с тегами `focusTags` и `preferredTags`.
- → Хороший `resonanceScore`, высокий `luckAlignment`, умеренный риск.
- → Должен стать `chosen`.

**T3 (Status-quo)**

- Риск минимален, но:
  - `predictedGain` низкий,
  - противоречит `changeDrive = 0.6` (хочется изменений).
- → Получает низкий совокупный балл относительно T2.

Итог:

> Система выбирает T2 как траекторию максимального резонанса:
> не ломать организм, но двигаться к цели.

Это и есть практическая реализация "органической удачи" на уровне архитектуры.
