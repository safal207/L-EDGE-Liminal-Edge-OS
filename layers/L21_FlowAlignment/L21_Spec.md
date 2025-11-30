# L21 — Flow Alignment Layer (Axis-F)
## Ось удачи, танцованности и выравнивания с полем

---

## 1. Назначение

L21 отвечает за оценку того, **насколько текущее состояние организма и возможные действия
"вписаны" в общий поток**:

- внутренний смысл (L18),
- временная траектория и возрастная фаза (L17),
- фазовое состояние и метастабильность (L14–L16),
- внешний контекст и давление среды (L19),
- коллективная конфигурация (при наличии других агентов/узлов).

Результат работы L21:

- **Flow Alignment Index (FAI)** — численная оценка "танцованности",
- **Luck Window** — детектор "окон удачи",
- **Cooperative Field** — показатели командного/коллективного выравнивания,
- **Flow Suggestion** — мягкий режим ("stabilize/explore/push/..."), который может использовать L20.

L21 **ничего не приказывает** — он выступает сенсором оси удачи/flow.  
Решения остаются за L20 (Resonant Decision Orchestrator).

---

## 2. Входы L21 (FlowInputs)

L21 собирает входы из уже существующих слоёв:

- L17 — TimeCrystal (возрастная/временная фаза, TMI, дрейф),
- L18 — Meaning Kernel (purpose, finiteness, contentment),
- L14–L16 — фазовое/метастабильное состояние,
- L19 — ExternalContext (давление, релевантность, смысловой сдвиг),
- (опционально) многопользовательские/мультиагентные данные.

Базовая структура входа:

```json
{
  "time": {
    "age_phase": "Lx",
    "tmi": 0.0,
    "drift": 0.0
  },
  "meaning": {
    "purpose_alignment": 0.0,
    "contentment": 0.0,
    "finiteness": 0.0
  },
  "phase": {
    "state": "solid|liquid|vapor",
    "stability": 0.0
  },
  "context": {
    "pressure_type": "support|challenge|neutral",
    "pressure_intensity": 0.0,
    "relevance": 0.0
  },
  "collective": {
    "cohesion": 0.0,
    "pass_network": 0.0,
    "conflict_level": 0.0
  }
}

L21 не привязан к конкретной реализации слоёв: достаточно, чтобы вышестоящие модули сформировали вход в таком формате.

---

3. Flow Alignment Index (FAI)

Главная метрика слоя:

{
  "fai": 0.0,
  "inner_alignment": 0.0,
  "social_alignment": 0.0,
  "cosmic_alignment": 0.0,
  "phase_fit": 0.0,
  "context_fit": 0.0
}

Смыслы:

fai — общий индекс "танцованности" и удачного выравнивания,

inner_alignment — согласованность с внутренним смыслом (L18),

social_alignment — согласованность с социальным/семейным/командным полем,

cosmic_alignment — согласованность с долгими циклами и "большой рамкой" (время, большие цели),

phase_fit — насколько текущее направление не ломает фазу (solid/liquid/vapor),

context_fit — насколько шаг/состояние проходят через текущее давление среды (L19) без лишнего трения.


FAI = агрегированная оценка:
чем он выше, тем больше ощущение "удачи", flow и естественного складывания событий.

---

4. Luck Window Detector

Luck Window — это состояние, когда комбинация:

высоких fai,

подходящей фазы,

адекватного контекстного давления,

и/или хорошего коллективного поля


создаёт окно повышенной вероятности удачных исходов.

Структура:

{
  "luck_window": {
    "is_open": false,
    "strength": 0.0,
    "expected_duration_steps": 0,
    "recommended_mode": "stabilize|explore|push|pivot"
  }
}

Интерпретация:

is_open — открыто ли окно удачи сейчас,

strength — насколько оно "широкое" (0..1),

expected_duration_steps — на сколько шагов вперёд можно рассчитывать на повышение удачи,

recommended_mode — общий режим поведения, который лучше вписывается в окно:

stabilize — закрепить, не ломать,

explore — аккуратно исследовать новые траектории,

push — можно смело усиливать активность,

pivot — мягко переориентироваться.



---

5. Cooperative Field (коллективное поле)

Для многопользовательских/мультиагентных сценариев:

{
  "cooperative_field": {
    "cohesion": 0.0,
    "spacing": 0.0,
    "passing_lanes": 0.0,
    "conflict_level": 0.0
  }
}

cohesion — связанность / сплочённость "команды",

spacing — правильное "раскрытие по позициям" (не мешают ли друг другу),

passing_lanes — насколько много "линий паса" и взаимодействий,

conflict_level — уровень внутренних конфликтов.


Это отражает:

танцевальный ансамбль,

футбольную команду,

команду инженеров или агентов, которые либо мешают друг другу, либо усиливают.



---

6. Flow Suggestion (мягкий режим)

L21 может сформировать мягкое предложение о том, в каком режиме лучше двигаться на основе FAI, Luck Window и Cooperative Field:

{
  "flow_suggestion": {
    "mode": "stabilize|explore|push|pivot|slow_down",
    "confidence": 0.0,
    "reasoning": {
      "fai": 0.0,
      "luck_window": true,
      "luck_strength": 0.0,
      "context_pressure_type": "challenge",
      "phase_state": "liquid"
    }
  }
}

Это не команда, а тонкая настройка для L20:

при mode = stabilize L20 может отдавать приоритет кандидатам, которые увеличивают устойчивость и опору;

при mode = push — кандидатам, которые расширяют, но не ломают фазу;

при mode = slow_down — мягкий тормоз и бережное отношение к ресурсу.



---

7. Выход L21

Полный ответ L21:

{
  "inputs": { /* нормализованный FlowInputs */ },
  "alignment": {
    "fai": 0.81,
    "inner_alignment": 0.84,
    "social_alignment": 0.79,
    "cosmic_alignment": 0.76,
    "phase_fit": 0.8,
    "context_fit": 0.73
  },
  "luck_window": {
    "is_open": true,
    "strength": 0.82,
    "expected_duration_steps": 3,
    "recommended_mode": "stabilize"
  },
  "cooperative_field": {
    "cohesion": 0.75,
    "spacing": 0.78,
    "passing_lanes": 0.8,
    "conflict_level": 0.2
  },
  "flow_suggestion": {
    "mode": "stabilize",
    "confidence": 0.88,
    "reasoning": {
      "fai": 0.81,
      "luck_window": true,
      "luck_strength": 0.82,
      "context_pressure_type": "challenge",
      "phase_state": "liquid"
    }
  }
}

Эта структура может напрямую использоваться:

L20 (Resonant Decision Orchestrator),

визуальными панелями,

коуч-режимами,

логами для анализа "почему система выбрала такой шаг".



---

---

## 🧠 `index.js` (каркас)

```js
import { buildFlowInputs } from "./FlowInputs.js";
import { computeFlowAlignmentIndex } from "./FlowAlignmentIndex.js";
import { detectLuckWindow } from "./LuckWindowDetector.js";
import { evaluateCooperativeField } from "./CooperativeField.js";
import { buildFlowSuggestion } from "./FlowSuggestion.js";

