# LIMINAL Ontogenesis — L6: Resonance Field (waves & breathing)

## Кратко
L6 вводит резонансное дыхание трёх осей LIMINAL — личной (L), социальной (S) и космической (C). Слой строит ритмы, фазовые сдвиги
и длинные волны, опираясь на ядро ориентации L0 (orientation + polarity + fuzzy bounds + cerebellum) и Axis Coupling Layer.

Результат — живой ритм организма: не только баланс, но и волны, которые дышат вместе с мозжечком и межосевыми связями.

## Как это работает
- **Ритмы и волны.** Для каждой оси строится синусоида с фазовыми сдвигами между осями. Амплитуда и энергия зависят от стабильности
  мозжечка и рисков overshoot.
- **Coupling-aware.** Axis Coupling подмешивает baseline-flow и stiffness, усиливая или приглушая частоты.
- **Auto-adapt.** Конфиг может автоматически переключать пресет (soft/balanced/strict/circadian/focus) по телеметрии
  cerebellum + ACL.

## Основные типы
- `ResonancePreset` — набор частоты, фазовых сдвигов и весов осей.
- `ResonanceConfig` — активный пресет, maxAmplitude, recoveryBias, autoAdapt.
- `ResonanceSnapshot` — состояние волн (фаза, амплитуда, энергия), coherence/beat/energyBalance и примечание.

## Предустановки
См. `src/organism/resonance/presets.ts`:

- **soft** — мягкие частоты, лёгкие фазовые сдвиги, слабое усиление coupling.
- **balanced** — базовый режим (по умолчанию).
- **strict** — более высокая частота и couplingGain, подходит для фокусной работы.
- **circadian** — длинная волна (1/86400 Гц) для суточного дыхания.
- **focus** — ускоренный ритм для коротких фокусных спринтов.

## Конфигурация через окружение

```bash
export LIMINAL_RESONANCE_MODE=balanced   # soft|balanced|strict|circadian|focus
export LIMINAL_RESONANCE_AUTO=1          # 1 — включить автоадаптацию, 0 — фиксированный пресет
```

## Telemetry
- **coherenceIndex** — согласованность фаз между L/S/C (0..1).
- **beatIndex** — биения/интерференция волн (0..1).
- **energyBalance** — усреднённая энергия волн с учётом стабильности мозжечка и baseline-flow.
- **waves.L/S/C** — фаза, амплитуда, энергия и синусоидальный value для каждой оси.

## Интеграция в онтогенез
- Результат шага сохраняется в `OntogenesisVector.resonanceField` и в таймлайн.
- Мозжечок (L0) применяет микрокоррекции, Axis Coupling добавляет baseline-flow и stiffness, L6 переводит это в дыхание осей.

## Быстрый просмотр
В `note` блоке выводятся: выбранный пресет, coherence/beat/energy и фазы/амплитуды L/S/C. Эти строки удобно стримить в
дашборды или CLI-watchers вместе с остальными онтогенез-метриками.

