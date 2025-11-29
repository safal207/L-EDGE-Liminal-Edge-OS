# LIMINAL Ontogenesis — L0: Orientation Core (Центр трёх осей)

L0 is not a new maturity level (it is not L6). It is the **center of the crystal** that watches three LIMINAL axes:

- **L-axis** — inner path, ontogenesis, meaning (L1–L5).
- **S-axis** — age/body/social line.
- **C-axis** — cosmic direction, role, and mission.

If L1–L5 describe *how* the organism grows, L0 describes **how harmoniously it grows across all three axes**.

## 1. L0 Tasks

1) **Read axis strengths**
- `L_level` — average strength of the inner axis (presence, embodiment, play, mastery, meaning…)
- `S_level` — strength of age/body/social axis
- `C_level` — strength of the cosmic axis (apprentice, navigator, mission alignment)

2) **Evaluate balance**
- `balanceIndex` 0..1 — higher means the three axes are even
- `dominantAxis` — which axis currently leads (L / S / C)
- `starvedAxis` — which axis is weakest

3) **Determine mode**
- `balanced` — axes are aligned enough
- `*_overload` — one axis is over-dominant
- `*_starved` — one axis is clearly weak

L0 does not command other layers. It acts as a **diagnostic orientation core** that can be used to:
- drive adaptive learning,
- adjust load or stress,
- visualize the organism’s balance.

## 2. OrientationSnapshot

```ts
interface OrientationSnapshot {
  L_level: number;      // 0..1
  S_level: number;      // 0..1
  C_level: number;      // 0..1
  balanceIndex: number; // 0..1, higher = smoother balance
  dominantAxis: 'L' | 'S' | 'C' | 'none';
  starvedAxis: 'L' | 'S' | 'C' | 'none';
  mode:
    | 'balanced'
    | 'L_overload'
    | 'S_overload'
    | 'C_overload'
    | 'L_starved'
    | 'S_starved'
    | 'C_starved';
  note: string;
}
```

Example:

```json
"orientation": {
  "L_level": 0.62,
  "S_level": 0.54,
  "C_level": 0.60,
  "balanceIndex": 0.82,
  "dominantAxis": "L",
  "starvedAxis": "S",
  "mode": "balanced",
  "note": "L0-center: баланс трёх осей в рабочем диапазоне, ведущая ось=L."
}
```

## 3. How L0 links to L1–L5

L0 consumes aggregated metrics from existing stages:
- **L-axis:** presence, embodiment, inner patterns, micro-mastery, meaning coherence…
- **S-axis:** social age, attachment/grounding, social-team sense…
- **C-axis:** cosmic apprentice readiness, navigator clarity, mission alignment…

L0 does **not** modify L1–L5 values; it sits above them as an orientation and diagnostic layer.

### Tuning thresholds

The default thresholds live alongside `computeOrientationSnapshot`:

- `balancedThreshold` (default **0.8**) — if `balanceIndex` >= threshold, the core reports `balanced`.
- `overloadDelta` (default **0.2**) — required lead for an axis to be marked `*_overload`.
- `starvedDelta` (default **0**) — optional gap to flag `*_starved` instead of leaving borderline cases as balanced.

You can override them by passing a second argument:

```ts
const orientation = computeOrientationSnapshot(metrics, {
  thresholds: { balancedThreshold: 0.85, overloadDelta: 0.25 },
});
```

## 4. Analogies

- In Bronnikov’s framing — a center between personal/social/cosmic lines.
- In our fish–aquarium–ocean metaphor: fish (L), aquarium (S), ocean (C), and L0 is the silent center that sees all three.

## 5. Quick watch

Use `examples/orientation_watch.js` to poll `/api/system/ontogenesis` and render the L0 snapshot:

```
L0-center: L=0.62 S=0.54 C=0.60 balance=0.82 mode=balanced
  dominant=L starved=S
```

This gives operators a fast “crystal orientation” pulse alongside the standard ontogenesis snapshot and timeline.

