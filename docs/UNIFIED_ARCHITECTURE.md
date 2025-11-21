# LIMINAL OS — Unified Architecture Blueprint

> Living internet organism spanning Edge, Transport, Runtime, Data, Resonance, Awareness, and Interface layers.

## 1. Layered System Diagram
```mermaid
flowchart TD
  subgraph Edge Layer (L-EDGE)
    A1[SomaSeed Gateways]
    A2[Liminal Guard Cells]
    A3[Worker Cells]
  end
  subgraph Transport Layer (L-THREAD / LTP)
    B1[LTP Gateway]
  end
  subgraph Runtime Layer (GardenLiminal)
    C1[Garden Pods]
    C2[Process Isolators]
  end
  subgraph Event Layer (LiminalBD)
    D1[Event Store]
    D2[Signal Index]
  end
  subgraph Resonance Layer (SOMA)
    E1[Inner Council]
    E2[Pythia]
    E3[Architect]
  end
  subgraph Awareness Layer (DAO_lim)
    F1[FlowBalancer]
    F2[Guard]
    F3[Sense Telemetry]
  end
  subgraph Interface Layer (LRI)
    G1[Liminal Context Envelope]
    G2[Operator Panel]
  end

  %% flows
  F1 -->|Intent tags + policies| A1
  A1 -->|Traffic + metrics| D1
  D1 -->|Pattern feeds| E1
  E1 -->|Policies/commands| B1
  B1 -->|Commands| C1
  C1 -->|Runtime events| D1
  D1 -->|State| F3
  D1 -->|Telemetry streams| G2
  G2 -->|Operator intents| E1
  A3 -->|Edge scripts| C1
  F2 -->|Immunity verdicts| A2
  E2 -->|Anomaly scores| F1
  E3 -->|Roadmaps + orchestrations| C1
```

**Signal Loops:**
1. **Ingress loop:** DAO_lim (Awareness) senses intents → routes via L-EDGE → logs into LiminalBD.
2. **Resonance loop:** LiminalBD feeds SOMA → SOMA issues policies via LTP → Garden orchestrates pods → pods emit runtime events back to LiminalBD.
3. **Operator loop:** LRI consumes telemetry + policies → surfaces human input → SOMA adjusts decisions → DAO_lim updates routing/guarding.

### Physical repository mapping

Iteration 1 добавляет каркас директории для каждого слоя:

| Layer | Directory | Key files |
| ----- | --------- | --------- |
| Core contracts | `core/` | `types.ts`, `constants.ts`, `systemContext.ts`, `heartbeat.ts` — базовые типы + единый контейнер и heartbeat |
| Edge SomaSeed | `edge/` | `edgeService.ts`, `edgeEventSink.ts`, `storageEdgeEventSink.ts` — HTTP `/health`, `/echo`, передача `EdgeEvent` в storage |
| Transport | `transport/` | `ltpClient.ts` — `LtpClient` интерфейс и in-memory реализация |
| Runtime adapters | `runtime/` | `runtimeAdapter.ts` — mock-интеграция с GardenLiminal и in-memory процессы |
| Storage | `storage/` | `storage.ts`, `mockStorage.ts`, `SCHEMA.md` — интерфейс к LiminalBD, TTL, фильтры, heartbeat/decisions |
| Resonance | `resonance/` | `resonanceEngine.ts` — мост к SOMA, буфер событий, генерация `PolicyDecision` |
| Awareness | `awareness/` | `awarenessGateway.ts` — контракты DAO_lim, перевод PolicyDecision → Runtime signals |
| Interface | `interface/` | `apiServer.ts`, `services/devCluster.ts` — backend для LRI `/api/*`, запуск edge+interface |
| Circulation | `circulation/` | `pump.ts`, `circulationEngine.ts`, `types.ts` — циркуляция событий + расчёт метрик кровотока |

Каждый каталог содержит README с дальнейшими шагами по интеграции с соответствующими внешними репозиториями (LiminalBD, DAO_lim, SOMA, GardenLiminal, L-THREAD, LRI).

