# LiminalBD Schema Sketch

| Collection/Table     | Purpose                                        | Key Fields                                      |
| -------------------- | ---------------------------------------------- | ----------------------------------------------- |
| `edge_events`        | Все события, приходящие от SomaSeed узлов      | `id`, `node_id`, `type`, `payload`, `timestamp` |
| `runtime_events`     | Метрики и статусы процессов GardenLiminal      | `id`, `runtime_node`, `type`, `metadata`        |
| `resonance_events`   | Поток сигналов Inner Council / SOMA            | `id`, `channel`, `type`, `payload`              |
| `policy_decisions`   | Решения SOMA/DAO для применения на edge        | `id`, `target_node`, `policy`, `issued_at`      |
| `routing_policies`   | Конфигурации FlowBalancer/Guard                | `id`, `version`, `rules`, `source`              |
| `system_telemetry`   | Технические метрики транспортного уровня (LTP) | `id`, `session_id`, `message_type`, `metadata`  |

> В следующих итерациях слой `storage/` будет заменён на реальный клиент LiminalBD (см. https://github.com/safal207/LiminalBD).
