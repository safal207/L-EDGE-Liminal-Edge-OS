# Storage Layer

Адаптер к LiminalBD — https://github.com/safal207/LiminalBD.

- `storage.ts` определяет интерфейс `LiminalStorage`.
- `mockStorage.ts` — in-memory реализация для локальных сервисов (`edge/`, `interface/`).
- `SCHEMA.md` описывает предполагаемые коллекции (`edge_events`, `runtime_events`, `resonance_events`, `policy_decisions`).

Настоящее подключение к LiminalBD появится в следующих итерациях (gRPC/WebSocket клиент + миграции).