### Event Lifecycle (Iteration 2)
1. **Edge → Storage.** `edge/edgeService.ts` принимает `/echo`, формирует `EdgeEvent` с `TraceId`, пишет через `StorageEdgeEventSink`.
2. **Storage → Resonance.** `storage/mockStorage.ts` хранит последние 300 событий и через `onEdgeEventSaved` передаёт их в `MockResonanceEngine`.
3. **Resonance batching.** `resonance/resonanceEngine.ts` буферизует события 1–2 секунды и выпускает `PolicyDecision` с метаданными оригинального события.
4. **Awareness translation.** `awareness/awarenessGateway.ts` логирует решения, превращает их в `AwarenessSignal` (start/update/stop) и отдаёт в runtime.
5. **Runtime reaction.** `runtime/runtimeAdapter.ts` обновляет in-memory процессы по ссылке на `targetNode`, сохраняет состояния для `getSystemState()`.
6. **Heartbeat & Interface.** `core/heartbeat.ts` снимает метрики (storage size, pending resonance, decisions, active runtime) и пишет их в сторадж; `interface/apiServer.ts` отдаёт `/api/system/health`, `/api/system/heartbeat`, `/api/runtime/state`, `/api/decisions`.

### Circulation Layer (Iteration 4)
1. **Circulation pump.** `circulation/pump.ts` подписывается на `storage.onEdgeEventSaved` и `resonance.onDecision`, гарантируя, что каждое `EdgeEvent` проходит Awareness → Runtime → Heartbeat без потерь.
2. **Metrics & history.** `circulation/circulationEngine.ts` вычисляет скорость потока, «температуру» resonance, давление сигналов, насыщенность и деградацию («oretic loss») и синхронизирует их с `HeartbeatService`.
3. **Observation.** Интерфейсный слой получил `GET /api/system/circulation`, а `HeartbeatState` теперь содержит `circulation` блок — операторы видят температуру резонанса, пульс (compression/expansion) и давление потока в реальном времени.

### Transmutation & Sleep Layers (Iteration 7)
1. **Transmutation Layer.** Орган в `transmutation/` слушает те же циркуляционные петли, прогоняет события через `entropyCleaner → signalSeparator → stateMutator` и возвращает очищенное состояние в `systemContext`. Метрики доступны на `GET /api/system/transmutation`.
2. **Sleep Cycle Layer.** Каталог `sleep/` добавляет консолидацию памяти и dream-sandbox. Цикл запускается вручную (`POST /api/system/sleep`) или автоматически через `SleepScheduler`, а состояние можно прочитать по `GET /api/system/sleep/state`.
3. **Расширенный heartbeat.** `/api/system/health` теперь содержит блоки `transmutation` (lastMutation/purified/entropy/signal) и `sleep` (lastSleep/noiseCleared). Цикл организма завершён: **Edge → Storage → Resonance → Awareness → Runtime → Perception → Heartbeat → Circulation → Transmutation → Sleep → Edge**.

### Homeostasis Layer (Iteration 8)
1. **Homeostasis Manager.** Новый модуль в `core/homeostasisManager.ts` собирает heartbeat/circulation/storage/transmutation/sleep метрики, вычисляет `stressScore` и выставляет рекомендации по очистке, сну и торможению Edge.
2. **API.** Доступно `GET /api/system/homeostasis`, а `/api/system/health` теперь содержит секцию `homeostasis` с `stressScore` и `loadLevel`.
3. **Регулятор в цикле.** Главная петля теперь наблюдается и корректируется: **Edge → Storage → Resonance → Awareness → Runtime → Perception → Heartbeat → Circulation → Transmutation → Sleep → Replay → Memory → Homeostasis → Reflex → Interoception → Emotion → Social → Intent → Meta → Awareness**.

