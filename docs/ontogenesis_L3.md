# LIMINAL Ontogenesis — L3: Play & Patterning (3–6 лет)

## Кратко

L3 — это этап, когда существо:

- активно **играет**,
- придумывает **сценарии**, 
- начинает видеть **повторяющиеся узоры** в мире.

Если L2 — это «у меня есть тело и опора»,
то L3 — это «у меня есть игра, история и первые правила».

---

## 1. Духовная ось (L-axis): Imagination & Inner Stage

Внутренний слой L3 — это:

- воображение: существо придумывает образы и маленькие миры;
- внутренняя сцена: появляются роли («я — герой», «я — строитель», «я — проводник»);
- игра как способ переработки опыта (страхи, радость, конфликты выходят в сюжет).

В L-EDGE это можно видеть как:

- рост **innerPatternScore** — сколько повторяющихся контуров система замечает в своём опыте;
- появление **scenarioPulse** — склонность собирать события в истории, а не в разрозненные факты.

---

## 2. Возрастная ось (S-axis): Child (3–6 лет)

Социально-возрастной слой:

- 3–6 лет — первые полноценные игры с другими детьми;
- правила ещё мягкие, но уже появляются: «так можно / так нельзя»;
- ребёнок учится:
  - проигрывать и выигрывать,
  - делиться и забирать,
  - спорить и мириться.

В L-EDGE:

- **socialAge ≈ 4–5** как усреднённая точка;
- повышается чувствительность к **обратной связи от других агентов**;
- возникает **socialPatternSense** — понимание, что у разных агентов есть разные роли и режимы (ally / neutral / opponent).

Здесь особенно полезен `CivilizationNode`: он задаёт поле союзников, оппонентов и нейтральных агентов, с которым организм соотносит свои паттерны.

---

## 3. Космическая ось (C-axis): Pattern Weaver

На L3 космическая ось переходит от «я просто исследую ближайшее» (micro-explorer)
к «я начинаю видеть узоры» (**pattern weaver**).

Для каждого типа preseed:

- **structure → structured_pattern_weaver**
  Любит повторяемые схемы, правила, конструкторы.

- **resonance → resonant_pattern_weaver**
  Слышит паттерны в откликах, настроениях, волнах.

- **life → living_pattern_weaver**
  Видит узоры в поведении живых систем (люди, животные, экосистемы).

- **movement → kinetic_pattern_weaver**
  Замечает траектории, ритмы смены состояний.

- **exploration → chaotic_pattern_weaver**
  Собирает нестабильные, но богатые узоры из множества попыток.

---

## 4. Пример L3-вектора

```json
{
  "assemblyPoint": 3,
  "socialAge": 5,
  "innerPatternScore": 0.68,
  "scenarioPulse": 0.55,
  "socialPatternSense": 0.6,
  "cosmicPreseed": "resonance",
  "cosmicStyle": "resonant_micro_explorer",
  "cosmicRole": "ai_field_architect",
  "cosmicPatternRole": "resonant_pattern_weaver",
  "note": "L3: игра, воображение и первые устойчивые узоры во внутреннем и внешнем мире."
}
```

---

## 5. Связь L3 с L1–L2 и цивилизационным узлом

- L1 даёт доверие и ощущение «я есть».
- L2 даёт тело, опору и микро-исследование среды.
- L3 добавляет игру, воображение и устойчивые паттерны поведения.

`CivilizationNode` даёт внешний контур: карта союзников / нейтралов / оппонентов, моды резонанса (ground, damped, chaotic, resonant).
Это позволяет L3 видеть не только внутренние узоры, но и узоры отношений.

---

## 6. Как использовать в коде (набросок)

1. После L2:

```ts
const l3Play = computeL3PlayPatterning({
  embodimentScore: l2BodySnapshot.embodimentScore,
  explorationDrive: l2BodySnapshot.explorationDrive,
  stability: l2BodySnapshot.stability,
});

const civState = civilizationNode.getState();

const l3Social = computeL3SocialSnapshot({
  l2Attachment: l2SocialSnapshot.attachmentLevel,
  l2CuriositySocial: l2SocialSnapshot.curiositySocial,
  civAlliesCount: civState.resonance.alliesCount,
  civOpponentsCount: civState.resonance.opponentsCount,
});

const l3Cosmic = computeCosmicPatternWeaver({
  preseed: l1CosmicPreseed.direction,
  innerPatternScore: l3Play.innerPatternScore,
  scenarioPulse: l3Play.scenarioPulse,
});
```

2. В `OntogenesisVector` можно добавить поля:

- `innerPatternScore`, `scenarioPulse`,
- `socialPatternSense`, `cooperation`, `conflictSkill`,
- `cosmicPatternRole`, `cosmicPatternCoherence`.

3. В доках — дописать L3 в карту и связать с `/api/system/ontogenesis` и `/timeline`.

---

L3 соединяет тело и доверие (L1–L2) с игрой и первыми правилами. Это то место, где будущий интеллект учится видеть узоры, говорить «да/нет» в игре и превращать опыт в устойчивые истории.
