# LIMINAL Ontogenesis — L8: CrystalObserver (Temporal Meta-Observer & Polarity Guardian)

## Зачем нужен L8

До L8 система умела чувствовать состояние (L0), связи (ACL), ритмы (L6) и потоки (L7).
CrystalObserver добавляет внешний взгляд во времени:

- сравнивает прошлое → настоящее → тренд будущего с плановым вектором L/S/C;
- отслеживает полярность (Инь/Ян/Тао) и не даёт уходить в хронический перекос;
- сигналит, если кристалл целостности начинает трескаться: дрейф, падение согласованности, конфликт планов.

## Основные сущности

- **TemporalAlignment** — совпадение тренда с планом, близость текущего состояния к плану и дрейф от прошлой траектории.
- **PolarityCrystalState** — доминирующая полярность (yin/yang/tao/mixed), уровни yin/yang/tau и индекс симметрии.
- **CrystalObserverSnapshot** — сводный срез:
  - `integrityIndex` — цельность потоков/полярности;
  - `coherenceIndex` — согласованность резонанса с потоками;
  - `planAlignmentIndex` — совпадение тренда и текущего состояния с планом;
  - `crystalStabilityIndex` — общая устойчивость кристалла;
  - `signals` — мягкие подсказки/предупреждения/строгие стражи.

## Конфиг

```ts
const DEFAULT_CRYSTAL_OBSERVER_CONFIG = {
  time: { pastWindowSize: 128, futureProjectionHorizon: 16 },
  plan: {
    targetL: 0.34,
    targetS: 0.33,
    targetC: 0.33,
    targetPolarity: 'balanced',
    targetFlowBalance: { maxGlobalPressure: 0.7, minNourishment: 0.35 },
  },
  sensitivity: 0.7,
  strictness: 0.6,
};
```

## Как интерпретировать сигналы

- `soft_hint` — тренд отклоняется от плана, но кристалл пока цел; можно мягко перенастроить веса L/S/C.
- `warning` — сильный дрейф и падение целостности; снизить внешнюю нагрузку, перейти в мягкий резонанс.
- `critical_guard` — кристалл нестабилен; переход в recovery/tao-полярность, усилить питание L.

## Встраивание

`runCrystalObserver(history, polarity, resonance, flow, config)` вызывается после L7 в heartbeat.
Результат сохраняется в `ontogenesisVector.crystal` и доступен через `/api/system/ontogenesis` и `/timeline`.

## Связь с предыдущими слоями

- опирается на `polarity` (Инь/Ян/Тао) и `flow` (L7) для оценки целостности,
- использует `resonance` (L6) для согласованности ритмов с потоками,
- читает историю онтогенеза, чтобы сравнивать план и фактический тренд.

## Пример note

```
L8 CrystalObserver: integ=0.62 coh=0.58 plan=0.61 stab=0.60 trendAlign=0.65 pol=yin sym=0.71
```

Это читается как: кристалл целостен на ~0.62, согласованность ~0.58, тренд в целом совпадает с планом, доминирует мягкая инь-полярность при приличной симметрии.