### Perception / Sensorium Layer (Iteration 10)
1. **Signal ingestion.** Новый орган в `perception/` принимает системные и внешние сигналы (telemetry/alert/anomaly/noise) и поддерживает историю в нормализованном формате.
2. **Noise filtering.** `perceptionEngine.ts` фильтрует шум, выделяет аномалии, считает уровень сигнала/шума и публикует срез состояния со статусом `ok|noisy|degraded|critical`.
3. **Integration.** Snapshot прокидывается в homeostasis и reflex, доступен через `/api/system/perception` и `POST /api/system/perception/signal`, а резюме выводится в `/api/system/health`.
4. **Lifecycle position.** Полный виток теперь: **Edge → Storage → Resonance → Awareness → Runtime → Perception → Heartbeat → Circulation → Transmutation → Sleep → Replay → Memory → Homeostasis → Reflex → Interoception → Emotion → Social → Intent → Meta → Awareness**.

### Reflex / Nervous System Layer (Iteration 9)
1. **ReflexEngine.** Модуль в `reflex/` агрегирует сигналы (homeostasis стресс, runtime/circulation события), держит историю событий/действий и выдаёт быстрые рекомендации.
2. **API.** Доступно `GET /api/system/reflex`, а `/api/system/health` показывает краткую сводку по последнему рефлексу (severity/reason/count).
3. **Цикл с нервной системой.** Обновлённый контур: **Edge → Storage → Resonance → Awareness → Runtime → Perception → Heartbeat → Circulation → Transmutation → Sleep → Replay → Memory → Homeostasis → Reflex → Interoception → Emotion → Social → Intent → Meta → Awareness**.

### Memory Layer (Iteration 11)
1. **Short/long-term fabric.** Каталог `memory/` держит short-term события (bounded history с decay) и консолидирует их в long-term snapshots через `memoryEngine`.
2. **Integration points.** Memory слушает циркуляцию, восприятие, homeostasis/reflex и циклы сна; консолидация триггерится `sleepCycle`, а новые события добавляются из heartbeat/perception/reflex.
3. **API.** Наблюдаемость через `GET /api/system/memory`, `/short`, `/long`, а `POST /api/system/memory/recall` ищет по критериям (source/type/текст).
4. **Lifecycle position.** Полный цикл включает память и сонное переосмысление: **Edge → Storage → Resonance → Awareness → Runtime → Perception → Heartbeat → Circulation → Transmutation → Sleep → Replay → Memory → Homeostasis → Reflex → Interoception → Emotion → Social → Intent → Meta → Awareness**.

### DreamReplay Layer (Iteration 12)
1. **Experience replayer.** `replay/dreamReplayEngine.ts` подбирает стрессовые/новые снимки из long-term memory, прогоняет их через «what-if» вариации трансмутации и вычисляет интеграцию.
2. **Sleep trigger.** После завершения `sleepCycle` вызывается `runReplayCycle`, который записывает результаты обратно в память и уведомляет reflex/homeostasis через системный контекст.
3. **API.** `/api/system/replay`, `/state`, `/episodes` отдают сводку и историю, а `POST /api/system/replay/trigger` позволяет вручную инициировать цикл в dev-сценариях.
4. **Lifecycle position.** Ночная петля дополняется звеном переосмысления: **Edge → Storage → Resonance → Awareness → Runtime → Perception → Heartbeat → Circulation → Transmutation → Sleep → Replay → Memory → Homeostasis → Reflex → Interoception → Emotion → Social → Intent → Meta → Awareness**.

### Intent / Volition Layer (Iteration 13)
1. **IntentEngine.** Директория `intent/` содержит орган воли, который собирает срезы homeostasis/reflex/memory/replay, оценивает стресс и интеграцию и выбирает `IntentMode` (CALM/FOCUSED/HEALING/DEGRADED/CRITICAL).
2. **Decisions.** `intentEngine` публикует `IntentDecision` флаги (`allowHeavyTasks`, `throttleNonCritical`, `preferCache`, `forceSleepSoon`, `degradedMode`, `boostTransmutation`) и поддерживает dev-override.
3. **Integration.** Intent оценивается в heartbeat-петле, виден через `/api/system/intent` и выводится в `/api/system/health`, а runtime учитывает деградацию/энергосбережение через `applyIntentDecision`.
4. **Lifecycle position.** Обновлённая петля воли: **Edge → Storage → Resonance → Awareness → Runtime → Perception → Heartbeat → Circulation → Transmutation → Sleep → Replay → Memory → Homeostasis → Reflex → Interoception → Emotion → Social → Intent → Meta → Awareness**.