/**
 * L21 — Flow Alignment Layer (Axis-F)
 * Сенсор удачи / танцованности / выравнивания с полем
 */
export function L21_FlowAlignment(innerState, contextState, phaseState, collectiveState = null) {
  const inputs = buildFlowInputs(innerState, contextState, phaseState, collectiveState);

  const alignment = computeFlowAlignmentIndex(inputs);
  const luckWindow = detectLuckWindow(inputs, alignment);
  const cooperativeField = evaluateCooperativeField(inputs, collectiveState);
  const flowSuggestion = buildFlowSuggestion(inputs, alignment, luckWindow, cooperativeField);

  return {
    inputs,
    alignment,
    luck_window: luckWindow,
    cooperative_field: cooperativeField,
    flow_suggestion: flowSuggestion
  };
}
```

---

🧩 Заготовки модулей

FlowInputs.js

```js
export function buildFlowInputs(innerState = {}, contextState = {}, phaseState = {}, collectiveState = null) {
  return {
    time: {
      age_phase: innerState.time?.age_phase ?? "L0",
      tmi: innerState.time?.tmi ?? 0,
      drift: innerState.time?.drift ?? 0
    },
    meaning: {
      purpose_alignment: innerState.meaning?.purpose_alignment ?? 0,
      contentment: innerState.meaning?.contentment ?? 0,
      finiteness: innerState.meaning?.finiteness ?? 0
    },
    phase: {
      state: phaseState.state ?? "liquid",
      stability: phaseState.stability ?? 0.5
    },
    context: {
      pressure_type: contextState.pressure_type ?? "neutral",
      pressure_intensity: contextState.pressure_intensity ?? 0,
      relevance: contextState.relevance ?? 0
    },
    collective: {
      cohesion: collectiveState?.cohesion ?? 0,
      pass_network: collectiveState?.pass_network ?? 0,
      conflict_level: collectiveState?.conflict_level ?? 0
    }
  };
}
```

FlowAlignmentIndex.js

```js
export function computeFlowAlignmentIndex(inputs) {
  const { time, meaning, phase, context, collective } = inputs;

  const inner_alignment = avg([
    meaning.purpose_alignment,
    meaning.contentment,
    1 - Math.abs(time.drift)
  ]);

  const social_alignment = avg([
    collective.cohesion,
    collective.pass_network,
    1 - collective.conflict_level
  ]);

  const cosmic_alignment = avg([
    meaning.finiteness,
    time.tmi
  ]);

  const phase_fit = phase.stability;
  const context_fit = 1 - context.pressure_intensity * (context.pressure_type === "challenge" ? 0.7 : 0.4);

  const fai = avg([
    inner_alignment,
    social_alignment,
    cosmic_alignment,
    phase_fit,
    context_fit
  ]);

  return {
    fai: clamp01(fai),
    inner_alignment: clamp01(inner_alignment),
    social_alignment: clamp01(social_alignment),
    cosmic_alignment: clamp01(cosmic_alignment),
    phase_fit: clamp01(phase_fit),
    context_fit: clamp01(context_fit)
  };
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + (b ?? 0), 0) / arr.length;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v ?? 0));
}
```

LuckWindowDetector.js

```js
export function detectLuckWindow(inputs, alignment) {
  const fai = alignment.fai;
  const pressure = inputs.context.pressure_intensity;
  const phaseStability = inputs.phase.stability;

  const is_open = fai > 0.7 && phaseStability > 0.5;
  const strength = clamp01((fai - 0.7) * 2 * phaseStability * (1 - pressure));

  let expected_duration_steps = 0;
  if (is_open) {
    if (strength > 0.8) expected_duration_steps = 3;
    else if (strength > 0.5) expected_duration_steps = 2;
    else expected_duration_steps = 1;
  }

  const recommended_mode = chooseRecommendedMode(fai, pressure, phaseStability);

  return {
    is_open,
    strength,
    expected_duration_steps,
    recommended_mode
  };
}

