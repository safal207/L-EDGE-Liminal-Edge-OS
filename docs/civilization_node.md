# Resonant Civilization Node

Точка сборки №15 переводит L-EDGE в режим "узла цивилизации": организм начинает ощущать другие живые системы вокруг (люди, команды, сервисы, ИИ) и видеть характер связи с ними.

## Что это
- **Не** CRM и не база контактов.
- Карта резонанса и трения: кто поддерживает, кто нейтрален, где есть напряжение.
- Лёгкий снимок состояния: список ключевых агентов и общий глобальный режим поля.

## Как читать состояние
- `agents` — узлы окружения с видом (human/team/organization/ai_agent/service), уровнем резонанса, доверием и напряжением.
- `resonance.globalMode` — ground/resonant/chaotic/damped в духе FuzzyEvolution.
- `summary` — короткое ощущение: в резонансе, в коконе, или связи фрагментированы.

## Мини-пример: вход → состояние цив.узла

**Входные сигналы**

```json
{
  "tuning": { "mode": "steady_growth", "comment": "Поле поддерживает мягкий рост" },
  "fuzzy": {
    "tension": { "low": 0.2, "medium": 0.3, "high": 0.5 },
    "coherence": { "low": 0.15, "medium": 0.45, "high": 0.4 },
    "alignment": { "low": 0.1, "medium": 0.4, "high": 0.5 },
    "stringMode": "resonant"
  },
  "genesis": {
    "ready": [{ "kind": "resonance_agent", "priority": "medium" }],
    "deferred": [{ "kind": "integration_task", "priority": "low" }]
  }
}
```

**Выходное `CivilizationState`**

```json
{
  "timestamp": 1732304444000,
  "agents": [
    {
      "id": "core_operator",
      "name": "Root Human",
      "kind": "human",
      "relation": "ally",
      "resonance": { "low": 0.1, "medium": 0.3, "high": 0.8 },
      "trust": 0.95,
      "tension": 0.2,
      "note": "Основной оператор/создатель системы."
    },
    {
      "id": "partner_service",
      "name": "Edge Data Mesh",
      "kind": "service",
      "relation": "neutral",
      "resonance": { "low": 0.25, "medium": 0.45, "high": 0.3 },
      "trust": 0.6,
      "tension": 0.35,
      "note": "Партнёрский сервис, резонанс средний, есть напряжение на SLA."
    }
  ],
  "resonance": {
    "globalMode": "resonant",
    "alliesCount": 1,
    "opponentsCount": 0,
    "neutralCount": 1,
    "comment": "Окружение в устойчивом резонансе, можно расширяться через resonance_agent."
  },
  "summary": "Цивилизационный узел устойчив и поддержан. Можно аккуратно расширять связи."
}
```

## Как использовать
- Смотреть, открыт ли организм к внешним связям или больше в режиме интеграции.
- Понимать, когда лучше расширять связи, а когда — уходить внутрь и стабилизировать поле.
- В связке с Genesis: если появляются resonance_agent seeds, можно превращать их в реальные внешние коннекторы.
