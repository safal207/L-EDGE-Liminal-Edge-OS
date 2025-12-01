# L25 — CellKernel / Metabolic Coordination Layer

CellKernel — ядро метаболической саморегуляции LIMINAL-организма. Оно собирает энергетику, напряжение между слоями и мягкий временной контекст, чтобы каждое решение проходило через «клеточную проверку».

> Образ: момент, когда Neo видит матрицу целиком. Не отдельные сигналы, а живую картину из энергии, напряжений и временных петель.

## Модули

### L25EnergyCore (митохондрии)
- **EnergyState**: capacity, current, recoveryRate, fatigue, level (LOW/NORMAL/HIGH/OVERDRIVE).
- **evaluateEnergyDemand(state, demand)**: решает, тянуть ли запрос энергии (OK / DEFERRED / INSUFFICIENT) с учётом усталости и приоритета.
- **updateEnergyState(state, delta)**: обновляет заряд/усталость и автоматически пересчитывает level.

### L25TensionField (цитоскелет)
- **TensionSnapshot**: список LayerTension (load/strain/stability) с меткой времени.
- **analyzeTension(snapshot)**: выдаёт TensionAlert[] — OVERLOAD, FRAGILE или BALANCED.

### L25TemporalWeave (временная решётка)
- **DecisionEvent / GoalDescriptor**: лёгкие сущности для истории и целей.
- **computeTemporalContext(history, goals)**: возвращает TemporalContext с метками tPastScore, tFuturePull, repetitionRisk и комментариями.

### L25CellKernel (сборка)
- **decideAtCellLevel(input)**: объединяет энергетику, напряжение, временной контекст и WaveDecision (L24) → выдаёт CellDecision (GO_FULL / GO_SOFT / DEFER / CANCEL) и примечание для нарратива.
- Принимает override energyDemand, иначе рассчитывает его из waveDecision.

## Поток в экосистеме L21–L24
- Шепчет **L21**: «траектория слишком дорогая — усилить другую вероятность».
- Даёт **L22 ThoughtStream** материал: «организм устал, замедляемся?».
- Смягчает **L23 InfoFluid**: может снижать агрессивность среды.
- Корректирует **L24 Wave-Choice**: выбираем мягкий сценарий или откладываем.

## Следующие шаги
- Подключить метрики к DecisionBus, чтобы L21–L23 реагировали на CellDecision.
- Привязать debug-метрики на Flow Dashboard (заряд, усталость, напряжения, temporal markers).
- Эволюционировать метаболизм: типы топлива (когнитивное/эмоциональное/вычислительное), кривые восстановления и стресс-тесты.
