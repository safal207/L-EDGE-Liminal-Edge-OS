# Resonance Layer

Мост к SOMA (Inner Council) — https://github.com/safal207/SOMA-Self-Organizing-Modular-Architecture.

- `resonanceEngine.ts` определяет `ResonanceEngine` и заглушку `MockResonanceEngine`.
- Метод `submitEvents` принимает массив `EdgeEvent`, сериализует в формате LTP и отправляет в SOMA (пока просто логирует).
- Метод `onDecision` подписывается на решения `PolicyDecision`, которые в реальности будут поступать из SOMA/Inner Council.

Mock-реализация периодически генерирует фиктивные решения, чтобы тестировать поток сигналов в интерфейсном слое.
