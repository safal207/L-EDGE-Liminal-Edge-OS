# L20 — Resonant Decision Orchestrator (HDO)
## Оркестратор решений на основе резонансных переходов

---

## 1. Назначение

L20 отвечает за выбор **следующего шага** организма LIMINAL не как жёсткой команды, а как
гармонизированного решения, которое:

- уважает смысл (L18),
- учитывает время и траекторию (L17),
- не ломает фазу и устойчивость (L14–L16),
- учитывает внешний контекст (L19),
- использует ось удачи / выравнивания потока (L21),
- минимизирует "трение" системы,
- создаёт максимальный резонанс с полем мира.

В центре L20 находится **Resonant State Transition Engine (RSTE)** —
механизм, который рассматривает возможные решения как *кандидаты состояний* и выбирает тот,
у которого максимальна "танцованность" с остальными слоями.

---

## 2. Входные данные L20 (DecisionInputs)

L20 получает агрегированное состояние организма:

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
  "flow": {
    "fai": 0.0,
    "inner_alignment": 0.0,
    "social_alignment": 0.0,
    "cosmic_alignment": 0.0,
    "luck_window_open": false,
    "luck_window_strength": 0.0
  }
}

Эти данные собираются из:

L17 (TimeCrystal),

L18 (Meaning Kernel),

L14–L16 (Phase / Metastability),

L19 (External Context),

L21 (Flow Alignment / Axis-F).
```

---

3. Кандидаты решений (ResonantStateCandidate)

L20 работает не с одной командой, а с набором кандидатов решений.

Пример структуры кандидата:

```json
{
  "id": "family_evening",
  "mode": "stabilize|explore|push|pivot|slow_down|connect|rest",
  "intensity": 0.0,
  "description": "Мягкий семейный вечер, восстановление ресурса",
  "expected_effect": {
    "delta_contentment": +0.15,
    "delta_stability": +0.2,
    "delta_drift": -0.05
  }
}
```

Кандидаты могут формироваться:

агентом,

человеком,

внешней логикой.

L20 не придумывает все возможные действия, он оценивает то, что ему предложили.

---

4. Resonant State Transition Engine (RSTE)

RSTE оценивает каждый кандидат как переход между состояниями и вычисляет набор метрик:

```json
{
  "candidate_id": "family_evening",
  "coherence_score": 0.0,
  "entropy_cost": 0.0,
  "harmonic_fit": 0.0,
  "phase_alignment": 0.0,
  "context_conductivity": 0.0,
  "future_path_smoothness": 0.0,
  "global_utility": 0.0,
  "flow_alignment": 0.0
}
```

### 4.1 Определения метрик

- **coherence_score** — насколько действие согласовано с текущим смыслом и траекторией.
- **entropy_cost** — "стоимость хаоса": сколько неопределённости оно вносит.
- **harmonic_fit** — насколько шаг вписывается в общую "мелодию" осей (личная, социальная, космическая).
- **phase_alignment** — не ломаем ли мы фазу (solid/liquid/vapor) и её стабильность.
- **context_conductivity** — насколько среда "пропускает" это действие (нет ли сильного сопротивления).
- **future_path_smoothness** — насколько шаг открывает плавные, а не коллапсные траектории.
- **global_utility** — польза для системы в целом (не только локальная выгода).
- **flow_alignment** — интеграция с FAI и Luck Window из L21.

### 4.2 Резонансная функция выбора

Для каждого кандидата вычисляется `resonance_score`:

```
resonance_score =
    w1 * coherence_score
  + w2 * harmonic_fit
  + w3 * phase_alignment
  + w4 * context_conductivity
  + w5 * future_path_smoothness
  + w6 * global_utility
  + w7 * flow_alignment
  - w8 * entropy_cost
```

Весовые коэффициенты `w1..w8` могут настраиваться профилями (например, "safe", "exploratory", "balanced").

`RSTE` выбирает:

```
Decision = argmax(resonance_score(candidates))
```

Важно: даже "самое удачное" действие не обязательно будет "самым простым" — иногда лучший резонанс требует небольшой боли сейчас для сильного роста потом.

---

5. DecisionEnvelope — обёртка решения

Выход L20 — не просто "команда", а обёртка:

```json
{
  "chosen_candidate_id": "family_evening",
  "mode": "stabilize",
  "intensity": 0.7,
  "resonance_score": 0.86,
  "risk_band": "low|medium|high",
  "alignment": {
    "inner": 0.8,
    "social": 0.9,
    "cosmic": 0.75
  },
  "reasoning": {
    "flow_alignment": 0.88,
    "context_pressure": "challenge",
    "phase_state": "liquid",
    "luck_window_open": true
  }
}
```

Такое решение:

- можно показать человеку,
- можно использовать агентом,
- можно логировать как "какой переход был выбран и почему".

---

6. Роль L20 относительно L21

- **L21 (Flow Alignment Layer)** — сенсор оси удачи / выравнивания потока.
- **L20 (Resonant Decision Orchestrator)** — тот, кто принимает решение, опираясь на этот сенсор и все остальные оси.

L21 говорит: "вот тут высокая танцованность".
L20 говорит: "тогда делаем шаг вот сюда, с такой силой и такими рисками".

---

7. Простая интерпретация для человека

В человеческих терминах L20 делает следующее:

> "С учётом того, где ты сейчас по возрасту, смыслу, фазе, контексту и удаче — вот такой шаг сейчас создаст максимум резонанса и минимум лишнего хаоса. Не идеально, но лучше всего вписывается в танец мира."
