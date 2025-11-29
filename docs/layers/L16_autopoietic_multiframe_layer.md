# L16 — Autopoietic Multiframe Assembly Layer (AMAL)

## Overview

L16 adds a lightweight autopoietic control layer that keeps the organism stable
across multiple perception frames while training resilience through controlled
disturbances. The layer integrates internal state (axes, metabolism, crystal,
growth) with external signals (stress/recovery/exploration) and runs an immune
cycle that detects imbalance, compensates, stabilizes, and integrates small
learning gains after every disturbance.

Key capabilities:

1. **Multiframe assembly** — near/mid/far frame configurations with distinct
   balance vectors (inner/social/cosmic) and Yin/Yang/Tao anchors. Frames can be
   blended smoothly to avoid abrupt jumps.
2. **Tensegrity potential** — measures how far the current state is from the
   target frame (and from metabolic balance). Used to decide whether to start a
   recovery cycle or allow training disturbances.
3. **Disturbance training** — optional, guarded perturbations (magnitude-limited)
   that exercise the organism’s ability to recover without destabilising the
   core.
4. **Autopoietic immune cycle** — state machine with phases
   `Idle → Detecting → Compensating → Stabilizing → Integrating → Idle` that
   raises stability, tracks recovery time, and applies a small learning gain
   when cycles finish.
5. **Stability metrics** — `stabilityIndex`, `recoveryTimeMs`, `overshootLevel`,
   `learningGain`, and `tensegrityPotential` are exposed on each snapshot for
   downstream dashboards and control logic.

### TransitionFeeling: чувство как сенсор перехода

L16 не только измеряет устойчивость организма, но и фиксирует то, **как он “чувствует” переходы состояний**.

Мы вводим сущность `TransitionFeeling`, которая описывает:

- `intensity` — насколько сильным был переход (0..1),
- `direction` — в какую сторону сдвинулась фаза:
  - `toward_rigidity` (сжатие, охлаждение),
  - `toward_fluidity` (текучесть, мягкая адаптация),
  - `toward_chaos` (перегрев, высокая вариативность),
- `deltaPhase` и `rate` — величина и скорость переключения фазы,
- `axisShift` — смещение фокуса по трём осям (inner / social / cosmic).

Интуитивно:

> **когда организм меняет состояние, он ощущает “волну перехода” — это и есть TransitionFeeling.**

Эти данные используются для:
- диагностики метастабильности,
- визуализации переходов,
- последующих адаптаций в онтогенезе.

## Data structures

* `MultiframeConfig` — frameId (`near|mid|far`), balance vector, Yin/Yang/Tao
  state, and a baseline tensegrity potential.
* `DisturbanceScenario` — id, targetFrame, magnitude, optional axis bias,
  duration, safeguard flag.
* `ImmuneCycleState` — current phase, active disturbance (if any), frame before
  compensation, metrics snapshot, timestamps.
* `StabilityMetrics` — stabilityIndex, recoveryTimeMs, overshootLevel,
  learningGain.
* `AutopoieticSnapshot` — current and target frames, tensegrity potential,
  immune cycle state, stability metrics, and notes.

## How it runs each heartbeat

1. Pick a **target frame** from defaults (near/mid/far) based on stress,
   overload risk, harmony, and growth mode.
2. **Blend** the previous frame toward the target to keep movement smooth.
3. Compute **tensegrity potential** (distance between frame and tri-axis/metabolic
   balance). If it exceeds the tolerance or overload risk is high, start the
   immune cycle.
4. Optionally **inject a training disturbance** during exploratory windows when
   risk is low (bounded by safeguards).
5. Run the **immune cycle** phase machine to compensate, stabilise, and integrate
   a small learning gain when stability crosses the threshold.
6. Emit a fresh `AutopoieticSnapshot` attached to the `OrganismSnapshot` and the
   ontogenesis vector.

## Configuration (defaults)

* Frames: near/mid/far with example balance and Yin/Yang/Tao anchors.
* Disturbance guard: maxMagnitude `0.4`, defaultDurationMs `5000`, safeguard
  enabled.
* Immune cycle: stabilityThreshold `0.75`, maxRecoveryTimeMs `15000`,
  learningGainFactor `0.05`, tensegrityTolerance `0.65`.

## Usage

* The **organism pipeline** now computes an `AutopoieticSnapshot` each heartbeat.
* **Ontogenesis vectors** include `autopoietic` for timelines and dashboards.
* **Debug renderer** prints tensegrity potential, stability, immune phase, and
  active disturbances alongside existing L9–L13 telemetry.

This layer turns the organism into a self-training, multi-frame system that not
only bounces back from disturbances but integrates the experience to become a
bit more resilient after every cycle.
