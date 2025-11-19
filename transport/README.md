# Transport Layer

Контракты и mock-реализация L-THREAD / Liminal Transport Protocol (LTP) — https://github.com/safal207/L-THREAD-Liminal-Thread-Secure-Protocol-LTP-.

- `ltpClient.ts` описывает интерфейс `LtpClient` и in-memory реализацию `InMemoryLtpClient`.
- Типы `LtpEnvelope`, `LtpSession`, `LtpCommand` определены в `core/types.ts`.

Mock клиент позволяет локальным сервисам тестировать поток сообщений до появления шифрования, nonce и сетевого транспорта.
