# L20 – Resonant Decision Orchestrator

L20 превращает накопленное состояние LIMINAL (время, смысл, фазы, внешний контекст и ось потока) в мягкое, резонансное решение. Вместо жёстких команд движок оценивает кандидатов-переходы и выбирает тот, что создаёт наибольшую согласованность с системой.

## Входы (DecisionInputs)
- **time**: `agePhase`, `tmi`, `drift`.
- **meaning**: `purposeAlignment`, `contentment`, `finiteness`.
- **phase**: `state` (`solid|liquid|vapor`), `stability`.
- **context**: `pressureType`, `pressureIntensity`, `relevance`.
- **flow**: `fai`, осевые выравнивания, окно удачи.

Функция `buildDecisionInputs` аккуратно объединяет частичные состояния, нормализует значения и обеспечивает безопасные дефолты.

## Кандидаты (ResonantStateCandidate)
L20 работает с набором действий в режимах `stabilize|explore|push|pivot|slow_down|connect|rest`. Если список не задан, движок генерирует мягкие автокандидаты, учитывая давление среды и стабильность фазы. Внешние кандидаты очищаются и нормализуются через `buildResonantCandidates`.

## Resonant State Transition Engine (RSTE)
`runResonantStateTransitionEngine` вычисляет метрики для каждого кандидата: согласованность, гармоническую вписываемость, фазовое согласие, проводимость контекста, плавность будущего пути, системную полезность, выравнивание с потоком и энтропийную стоимость. Затем строится `resonanceScore` с настраиваемыми весами профиля.

## DecisionEnvelope
`buildDecisionEnvelope` выбирает лучший кандидат, присваивает риск-бэнд, отражает выравнивания по осям и фиксирует ключевые причины (контекстное давление, состояние фазы, окно удачи). Это решение готово для UI, логирования или агента.

## Быстрый вызов
```ts
import { L20_ResonantDecisionOrchestrator } from "../../layers/L20_ResonantDecision";

const result = L20_ResonantDecisionOrchestrator(innerState, contextState, flowState, candidates, weights);
console.log(result.decision);
```
