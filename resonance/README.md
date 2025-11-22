# Resonance Layer

Мост к SOMA (Inner Council) — https://github.com/safal207/SOMA-Self-Organizing-Modular-Architecture.

- `resonanceEngine.ts` определяет `ResonanceEngine` и заглушку `MockResonanceEngine`.
- Метод `submitEvents` принимает массив `EdgeEvent`, сериализует в формате LTP и отправляет в SOMA (пока просто логирует).
- Метод `onDecision` подписывается на решения `PolicyDecision`, которые в реальности будут поступать из SOMA/Inner Council.

Mock-реализация периодически генерирует фиктивные решения, чтобы тестировать поток сигналов в интерфейсном слое.

## Collective / Shared Resonance Layer

- `collectiveResonanceEngine.ts` вычисляет совпадения с архетипическими шаблонами и собирает зеркала (mirrors), эхо-паттерны (echoes) и семена будущего (seeds) на основе SelfModel/Emotion/Perception.
- `templates.ts` содержит небольшой статический набор шаблонов (можно расширять/заменять через инжекцию в конструктор движка).
- REST эндпоинты: `/api/system/resonance/collective` (актуальный срез) и `/api/system/resonance/collective/history` (история совпадений с ограничением по глубине).
- Heartbeat и `/api/system/health` публикуют краткую сводку: primaryMode + топовые mirror/echo/seed.
