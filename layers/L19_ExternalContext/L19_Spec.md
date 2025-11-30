L19 — External Context Layer

Слой восприятия среды и адаптации организма к внешним изменениям

---

1. Назначение

L19 отвечает за трансляцию внешнего мира во внутреннюю динамику LIMINAL OS.
Каждое внешнее событие проходит последовательную цепочку преобразований:

1. Сигнал


2. Оценка важности


3. Оценка давления среды


4. Смещение смыслов


5. Влияние на фазовые состояния


6. Передача в центральные оси организма



---

2. Основные компоненты

2.1 ContextSignal

Стандартизирует внешние события.

{
  "source": "external|system|user|environment|network",
  "type": "event|metric|state|change",
  "payload": {},
  "timestamp": 0,
  "confidence": 0.0
}


---

2.2 ContextRelevance — оценка важности

Учитывает влияние события:

на текущие цели,

на устойчивость,

на смыслы,

на временную ось.


{
 "relevance": 0.0,
  "reason": ""
}


---

2.3 ContextPressure — цифровое давление среды

{
  "type": "support|challenge|neutral",
  "intensity": 0.0,
  "zone": "low|medium|high",
  "color": "#4CAF50",
  "label": "низкое давление"
}

Цветовая шкала давления:

ИнтенсивностьЦветЗначение

0.00–0.32#4CAF50низкое давление
0.33–0.65#FFC107среднее давление
0.66–1.00#F44336высокое давление

### ContextPressure

`ContextPressure` описывает, насколько сильно внешнее событие "давит" на систему
и как это можно отобразить визуально.

```json
{
  "type": "support|challenge|neutral",
  "intensity": 0.0,
  "zone": "low|medium|high",
  "color": "#4CAF50",
  "label": "низкое давление"
}

intensity — нормализованная сила давления (0..1)

zone — дискретная зона для семантики и порогов

color — базовый цвет для визуализации (зелёный/жёлтый/красный)

label — человеко-читаемое описание для логов и UI
```



---

2.4 ContextMeaningShift — смещение смыслов

{
  "delta_meaning": 0.0,
  "affected_axis": "inner|outer|goal"
}


---

2.5 ContextPhaseImpact — влияние на фазовые состояния

(Связь с L14–L16)

{
  "phase_shift": "towards_solid|towards_liquid|towards_vapor",
  "impact_strength": 0.0
}


---

2.6 ContextBridge — L19 → L17/L18/L14–16

Передаёт данные в глубинные слои.


---

3. Поток обработки

ContextSignal
    → ContextRelevance
    → ContextPressure
    → ContextMeaningShift
    → ContextPhaseImpact
    → ContextBridge


---

4. Пример

{
  "ContextSignal": {
    "source": "system",
    "type": "metric",
    "payload": {"cpu_usage": 0.83},
    "timestamp": 1732829384,
    "confidence": 0.96
  },
  "ContextRelevance": {
    "relevance": 0.82,
    "reason": "cpu_load_high"
  },
  "ContextPressure": {
    "type": "challenge",
    "intensity": 0.78,
    "zone": "medium",
    "color": "#FFC107",
    "label": "среднее давление"
  },
  "ContextMeaningShift": {
    "delta_meaning": +0.13,
    "affected_axis": "inner"
  },
  "ContextPhaseImpact": {
    "phase_shift": "towards_liquid",
    "impact_strength": 0.6
  }
}

