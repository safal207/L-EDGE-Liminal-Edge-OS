# Awareness Layer

Интерфейс связи с DAO_lim (FlowBalancer/Guard).

- `awarenessGateway.ts` объявляет интерфейс `AwarenessGateway` с методами `updateRoutingPolicy` и `reportAnomaly`.
- `LoggingAwarenessGateway` — заглушка, которая логирует вызовы и имитирует gRPC/HTTP вызовы в `https://github.com/safal207/DAO_lim`.
- Протокол: JSON-пакеты вида `{ policy_id, version, rules[] }` для обновлений и `{ event_id, intent, anomaly_score }` для репортов.

В следующих итерациях слой будет отправлять реальные запросы в FlowBalancer/Guard API и подписываться на политики через LTP.