### Meta / Observer Layer (Iteration 14)
1. **MetaEngine + PatternDetector.** Каталог `meta/` собирает тренды homeostasis/reflex/sleep/replay/intent/transmutation, считает когерентность и определяет фазу адаптации (steady-state, escalation, recovery).
2. **Anomaly lens.** Аномалии фиксируются при критическом стрессе, частых/критических рефлексах, слабом сигнале трансмутации и низкой восстановительной силе сна/реплея.
3. **API & health.** `/api/system/meta` возвращает мета-состояние, а `/api/system/health` содержит блок `meta` (coherence, stress trend, adaptation phase, anomalies, dominant intent).
4. **Lifecycle position.** Meta наблюдает за всей цепочкой и возвращает контекст в Awareness: **Edge → Storage → Resonance → Awareness → Runtime → Perception → Heartbeat → Circulation → Transmutation → Sleep → Replay → Memory → Homeostasis → Reflex → Interoception → Emotion → Social → Intent → Meta → Awareness**.

### Interoception / SenseEngine (Iteration 15)
1. **Internal sensing.** `interoception/interoceptionEngine.ts` агрегирует низкоуровневые метрики сна/стресса/шумов/перегруза из homeostasis, reflex, sleep, replay, perception, transmutation, heartbeat и выдаёт `fatigue`, `tension`, `entropyPressure`, `overload`, `clarity`, `status`, `annotations`.
2. **Heartbeat hook.** Каждое сердцебиение пересчитывает interoception state и публикует его в `systemContext` — Intent/Reflex/Homeostasis могут реагировать на усталость/перегруз, а не только на стрессScore.
3. **API & health.** Новый эндпоинт `/api/system/interoception` отдаёт текущий снимок чувств, `/api/system/interoception/state` — полное состояние с историей сигналов; блок `interoception` добавлен в `/api/system/health`.
4. **Lifecycle position.** Метка внутреннего чувства встраивается перед волей: **Edge → Storage → Resonance → Awareness → Runtime → Perception → Heartbeat → Circulation → Transmutation → Sleep → Replay → Memory → Homeostasis → Reflex → Interoception → Emotion → Social → Intent → Meta → Awareness**.

### Emotion / Proto-Emotion Layer (Iteration 16)
1. **Proto-emotional synthesis.** `emotion/emotionEngine.ts` объединяет внутренние сигналы (interoception/homeostasis/reflex) и внешнее восприятие с Intent/Meta/Replay контекстом, формируя состояния `calmReady`, `focusThreat`, `exploreOpportunity`, `recovering`, `overloadProtect` и др., фиксируя confidence и волатильность.
2. **Lifecycle wiring.** Emotion пересчитывается на каждом heartbeat и влияет на Reflex/Intent/Meta приоритеты; состояние доступно через `/api/system/emotion` и `/api/system/emotion/history`, а краткая сводка выводится в `/api/system/health`.
3. **Purpose.** Добавляет эмоциональную модуляцию поведения: ускоряет защитные реакции при угрозах, поддерживает исследовательский режим при низком стрессе и сигнализирует о потребности восстановления при усталости.

### Social Resonance Layer (Iteration 17)
1. **Resonant field sensing.** `social/socialResonanceEngine.ts` объединяет emotion/intent/perception/interoception/meta сигналы и опциональные peer-снапшоты, вычисляя selfResonance, fieldResonance и peerResonance.
2. **Recommendations.** На основе диссонанса/возможностей формирует рекомендации align/detach/amplify/shield/observe с приоритетом и целевым peer (если есть).
3. **Interfaces.** Эндпоинты `/api/system/social/resonance` и `/api/system/social/peers` позволяют наблюдать состояние; блок `social` добавлен в `/api/system/health` и участвует в Intent/Meta расчетах.
4. **Lifecycle position.** Социальный слой размещён между Emotion и Intent, подавая подсказки в волевую петлю: **... → Interoception → Emotion → Social → Intent → Meta → ...**.

