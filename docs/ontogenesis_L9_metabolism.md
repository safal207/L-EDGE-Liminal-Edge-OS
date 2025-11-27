# LIMINAL Ontogenesis — L9: Metabolic Layer

L9 добавляет метаболическое наблюдение за трёхосевой системой (L/S/C),
оценивая, сколько энергии доступно, где начинается перегрузка и когда
нужно смягчить нагрузку или перейти в восстановление.

## Ключевые идеи

- **energy / stress / recovery** — для каждой оси L/S/C рассчитывается
  доступная энергия, уровень стресса и глубина восстановления.
- **metabolicMode** — глобальный режим системы:
  - `normal` — нагрузка в пределах нормы,
  - `overload` — заметный перегруз, нужен slowdown,
  - `recovery` — мягкое восстановление уже идёт,
  - `deep_recovery` — система выведена в глубокий отдых.
- **overloadAxes** — список осей, которые попали в красную зону.
- **recommendedSlowdown / recommendedDeepRest** — подсказки для верхних
  слоёв (резонанс, потоки, намерения), как смещать фокус.

## Откуда берутся сигналы

- `triAxis` — L/S/C с nourishement/pressure (сшивается из Orientation +
  SomaFlow).
- `loadIndex` — общая нагрузка из `LoadProfile.globalStress`.
- `resonanceQuality` — согласованность резонансного поля (L6).
- `recentRecoveryIndex` — ощущение, насколько система отдыхала (на
  основе глобального питания/усталости SomaFlow).

## Выход: `MetabolicSnapshot`

```ts
interface MetabolicSnapshot {
  mode: 'normal' | 'overload' | 'recovery' | 'deep_recovery';
  totalEnergy: number;
  totalStress: number;
  totalRecovery: number;
  axes: AxisMetabolicState[]; // L/S/C
  overloadAxes: AxisId[];
  recommendedSlowdown: boolean;
  recommendedDeepRest: boolean;
  note?: string;
}
```

## Как читать

- **Высокий `totalStress` + низкий `totalRecovery`** → переход в
  `deep_recovery`, стоит гасить резонанс/нагрузку.
- **Overload только на одной оси** → можно перераспределить фокус через
  SomaFlow или снизить нагрузку в соответствующем слое (L4–L6).
- **Высокий `totalRecovery` при умеренном стрессе** → система уже
  восстанавливается, достаточно мягкого режима `recovery`.

## Интеграция

В `systemContext` метаболический снимок вычисляется на каждом heartbeat
после SomaFlow и добавляется в `OntogenesisVector` как слой `L9` вместе
с общей временной линией.

## Переменные окружения

На первом шаге конфиг задаётся дефолтами в коде. При необходимости можно
добавить чувствительность/пороговые значения через ENV, по аналогии с
пресетами для ориентации и резонанса.

