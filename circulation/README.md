# Circulation Layer

"Циркуляция" связывает все уровни LIMINAL EDGE в замкнутую петлю: каждое `EdgeEvent` проходит через storage → resonance → awareness → runtime → heartbeat и возвращается в виде метрик для новых SomaSeed решений.

## Файлы
- `pump.ts` — подписывается на `LiminalStorage` и `ResonanceEngine`, прогоняет события и решения по цепочке Awareness → Runtime.
- `circulationEngine.ts` — рассчитывает метрики пульса (скорость, давление, температура, насыщенность) и хранит историю.
- `types.ts` — контракт телеметрии и снимков циркуляции.

## Интеграция
- Метрики доступны через `CirculationEngine.listSnapshots()` и используются интерфейсным API `/api/system/circulation`.
- Heartbeat сохраняет циркуляцию в `storage` — будущая интеграция будет транслировать эти данные в LiminalBD / SOMA для глобального контроля кровотока.