## 2. Module-by-Module Roles
| Repository | Purpose | Responsibilities | Integration Points | Data Consumed | Data Produced |
|------------|---------|------------------|--------------------|---------------|---------------|
| **L-EDGE** | Living edge OS | SomaSeed ingress, Guard immunity, FlowBalancer hints, Worker Cells for programmable logic | Receives intents from DAO_lim, pushes metrics to LiminalBD, executes policies from SOMA via LTP, runs workloads within Garden pods | DAO_lim routing directives, SOMA policies, Operator overrides | Traffic events, anomaly signals, cache states, worker outputs |
| **DAO_lim** | Dynamic Awareness Orchestrator | Resonant load balancing, intent-aware routing, WAF-like guard, WASM filters | Pulls health + intent stats from LiminalBD, exposes metrics to SOMA, config sync via LTP | Service profiles, LiminalBD telemetry, SOMA guard policies | Routing decisions, guard verdicts, flow telemetry |
| **L-THREAD (LTP)** | Secure transport fabric | Thread session negotiation, envelope signing, heartbeat, nonce tracking | Wraps every control/data signal between modules, mediates Garden ↔ SOMA ↔ Edge commands | Handshake configs, identity material, payload metadata | Signed envelopes, continuity proofs, transport metrics |
| **GardenLiminal** | Living runtime / process orchestrator | Pod scheduling, namespace & cgroup isolation, cgroup metrics, event emission | Executes edge cells + worker code, persists events to LiminalBD, consumes SOMA/Garden policies via LTP | Seeds, pact policies, restart intents, SOMA commands | Runtime events, resource metrics, pod states |
| **LiminalBD** | Living event database | Event ingestion, affinity indexing, impulse routing, reflex triggers, dream speculation | Receives events from Edge + Garden, provides query bus for SOMA/DAO/LRI, backs LTP state | Traffic/runtimes/resonance events, policies, metadata | Aggregated metrics, anomaly patterns, policy versions, dream suggestions |
| **SOMA** | Inner Council / Resonance decisioning | Multi-agent inference, anomaly scoring, policy synthesis, resonance mesh | Reads events from LiminalBD, writes policies via LTP, coordinates with Garden and DAO, publishes insights to LRI | Historical events, operator annotations, DAO status | Policies, anomaly scores, growth directives, healing commands |
| **LRI** | Operator interface layer | Liminal Context Envelope (LCE) parsing, session store, dashboards, WebSocket streams | Subscribes to LiminalBD + SOMA outputs via LTP or SSE, sends operator intents back | Telemetry streams, policy diffs, thread states | Operator inputs, UI commands, annotation events |

## 3. Unified Data Flow
1. **Ingress Intent:** Requests enter DAO_lim. `Sense` module captures latency/error metrics, `Align` derives intent labels, `Flow` applies filters. DAO_lim forwards metadata-enriched requests to appropriate SomaSeed gateway.
2. **Edge Processing:** L-EDGE SomaSeed proxies the request to origin or Worker Cell, records latency/status/body size, forwards measurement (`traffic_events`) into LiminalBD over the Pattern Bus.
3. **Transport Enforcement:** Every measurement travels through an LTP envelope to ensure continuity (thread_id = flow_id, session_id = edge cell run).
4. **Storage + Awareness:** LiminalBD stores the event, updates aggregates, and triggers reflex subscriptions. DAO_lim receives near-real-time streaming stats to refine routing weights.
5. **Resonance Decisioning:** SOMA queries LiminalBD (e.g., `SELECT * FROM traffic_events WHERE anomaly_score > 0.7`) to detect resonances, runs council deliberations (Pythia, Architect, Morpheus) and emits new policies (e.g., "quarantine path /login").
6. **Runtime Execution:** Policies published over LTP target Garden pods or direct L-EDGE cells. Garden updates pods, applies security pacts, logs runtime_events back to LiminalBD.
7. **Operator Feedback:** LRI subscribes to telemetry (`/ws/resonance`) plus SOMA policy bus, renders flows/anomalies/decisions. Operator adjustments (e.g., "boost node_eu-west latency weight") go through LRI → SOMA → DAO_lim.
8. **Perception → Transmutation → Sleep → Memory:** После восприятия и циркуляции очищенные состояния попадают в Transmutation Layer (entropy drop + signal tagging), затем Sleep Cycle консолидирует и очищает шум, а Memory переносит свежие события в long-term snapshots. Обновлённый контекст и память возвращаются в Awareness/Edge как топливо для следующего витка событий.

