// src/core/autopoiesis/transitionFeeling.ts

import type { AxisVector, TransitionFeeling, PhaseDirection } from "./L16_autopoietic_types";

export interface TransitionContext {
  phaseBefore: number;  // φ_old  0..1
  phaseAfter: number;   // φ_new  0..1
  deltaTimeMs: number;  // Δt
  axisBefore: AxisVector;
  axisAfter: AxisVector;
}

/**
 * Нормализация 0..1
 */
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Определяем направление сдвига фазы:
 *  - сильное падение φ → "toward_rigidity" (охлаждение, лёд)
 *  - сильный рост φ   → "toward_chaos"   (перегрев, пар)
 *  - мягкий сдвиг     → "toward_fluidity" (текучая вода)
 */
const CHAOS_THRESHOLD = 0.33;
const RIGIDITY_THRESHOLD = -0.33;

const getPhaseDirection = (deltaPhase: number): PhaseDirection => {
  if (deltaPhase > CHAOS_THRESHOLD) return "toward_chaos";
  if (deltaPhase < RIGIDITY_THRESHOLD) return "toward_rigidity";
  return "toward_fluidity";
};

/**
 * Вычисляем "чувство перехода" как нечёткую комбинацию:
 * - величины фазового сдвига
 * - скорости этого сдвига
 * - смещения баланса по осям inner/social/cosmic
 */
export const computeTransitionFeeling = (ctx: TransitionContext): TransitionFeeling => {
  const { phaseBefore, phaseAfter, deltaTimeMs, axisBefore, axisAfter } = ctx;

  const deltaPhase = phaseAfter - phaseBefore;
  const absDeltaPhase = Math.abs(deltaPhase);

  const safeDt = deltaTimeMs <= 0 ? 1 : deltaTimeMs;
  const rate = absDeltaPhase / safeDt; // "скорость" фазового перехода

  const axisShift: AxisVector = {
    inner: axisAfter.inner - axisBefore.inner,
    social: axisAfter.social - axisBefore.social,
    cosmic: axisAfter.cosmic - axisBefore.cosmic,
  };

  const avgAxisShift =
    (Math.abs(axisShift.inner) +
      Math.abs(axisShift.social) +
      Math.abs(axisShift.cosmic)) / 3;

  // Нечёткая "интенсивность": микс фазы, скорости и осей
  const rawIntensity =
    0.4 * absDeltaPhase +
    0.4 * rate * 1000 + // умножаем на 1000, если Δt в мс, чтобы не было слишком маленьких значений
    0.2 * avgAxisShift;

  const intensity = clamp01(rawIntensity);

  const direction = getPhaseDirection(deltaPhase);

  return {
    intensity,
    direction,
    deltaPhase,
    rate,
    axisShift,
    phaseBefore,
    phaseAfter,
  };
};
