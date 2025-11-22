# Interoception / SenseEngine

Новый орган, который переводит внутренние метрики организма в «ощущения тела». InteroceptionEngine собирает мягкие сигналы из heartbeat/homeostasis/reflex/sleep/replay/perception/transmutation и формирует снимок усталости, напряжения, энтропийного давления и перегруза.

- **Файлы:** `interoception/interoceptionEngine.ts`, `interoception/contracts.ts`.
- **Основные состояния:** `fatigue`, `tension`, `entropyPressure`, `readiness`, `clarity`, `overload`, `status`, `annotations`.
- **Интеграция:** вызывается на каждом heartbeat, отдаёт сводку через `/api/system/interoception` и включается в `/api/system/health`.

Минимальный сценарий:
1. Сигналы сна/стресса/шумов собираются в контекст.
2. InteroceptionEngine считает усталость/напряжение/перегруз и маркирует аномалии.
3. Состояние доступно Intent/Reflex/Homeostasis как «внутреннее чувство организма».