## 4. Storage Model — LiminalBD
### Core Entities
| Entity | Description | Key Fields |
|--------|-------------|-----------|
| `traffic_events` | Edge ingress/egress metrics | `event_id`, `ts`, `flow_id`, `node_id`, `path`, `intent`, `latency_ms`, `status_code`, `bytes_in/out`, `anomaly_score`, `resonance_group` |
| `runtime_events` | Garden pod lifecycle + metrics | `event_id`, `ts`, `pod_id`, `seed_id`, `cpu_pct`, `mem_bytes`, `restart_count`, `state`, `pact_hash` |
| `resonance_events` | SOMA council inferences | `event_id`, `ts`, `council`, `verdict`, `confidence`, `policy_ref`, `targets[]` |
| `policies` | Active guard/routing/runtime policies | `policy_id`, `version`, `scope`, `payload`, `issued_by`, `ttl`, `signature` |
| `nodes` | Edge + Garden inventory | `node_id`, `kind`, `geo`, `capabilities`, `health`, `last_seen`, `energy_state` |

### Unified Event Schema
```json
{
  "schema": "liminal.event.v1",
  "event_id": "uuid",
  "ts": "2025-03-17T12:05:23.452Z",
  "layer": "edge|runtime|resonance|awareness|interface",
  "kind": "traffic|runtime|policy|anomaly|command",
  "actor": {
    "node_id": "edge-eu-1",
    "process": "soma-gateway",
    "pod_id": "garden-22aa"
  },
  "context": {
    "flow_id": "req-92fa",
    "thread_id": "ltp-abcd",
    "intent": "login",
    "geo": "eu-west"
  },
  "metrics": {
    "latency_ms": 82,
    "status_code": 200,
    "cpu_pct": 37.2
  },
  "payload": {
    "resonance": {
      "score": 0.78,
      "trend": "rising"
    }
  },
  "links": ["policy:guard-442", "runtime:pod-22aa"],
  "signature": "blake3(...)"
}
```

### Migration Plan
1. **InfluxDB/Postgres parity:** Create ingestion adapters writing both to existing stores and LiminalBD.
2. **Replay historical data:** Export Influx measurement `traffic` → convert to unified schema → import via `liminalbd ingest`.
3. **Update consumers:** DAO_lim, SOMA, LRI read via LiminalBD gRPC/WS APIs.
4. **Decommission legacy:** Once dashboards + analytics reference LiminalBD, disable Influx writers.

## 5. L-THREAD Transport Contract
### Envelope
```json
{
  "type": "state_update|event|policy|command|ack",
  "thread_id": "ltp-...",
  "session_id": "sess-...",
  "nonce": 198237612,
  "sent_at": "2025-03-17T12:05:23.452Z",
  "sender": {"node": "edge-eu-1", "role": "soma_seed"},
  "receiver": {"node": "garden-core", "role": "orchestrator"},
  "auth": {"signature": "hex", "algo": "ed25519"},
  "payload": {"schema": "liminal.event.v1", "data": { ... }},
  "context": {"affect": {"valence": 0.1, "arousal": -0.2}, "tags": ["immunity", "autoscale"]}
}
```

### Handshake
1. `handshake_init` (edge/garden) → includes capabilities, supported schemas, crypto material.
2. `handshake_accept` (LTP hub) → assigns `thread_id`, `session_id`, policy scopes.
3. `handshake_resume` for reconnect, verifying continuity via rolling nonce + session digest.

### Auth & Integrity
- Transport over TLS/WSS mandatory.
- Envelope signatures using Ed25519, with optional hardware attestations for Garden nodes.
- Nonce + sliding window prevents replay.
- Context propagation uses `trace_id`, `intent`, `policy_version` headers shared with DAO_lim.

