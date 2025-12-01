export interface VisionLoopState {
  loopId: string;
  innerSensing: number; // 0..1
  outerSensing: number; // 0..1
  temporalDepth: number; // 0..1
  plasticity: number; // 0..1
  visionScore: number; // 0..1, агрегат четырёх опор
  lastUpdated: number;
  note?: string;
}

export interface VisionSignals {
  innerSensing: number;
  outerSensing: number;
  temporalDepth: number;
  plasticity: number;
  note?: string;
}

export interface VisionUpdateOptions {
  smoothing?: number; // 0..1, 0 — жёсткое новое значение, 1 — полностью прошлое
  timestamp?: number;
  note?: string;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

/**
 * Усреднение четырёх опор с учётом самого слабого канала, чтобы зрение
 * не маскировалось одной сильной метрикой при провале другой.
 */
export const computeVisionScore = (signals: VisionSignals): number => {
  const values = [
    clamp01(signals.innerSensing),
    clamp01(signals.outerSensing),
    clamp01(signals.temporalDepth),
    clamp01(signals.plasticity),
  ];

  const average = values.reduce((acc, value) => acc + value, 0) / values.length;
  const weakestChannel = Math.min(...values);

  // Подмешиваем слабое звено, чтобы оно тянуло оценку вниз при дисбалансе.
  return clamp01(average * 0.7 + weakestChannel * 0.3);
};

const smoothValue = (previous: number, incoming: number, smoothing: number): number => {
  const alpha = clamp01(1 - smoothing);
  return clamp01(previous * smoothing + incoming * alpha);
};

/**
 * Обновляет состояние конкретной петли с учётом новых сигналов и сглаживания.
 * Сглаживание по умолчанию мягко подклеивает новое значение к прошлому
 * (smoothing=0.6 → 40% новых данных, 60% инерции).
 */
export const updateVisionLoopState = (
  loopId: string,
  signals: VisionSignals,
  previous?: VisionLoopState,
  options?: VisionUpdateOptions,
): VisionLoopState => {
  const smoothing = clamp01(options?.smoothing ?? 0.6);
  const timestamp = options?.timestamp ?? Date.now();
  const baseNote = options?.note ?? signals.note ?? previous?.note;

  const blended: VisionSignals = previous
    ? {
        innerSensing: smoothValue(previous.innerSensing, signals.innerSensing, smoothing),
        outerSensing: smoothValue(previous.outerSensing, signals.outerSensing, smoothing),
        temporalDepth: smoothValue(previous.temporalDepth, signals.temporalDepth, smoothing),
        plasticity: smoothValue(previous.plasticity, signals.plasticity, smoothing),
        note: baseNote,
      }
    : { ...signals, note: baseNote };

  return {
    loopId,
    innerSensing: blended.innerSensing,
    outerSensing: blended.outerSensing,
    temporalDepth: blended.temporalDepth,
    plasticity: blended.plasticity,
    visionScore: computeVisionScore(blended),
    lastUpdated: timestamp,
    note: baseNote,
  } satisfies VisionLoopState;
};
