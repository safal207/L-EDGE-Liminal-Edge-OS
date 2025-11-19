# Runtime Layer

Адаптер к GardenLiminal — https://github.com/safal207/GardenLiminal.

- `runtimeAdapter.ts` описывает интерфейс `RuntimeAdapter` и `InMemoryRuntimeAdapter`.
- Методы `startProcess/stopProcess/getProcessState` хранят состояния в памяти и логируют вызовы вместо обращения к GardenLiminal API.
- В следующих итерациях адаптер будет создавать Seeds/Pods через Garden CLI и отправлять runtime события в `storage/`.