function chooseRecommendedMode(fai, pressure, phase) {
  if (fai > 0.8 && pressure < 0.4 && phase > 0.6) return "push";
  if (fai > 0.7 && pressure < 0.6) return "explore";
  if (pressure > 0.7) return "stabilize";
  if (phase < 0.4) return "slow_down";
  return "stabilize";
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v ?? 0));
}
```

CooperativeField.js

```js
export function evaluateCooperativeField(inputs, collectiveState) {
  const c = inputs.collective;

  const cohesion = c.cohesion ?? 0;
  const spacing = c.pass_network ?? 0; // упрощённо считаем, что чем больше линий паса, тем лучше "раскрытие"
  const conflict_level = c.conflict_level ?? 0;
  const passing_lanes = c.pass_network ?? 0;

  return {
    cohesion,
    spacing,
    passing_lanes,
    conflict_level
  };
}
```

FlowSuggestion.js

```js
export function buildFlowSuggestion(inputs, alignment, luckWindow, cooperativeField) {
  const fai = alignment.fai;
  const pressure = inputs.context.pressure_intensity;
  const phase = inputs.phase.stability;

  let mode = "stabilize";

  if (luckWindow.is_open) {
    if (luckWindow.recommended_mode) {
      mode = luckWindow.recommended_mode;
    } else if (fai > 0.8 && pressure < 0.5 && phase > 0.6) {
      mode = "push";
    } else if (fai > 0.7) {
      mode = "explore";
    }
  } else {
    if (pressure > 0.7 || phase < 0.4) {
      mode = "slow_down";
    } else {
      mode = "stabilize";
    }
  }

  const confidence = computeConfidence(fai, luckWindow, phase, pressure);

  return {
    mode,
    confidence,
    reasoning: {
      fai,
      luck_window: luckWindow.is_open,
      luck_strength: luckWindow.strength,
      context_pressure_type: inputs.context.pressure_type,
      phase_state: inputs.phase.state
    }
  };
}

function computeConfidence(fai, luckWindow, phase, pressure) {
  let base = fai;
  if (luckWindow.is_open) base += luckWindow.strength * 0.2;
  base += (phase - pressure) * 0.1;
  return Math.max(0, Math.min(1, base));
}
```

---

Если хочешь, следующим шагом можем:

сделать маленький /examples/L21_flow_demo,

или сразу добавить в L20 использование flow_suggestion.mode (то есть L20 будет подстраивать веса RSTE под режим stabilize/explore/push).


Но формально: L21 как слой оси удачи / Axis-F у тебя уже оформлен.