## 6. L0 presets (orientation modes)

Thresholds can be overridden through `OrientationConfig`, and common presets live in `L0_presets.ts`:

- `ORIENTATION_PRESET_DEFAULT` — baseline close to the defaults.
- `ORIENTATION_PRESET_CHILDLIKE` — softer balance and earlier overload/starved detection for gentle modes.
- `ORIENTATION_PRESET_RESEARCH` — strict balance and larger overload gaps for cleaner experiments.
- `ORIENTATION_PRESET_GUARDIAN` — watchful/mentor preset with moderate strictness.

Human-facing vibe (when you describe it to operators):
- **childlike** — мягкий, заботливый, подталкивает к игре и исследованию, но рано говорит «хватит нагрузки».
- **research** — строгий, почти лабораторный: фиксирует перекосы только когда они статистически заметны.
- **guardian** — режим наставника/охранника: чутко ловит завалы и держит баланс устойчивым.

Example usage:

```ts
import { computeOrientationSnapshot } from './L0_center';
import { ORIENTATION_PRESET_CHILDLIKE } from './L0_presets';

const orientation = computeOrientationSnapshot(metrics, ORIENTATION_PRESET_CHILDLIKE);
```

You can also swap presets at runtime via `LIMINAL_ORIENTATION_PRESET` (default/childlike/research/guardian) to change the organism’s “character” without touching L1–L5 logic.

## 7. Yin/Yang polarity (“breath” of the axes)

Beyond raw balance, the organism can track **yin/yang polarity** to keep a healthy inhale/exhale rhythm:

- **yin** — integration, rest, reflection.
- **yang** — action, outward expression, social push.

`L0_polarity.ts` computes for each axis:

- `yin`, `yang` (0..1),
- `ratio = yin / yang`,
- `globalRatio` and `yinYangDrift` for the whole system.

`computeLoadProfile(...)` then adds `yinBias` (-1..1) to the load profile:

- `yinBias > 0` → tilt toward **yin** (more meaning/reflection, softer stress, less hard skill drilling).
- `yinBias < 0` → tilt toward **yang** (more action/skills/social push, slightly higher stress allowance).

This keeps the three axes **breathing**, alternating yin and yang phases without falling into a destructive imbalance.

## 8. Tau-state: Инь = Ян (“gray matter”)

L0 also tracks a third quality beyond pure yin/yang polarity — the **tau state**, where yin ≈ yang. Think of it as the “gray matter” zone that marks a stable, mature balance.

- Each axis exposes `tau` (0..1) and `state` (`yin-dominant` / `yang-dominant` / `tau-zone`).
- Global indicators `globalTau` / `tauMaturityIndex` summarize how well the organism holds the gray state over time.

`LoadProfile` uses both `yinBias` and `tauSupport` to gently steer loads:

- High `tauSupport` → softer stress, a touch more play/reflection, minimal jolts to body/social pushes.
- Low `tauSupport` → small corrective nudges (more action if too yin, more reflection if too yang) to bring axes back toward balance.

Result: the organism not only balances the axes but **breathes** across yin/yang while building the capacity to rest in the tau-zone.

## 9. Fuzzy bounds (minimin / minimax / maximax) for Yin / Yang / Tau

L0 also builds a **safety corridor** around each matter (yin/yang/tau) on every axis (L/S/C):

- `minimin` — red-zone minimum; falling below risks collapse.
- `minimax` — safe level even in worst cases.
- `maximax` — upper reasonable bound before drift/overload.

Bands adapt to current stability (tau) and overall balance:
- higher tau → **wider** corridor (organism is resilient),
- low tau → **narrower** corridor (organism is fragile).

The snapshot `fuzzyBounds` stores per-axis bands plus global indices:

- `globalMiniminIndex` — distance from the floor,
- `globalMinimaxIndex` — adherence to safe corridors,
- `globalMaximaxIndex` — proximity to upper bounds.