## 6. GardenLiminal Integration
1. **Edge Workload Execution:** Each SomaSeed gateway is packaged as a Garden Seed specifying binary, network namespaces, pacts (capabilities), restart policy, and storage mounts.
2. **Pods as Living Cells:** Garden groups Seeds into Pods (gateway + metrics sidecar + worker runtime). Pods publish `runtime_events` to LiminalBD after each lifecycle stage.
3. **Policy Consumption:** SOMA issues `growth_command` or `quarantine_policy`. Garden's `gl-controller` subscribes via LTP, translates commands into `Seed` updates (scale up/down, patch pacts, change rootfs versions).
4. **Metrics Streaming:** Garden collects cgroup metrics every N seconds, pushes them to LiminalBD, enabling DAO_lim to adjust weighting based on real runtime stress.
5. **Self-Heal Loop:** When Garden detects Pod failure > threshold, it emits `runtime_event` with `state=DEGRADED` which SOMA can treat as anomaly; Garden simultaneously retries with exponential backoff and notifies DAO_lim to reduce traffic to impacted node.

## 7. SOMA — Unified Control Plane
- **Event Intake:** SOMA's `soma-bridge` subscribes to LiminalBD `resonance_bus` (gRPC stream). Patterns: traffic spikes, runtime failures, operator annotations.
- **Council Processing:** Pythia handles predictive models, Architect manages topology/policies, Morpheus simulates futures (dreaming). Each module writes `resonance_events` and proposed `policies` back to LiminalBD.
- **Policy Lifecycle:**
  1. Draft policy stored with `status=pending`.
  2. Once consensus (>0.7 agreement) achieved, status becomes `active` and LTP broadcast targets Garden/DAO.
  3. Policies include `scope` (edge_node, route, pod), `effect` (limit, boost, quarantine), `ttl`, `rollback` instructions.
- **Feedback:** LRI operator overrides get appended as `operator_annotations`, boosting/attenuating SOMA weights. SOMA logs rationale for each decision for audit.

## 8. DAO_lim Integration
- **Awareness Membrane:** DAO_lim sits before L-EDGE, enriching requests with `intent`, `tempo`, `resonant_score` fields appended to LTP context.
- **Data Dependency:** Pulls historical latencies/error trends from LiminalBD to compute `load_resonance`. When SOMA updates guard policies (e.g., `block intent=credential_stuffing`), DAO_lim hot-reloads configs via `dao-admin` gRPC.
- **Fuzzy Immunity:** Guard module uses SOMA-provided anomaly fingerprints to drop suspicious flows, logging `guard_event` entries for traceability.
- **FlowBalancer Feedback:** DAO_lim publishes `flow_metrics` streams to LiminalBD to allow cross-validation with SomaSeed-collected data.

## 9. LRI Integration
- **Data Protocol:** LRI backend subscribes to LiminalBD `event_ws` (WebSocket) or `event_sse` endpoints filtered by `layer in ('edge','resonance','runtime')`. Each message arrives as LCE-enhanced payload.
- **WebSocket Telemetry:** Channels include `nodes`, `flows`, `anomalies`, `decisions`. Example: `/ws/flows` pushes aggregated rate/latency, `/ws/decisions` pushes SOMA policy diffs.
- **Layout Guidance:**
  - **Top bar:** global health, resonance score, thread continuity.
  - **Left rail:** node list with health, Garden pods, DAO_lim senses.
  - **Center canvas:** flow map (ingress → edge → runtime → data), highlight anomalies.
  - **Right rail:** SOMA council feed, operator action panel.
- **Operator Actions:** Buttons send LCE commands (intent: `adjust_policy`, affect: `urgent`) that travel via LTP to SOMA for adjudication.

