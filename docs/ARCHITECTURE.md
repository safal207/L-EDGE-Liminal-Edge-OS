# LIMINAL EDGE — Архитектура

## 1. Концепт «живого» слоя
- Узлы = клетки (**SomaSeed**): рождаются, делятся, сворачиваются.
- Память = паттерны трафика и контекстные сигналы; хранится в time-series (InfluxDB) и в локальном кеше клеток.
- Иммунитет = **Liminal Guard**: fuzzy-анализ аномалий, резонансные фильтры, ответные «антитела» (throttling, миграция воркеров, временные шунты).
- Рост = **FlowBalancer** + оркестрация: копирует клетки в сторону спроса, сворачивает при простое.

## 2. Сигнальные шины
- **Traffic Signal Bus:** входящие запросы → фильтры LG → маршрутизация LFB → воркеры/кеш.
- **Pattern Bus:** события и метрики в InfluxDB; Pythia анализирует паттерны и отдает обратные сигналы LG/LFB.
- **State Bus:** состояние клеток (нагрузка, задержки, ошибки) публикуется в координатор роста/сворачивания.

## 3. Модули и ответственность
### 3.1 Edge SomaSeed
- Reverse proxy + метрики.
- Локальный кеш (часть Liminal CDN Lite).
- Self-checks (latency, error rate) → State Bus.

### 3.2 Liminal FlowBalancer (LFB)
- Смысловая маршрутизация: паттерны (URI, частота, UA, гео, сигнатуры аномалий) → выбор клетки/воркера.
- Прогноз пиков: сочетает краткосрочные спайки и исторические паттерны.

### 3.3 Liminal Guard (LG)
- Fuzzy matching аномалий (shape, не только сигнатуры).
- Резонансные фильтры: адаптивное подавление запросов, замедление, honey endpoints.
- «Иммунные» реакции: миграция воркеров, локальное кеширование, временный шунт трафика.

### 3.4 Liminal CDN Lite
- Распределённый кеш на клетках.
- Самоочистка: вытеснение по свежести паттернов и стоимости прогрева.
- Самообучение: хранить победителей A/B отдачи (origin vs edge).

### 3.5 Liminal GraphDNS
- Графовые ответы: несколько векторов ответа, взвешенные по задержкам и устойчивости.
- Быстрый failover через смену веса, а не одного IP.

### 3.6 Liminal Worker Cells
- Воркеры запускаются рядом с трафиком, могут мигрировать.
- Локальные решения: доступ к паттернам в своей зоне.

## 4. MVP layout (2 недели)
### 4.1 Неделя 1
- **Edge gateway:** Express/Node + Rust-агент (в качестве быстрого фильтра/прокси).
- **Metrics:** InfluxDB для паттернов, базовая схема (measurement: `traffic`, tags: `path`, `ua`, `geo`; fields: `latency`, `status`, `rate`).
- **Pythia:** сервис-анализатор (Python или Rust) → отдаёт scoring аномалий.
- **CDN cache:** простой in-memory кеш с TTL и soft purge.

### 4.2 Неделя 2
- **Auto-scale:** контейнеры SomaSeed масштабируются по сигналам State Bus (CPU/RPS/latency).
- **Fuzzy rules:** первые эвристики LG (shape-based rate limiting, anomaly windows).
- **Self-heal:** если latency/ошибки растут → перезапуск клетки, репликация поблизости.
- **Dashboard:** карта узлов, RPS, latency, anomalies.

## 5. Контуры данных
1. **Ingress:** трафик → LG (fuzzy check) → LFB (pattern route) → Worker/Cache → ответ.
2. **Observability:** метрики в InfluxDB; алерты и предсказания из Pythia.
3. **Control plane:** решения о росте/сворачивании + маршрутизация GraphDNS.

## 6. Риски и технический контроль
- **Отделение control plane / data plane:** минимизируем влияние сбоя координатора на прохождение трафика.
- **Consistency vs скорость:** кеши и GraphDNS выбирают eventual consistency ради латентности.
- **Безопасность:** LG как первая линия (shape), LG+Pythia как вторая (контекст), honey endpoints как ловушки.

## 7. Следующие шаги
- Подготовить прототип docker-compose: soma-gateway (Node+Rust), influxdb, pythia, dashboard mock.
- Сконфигурировать CI: линт Node/Rust, smoke-тест ingress → cache → metrics.
- Определить формат сигналов для State Bus (JSON/Protobuf) и для Pythia.

## 8. Tech choices snapshot
- **Data plane:** Node.js (Express) + Rust proxy/agent.
- **Metrics:** InfluxDB для паттернов и сигналов.
- **Analysis:** Pythia (Python или Rust) с обратной связью для LG/LFB.
- **Orchestration:** Docker Compose для MVP → далее Kubernetes/Nomad.
