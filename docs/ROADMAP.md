# LIMINAL EDGE — Roadmap (6 месяцев)

## M1 — Базовые клетки
- Сеть SomaSeed-узлов (reverse proxy + метрики).
- InfluxDB интеграция, базовая схема метрик и алертов.
- Статический CDN-кеш с ручной очисткой.
- Демонстрация паттерн-логирования и простого rate limiting.

## M2 — FlowBalancer & Guard v0
- Паттерн-маршрутизация (URI/UA/гео/частота).
- Первые правила Liminal Guard (shape-based throttling, burst windows).
- Инструменты наблюдаемости: latency/error dashboards.

## M3 — GraphDNS и мигрирующие воркеры
- Графовые DNS-ответы с взвешенной отдачей.
- Liminal Worker Cells: запуск ближе к трафику, миграция по сигналам.
- Первые сценарии самозалечивания: перезапуск клетки, переключение DNS веса.

## M4 — Резонансный WAF и авто-рост
- Fuzzy-анализатор LG, резонансные фильтры.
- Авто-рост/сворачивание клеток по State Bus.
- Liminal Dashboard V1: карта узлов, RPS, latency, anomalies.

## M5 — Обучаемый CDN
- Edge-кеш с выборами A/B (origin vs edge) и самоочисткой по паттернам.
- Глобальная карта узлов с приоритезацией по задержкам.
- Набор сценариев «иммунитета» для DDoS/ботов/аномалий.

## M6 — Enterprise-ready
- SLA-бандлы, multi-tenant изоляция.
- Контроль политик и периметра, интеграция с SIEM.
- Готовность к сертификации и аудитам.

## Инженерный чек-лист на ближайшее время
- Docker Compose для SomaSeed + InfluxDB + Pythia + Dashboard mock.
- CI: линт Node/Rust, smoke-тест ingress → cache → metrics.
- Контрактные тесты API GraphDNS и health-checks клеток.
- Определение форматов сигналов для State Bus и Pattern Bus.