## 10. MVP Architecture (2–3 Weeks)
| Component | Implementation | Notes |
|-----------|----------------|-------|
| Edge Node | Node/Express SomaSeed + Rust sidecar for metrics | Reverse proxy + Influx adapter (temporary) + LTP stub |
| Awareness | DAO_lim configured with single rule set | Captures metrics, forwards to SomaSeed via HTTP |
| Runtime | GardenLiminal running SomaSeed + Pythia mock in pods | Use `gl run` + minimal seeds |
| Storage | LiminalBD single-node (Rust binary) with `traffic_events` + `runtime_events` tables | Provide CLI for ingest/query |
| Resonance | SOMA mini build where resonance = latency spike > threshold | Emits `scale_up` or `quarantine` commands |
| Interface | LRI minimal panel showing flows + anomalies | Web dashboard consuming `/ws/flows` |
| Transport | LTP stub (signed JSON over TLS, no extra crypto) | Hardcode thread/session IDs |

**MVP Flow:** DAO_lim → SomaSeed → LiminalBD → SOMA threshold → command via stub LTP → Garden scales pods → LRI visualizes metrics.

## 11. Six-Iteration Roadmap
| Iteration | Focus | Key Deliverables |
|-----------|-------|------------------|
| 1 | Edge ↔ LiminalBD | SomaSeed metrics pipeline, LTP stub, unified event schema ingestion |
| 2 | Garden Integration | Garden pods wrap SomaSeed + metrics sidecar, runtime_events stored |
| 3 | Transport Hardening | Full LTP handshake + signatures, context propagation across DAO/Garden/SOMA |
| 4 | DAO_lim Deep Awareness | Intent-aware routing, guard fingerprints fed by SOMA, hot reload from policies table |
| 5 | SOMA Resonance Brain | Council consensus loop, policy versioning, dream simulations with Garden dry runs |
| 6 | LRI Operator Surface | Dashboards, operator intents as LCE, closed-loop verification of decisions |

## 12. Acceptance Criteria per Iteration
1. **Iteration 1:** 95% of requests proxied via SomaSeed appear in LiminalBD within 1s; basic anomaly rule triggers test alert.
2. **Iteration 2:** Garden-managed SomaSeed pods auto-restart on failure and emit runtime_events; DAO_lim receives Garden health feed.
3. **Iteration 3:** All control messages exchange Ed25519-signed LTP envelopes; replay attempts rejected; session resume proven via tests.
4. **Iteration 4:** DAO_lim adjusts routing weights based on SOMA policy updates without restart; guard fingerprint blocks replayed malicious flow in staging.
5. **Iteration 5:** SOMA council generates, approves, and enforces policy with recorded rationale; dream simulation result stored for audit.
6. **Iteration 6:** LRI dashboard visualizes flows/anomalies live and operator intent results in SOMA policy change within 2 minutes.

## 13. Risks & Hardening Plan
| Risk | Description | Hardening Strategy |
|------|-------------|--------------------|
| Transport Replay | Attackers reuse LTP envelopes | Nonce window + session digests + Ed25519 signatures + TLS mutual auth |
| Data Store Hotspots | LiminalBD overload on popular patterns | Shard by `resonance_group`, introduce write-ahead log + compaction scheduling |
| Garden Escape | Process breakout from pods | Enforce seccomp profiles, drop capabilities, periodic integrity scans, attested rootfs |
| Policy Drift | SOMA policies diverge from operator expectations | Require multi-party sign-off, expose policy diffs in LRI, implement rollback timers |
| DAO_lim Overload | Awareness membrane becomes bottleneck | Horizontal scale with consistent hashing, share-state via LTP multicast, degrade gracefully |
| Telemetry Flood | Excessive events overwhelm LRI/UI | Apply LTP sampling hints, aggregated metrics, UI-level backpressure |
| Alignment Failure | SOMA decisions misaligned with intent | Embed human-in-loop checkpoints, run dream simulations before activation, compare to guardrails |

---
**Next Step:** Implement MVP iteration (Section 10) on branch `codex/mvp-somaseed-gateway-001` and keep this document as the authoritative reference for multi-repo integration.

### Perception (External Sensing)
PerceptionEngine ingests external network/runtime/storage signals, classifies them into pressure/threat/opportunity categories, and feeds summaries into homeostasis, reflex, intent, and meta cycles. Health surfaces now include perception summaries alongside interoception metrics.