Downstream layers can use this to pick strategies (gentle vs experimental vs crisis), tune load rhythms, or surface risk/fragility on dashboards.

## 10. L0 Cerebellum — smoothing and coordination

The **L0 Cerebellum** is the smoothing/coordination layer for the orientation core. After orientation/polarity/load/fuzzy bounds are computed, `runCerebellumStep(...)`:

- derives healthy targets for each axis (L/S/C) by using the **minimax** bands for yin/yang/tau,
- nudges current yin/yang/tau toward those targets with small, capped micro-movements instead of hard jumps,
- recalculates polarity aggregates (global ratio, drift, tau) and lightly retunes the load profile based on the resulting stability.

The cerebellum snapshot records:

- `adjustedPolarity` and `adjustedLoadProfile` (post-smoothing),
- per-axis micro corrections (`yinDelta`, `yangDelta`, `tauDelta`, `smoothnessGain`),
- `stabilityScore` / `smoothnessScore` summarizing how calm and steady the step was.

Why it matters:

- keeps axis transitions **smooth** and reduces oscillations,
- coordinates yin/yang/tau breathing with the L/S/C balance,
- lowers brittleness by avoiding sharp stress spikes and promoting gentle integration when stability is high.

This makes L0 feel less like a discrete switchboard and more like a living cerebellum that quietly steadies the organism’s posture in motion.

### Cerebellum modes (soft / balanced / strict)

- **soft** — минимальные дельты, высокая инерция: подходит для бережных сценариев (детские, восстановление, терапевтические сессии).
- **balanced** — стандартный режим (по умолчанию), ровное сглаживание без резких скачков.
- **strict** — агрессивнее гасит перекосы и быстрее тянет к целевым зонам (полезно для стресс-тестов или прод-стабилизации).

Режим задаётся переменной окружения `LIMINAL_CEREBELLUM_MODE` (`soft` | `balanced` | `strict`). Если не указано, используется `balanced`.

### Cerebellum diagnostics

`CerebellumSnapshot` теперь включает быстрые индикаторы, которые можно логировать или выводить на дашборд:

- `totalCorrectionMagnitude` — суммарная сила микрокоррекций за шаг (0..1).
- `overshootRisk` — риск «перекатывания» за целевые значения (учитывает величину коррекции и τ-устойчивость).
- `axisImbalanceIndex` — насколько сильно расходятся оси L/S/C по коррекциям.
- `mode` — активный пресет мозжечка (soft / balanced / strict).

Идея: видеть не только «куда» двигается организм, но и «как мягко» он это делает, где может возникнуть перелёт и какая ось требует больше внимания.

## 11. L0 Axis Coupling Layer (ACL)

ACL связывает три оси (L/S/C) в живую сеть влияний. Для каждой пары строится мини-динамика с тремя компонентами:

- `direct` — положительное влияние/рост,
- `reverse` — тормозящее влияние (обратная связь),
- `holding` — удерживающий тонус между осями.

Дополнительно рассчитываются:

- `resonance` и `flow` (direct × holding − overloadRisk/2),
- `overloadRisk` — риск перегруза или подавления,
- `resonanceFlow` / `stabilityIndex` — усреднённые показатели по всем парам,
- `baselineFlow` — минимальный «микропоток» между осями (даже в плоских состояниях),
- `pairStiffness` — мягкая настройка жёсткости связей L–S / L–C / S–C.

Снимок сохраняется в `axisCoupling` и используется мозжечком для более осознанных микрокоррекций: сглаженные движения строятся не только на полярности одной оси, но и на её связи с соседними.

Микропоток (`baselineFlow`) предотвращает полное «схлопывание» связи, а `pairStiffness` позволяет варьировать тонус пары (L–S мягче, L–C глубже, S–C — нейтрально/жёстче).

Результат: оси больше не развиваются изолированно — они **взаимно поддерживают и сдерживают** друг друга, как возбудительные/тормозящие контуры в живой нервной системе.
