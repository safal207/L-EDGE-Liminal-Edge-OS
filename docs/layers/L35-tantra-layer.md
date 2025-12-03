# L35 — Liminal Tantra Layer

L35 — станок и «ткань маршрутов», которая мягко переплетает сигналы L0…L34. Он превращает уже существующие петли удачи, ретроспективу, дыхание, форсайт и любые новые паттерны в цельную ткань с резонансом и повышенной устойчивостью.

## Зачем
- Связывает импульсы L31–L34 в живые связи, усиливает инсайды в местах пересечения.
- Создаёт вероятностные и смысловые маршруты (rhythm + clarity + bias), повышая удачу за счёт плотности нитей.
- Работает как клеевой метаслой: одновременно шина (согласование ритмов) и ткань (плотность связей).

## Входы
- `TantraSignal[]`: threads из любых слоёв (идентификатор, слой, intensity, rhythm, clarity, bias).
- `tone?: OrganismTone`: тон из L33/L34, чтобы привязать ткань к текущему состоянию (flow, luckSynergyScore, fatigue).
- Настройки: `desiredBias`, `minLinkStrength`.

## Выходы
- `TantraFabric`:
  - `threads`: нормализованные нитки с biasVector, resonanceScore, synergyScore.
  - `links`: связанные пары с strength/resonance/tension и осмысленным типом связи.
  - `flowScore`: синхронность ткани с текущим тоном.
  - `resilienceScore`: прочность ткани (ясность + баланс смещений + связность).
  - `insightDensity`, `luckyWindows`: где вспышки/синергии наиболее вероятны.

## API (src/layers/L35_tantra.ts)
- `weave(signals, options)`: собирает ткань, строит связи, считает flow/resilience/hotspots.
- `bind(a, b, options)`: склеивает две нитки (ритм, ясность, bias), возвращает link с meaning (`expansion corridor|stability braid|harmonic crossfade`).
- `mergePatterns(fabric, newSignals, options)`: аккуратно докручивает ткань новыми нитями, сохраняя или обрезая старый бэкбон.
- `resonanceThread(fabric, goal)`: выбирает самый уместный путь под задачу (`insight|stability|expansion`).

## Мини-оркестровка
```ts
import { weave, mergePatterns, resonanceThread } from '@/layers/L35_tantra';
import { getCurrentOrganismTone } from '@/layers/shared/organismTone';

const fabric = weave(signalsFromL32_L34, { tone: getCurrentOrganismTone() });
const enriched = mergePatterns(fabric, lateSignalsFromL21_L25, { tone: getCurrentOrganismTone(), retainExisting: true });
const nextThread = resonanceThread(enriched, { mode: 'insight' });
```

L35 не навязывает решение, а подсвечивает, какую нить тянуть, чтобы ткань оставалась целостной и жила в резонансе.
