# L21 Flow & Luck Alignment Dashboard (FlowAlignment)

## 1. Что это такое

Flow & Luck Alignment Dashboard делает внутренние сигналы L21 видимыми и объяснимыми:

- **Flow Alignment (FAI)** — численная оценка танцованности/выравнивания.
- **Luck Window** — состояние окна удачи (open/soon/later + openness).
- **Cooperative Field** — командное/коллективное поле (solo/team/clustered).
- **Suggested Flow Mode** — режим, который L21 мягко предлагает (push / explore / stabilize / slow_down / pivot).
- **Flow explanations** — человекочитаемые причины выбора режима.
- **Decision impact** — сравнение решения до и после учёта потока.

Цель: перестать скрывать L21 как эвристику и дать прозрачную панель для дебага, обучения и демонстраций.

## 2. Как читать данные

Дэшборд — тонкая проекция уже вычисленных сигналов L21/L20. Мы не вводим новую логику, только отображаем существующие поля.

- `alignment.fai` → `flow_alignment.value`, `alignment.quality` → `flow_alignment.quality`.
- `luck_window` → `luck_window` (переименованы ключи в UI-стиле: `is_open` → `isOpen`, `strength/openness` → `openness`, `timing`).
- `cooperative_field.score/mode` → одноимённые поля в UI-контракте.
- `flow_suggestion.mode/confidence` → `flow_suggestion`.
- `flow_explain` → готовый список фраз для UI.
- Решения из L20 (DecisionEnvelope) сворачиваются в `decision_before_flow` / `decision_after_flow` + `decision_delta_score`.

## 3. UI-facing JSON contract

Источник: `layers/L21_FlowAlignment/L21FlowDashboard.types.ts`.

```ts
export interface L21FlowDashboardPayload {
  flow_alignment: {
    value: number;                // 0..1
    quality: "low" | "medium" | "high";
  };
  luck_window: {
    isOpen: boolean;
    openness: number;             // 0..1
    timing: "now" | "soon" | "later";
  };
  cooperative_field: {
    score: number;                // 0..1
    mode: "solo" | "team" | "clustered";
  };
  flow_suggestion: {
    mode: "stabilize" | "explore" | "push" | "pivot" | "slow_down";
    confidence: number;           // 0..1
  };
  flow_explain: string[];

  decision_before_flow?: {
    top_candidate: string;
    score: number;
  };
  decision_after_flow?: {
    top_candidate: string;
    score: number;
  };
  decision_delta_score?: number;
}
```

## 4. Пример полезной нагрузки

Добавляйте прямо в README/доку или для smoke-тестов UI:

```json
{
  "flow_alignment": {
    "value": 0.78,
    "quality": "high"
  },
  "luck_window": {
    "isOpen": true,
    "openness": 0.63,
    "timing": "now"
  },
  "cooperative_field": {
    "score": 0.71,
    "mode": "team"
  },
  "flow_suggestion": {
    "mode": "push",
    "confidence": 0.82
  },
  "flow_explain": [
    "высокий flow и открытое окно удачи",
    "сильное коллективное поле → режим push"
  ],
  "decision_before_flow": {
    "top_candidate": "Option B",
    "score": 0.52
  },
  "decision_after_flow": {
    "top_candidate": "Option A",
    "score": 0.83
  },
  "decision_delta_score": 0.31
}
```

## 5. Текстовый вайрфрейм панели

```
FLOW & LUCK ALIGNMENT (L21 Dashboard)

  Flow Alignment:  [■■■■▣] 0.78 (HIGH)
  Luck Window:     🟢 OPEN (openness: 0.63, timing: NOW)
  Coop Field:      ★★★★☆ 0.71 (TEAM)

  Suggested Mode:  PUSH (confidence: 0.82)

  Flow Explanation:
    • высокий flow и открытое окно удачи
    • сильное командное поле → режим push

  Decision Impact:
    baseline_top_candidate:   "Option B" (score 0.52)
    flow_adjusted_candidate:  "Option A" (score 0.83)
    Δ = +0.31
```

## 6. Куда дальше

- Подключить payload к простому React-панелю в ui/ или отдельном репо.
- Добавить исторический мини-график flow/luck за последние N решений.
- Показывать вклад L17/L18/L19 в итоговый flow.
- Использовать панель для настройки порогов L21, обучения новых агентов и показов инвесторам.
