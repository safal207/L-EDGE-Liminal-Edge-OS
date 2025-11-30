import type {
  ContentmentSignal,
  FinitenessIndex,
  MeaningKernelInput,
  MeaningKernelState,
  PurposeVector,
} from "./l18-types";

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Нормализация purpose-вектора так, чтобы сумма inner+social+cosmic ≈ 1.
 */
const normalizePurposeVector = (p: PurposeVector): PurposeVector => {
  const sum = p.inner + p.social + p.cosmic;
  if (sum <= 0) {
    return { ...p, inner: 1, social: 0, cosmic: 0 };
  }
  return {
    ...p,
    inner: p.inner / sum,
    social: p.social / sum,
    cosmic: p.cosmic / sum,
  };
};

const computeFinitenessIndex = (input: MeaningKernelInput): FinitenessIndex => {
  const { timeBudgetSteps, maxTimeBudgetSteps, resourceLoad } = input.resourceEstimate;

  const horizonRatio =
    maxTimeBudgetSteps > 0 ? timeBudgetSteps / maxTimeBudgetSteps : 1;

  // Чем меньше горизонт, тем выше awareness конечности
  const timeHorizonComponent = clamp01(1 - horizonRatio);

  // Чем выше нагрузка, тем сильнее ощущается ценность ресурса
  const resourcePressureComponent = clamp01(resourceLoad);

  const value = clamp01(0.6 * timeHorizonComponent + 0.4 * resourcePressureComponent);

  return {
    value,
    timeHorizonComponent,
    resourcePressureComponent,
  };
};

const computeContentmentSignal = (
  input: MeaningKernelInput,
  finiteness: FinitenessIndex
): ContentmentSignal => {
  const { temporal, timeCrystal, purpose: rawPurpose } = input;
  const purpose = normalizePurposeVector(rawPurpose);

  // Берём текущие оси
  const now = temporal.now;
  if (!now) {
    return {
      value: 0.5,
      purposeAlignment: 0.5,
      goalAlignment: 0.5,
      finitenessCoherence: 0.5,
    };
  }

  const axes = now.axes;

  // Вычисляем согласованность с Purpose Vector:
  // скалярное произведение нормализованного PV и текущих осей.
  const axisSum = axes.inner + axes.social + axes.cosmic || 1;
  const normAxes = {
    inner: axes.inner / axisSum,
    social: axes.social / axisSum,
    cosmic: axes.cosmic / axisSum,
  };

  const dot =
    purpose.inner * normAxes.inner +
    purpose.social * normAxes.social +
    purpose.cosmic * normAxes.cosmic;

  const purposeAlignment = clamp01(dot);

  // goalAlignment уже есть в timeCrystal
  const goalAlignment = clamp01(timeCrystal.alignment.value);

  // finitenessCoherence:
  // если finitenessIndex высок, но TMI слишком высокий — мы "жжём себя".
  // если finitenessIndex низкий, а дрейф огромный — мы живём как будто бесконечны.
  const tmi = timeCrystal.tmi.value; // 0..~3
  const drift = timeCrystal.drift.value; // 0..1

  // Хотим, чтобы:
  // - при высоком FI TMI и drift были умеренными;
  // - при низком FI drift/TMI не зашкаливали.
  const tmiNorm = clamp01(tmi / 3);

  // Простая формула "гармоничности":
  const finitenessCoherence = clamp01(
    1 -
      Math.abs(
        finiteness.value * (tmiNorm + drift) - (1 - finiteness.value) * drift
      )
  );

  // Итоговая удовлетворённость:
  const value = clamp01(
    0.6 * purposeAlignment +
      0.25 * goalAlignment +
      0.15 * finitenessCoherence
  );

  return {
    value,
    purposeAlignment,
    goalAlignment,
    finitenessCoherence,
  };
};

/**
 * Главная функция: строим состояние Meaning Kernel.
 */
export const computeMeaningKernelState = (
  input: MeaningKernelInput
): MeaningKernelState => {
  const purpose = normalizePurposeVector(input.purpose);
  const finiteness = computeFinitenessIndex(input);
  const contentment = computeContentmentSignal(input, finiteness);

  return {
    purpose,
    finiteness,
    contentment,
  };
};
