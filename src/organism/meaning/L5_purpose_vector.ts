// L5 Purpose Vector — captures horizon, discipline, and replanning flexibility for trajectory decisions.

export interface L5PurposeVector {
  purposeHorizon: number; // 0..1 — насколько далеко смотрит вперёд
  trajectoryDiscipline: number; // 0..1 — удержание курса
  replanningFlexibility: number; // 0..1 — гибкость пересборки пути
  note: string;
}

export function computeL5PurposeVector(params: {
  meaningCoherence: number; // из L5MeaningSnapshot
  innerWhyStrength: number; // из L5MeaningSnapshot
  selfReflectionDepth: number; // из L5MeaningSnapshot
  sequenceCapacity: {
    maxSteps: number; // из L4TaskSequenceCapacity
    reliableSteps: number; // из L4TaskSequenceCapacity
    dropoffRate: number; // из L4TaskSequenceCapacity
  };
}): L5PurposeVector {
  const { meaningCoherence, innerWhyStrength, selfReflectionDepth, sequenceCapacity } = params;

  const seqRatio = sequenceCapacity.maxSteps > 0
    ? sequenceCapacity.reliableSteps / sequenceCapacity.maxSteps
    : 0.0;

  const purposeHorizon = clamp01(
    0.4 * meaningCoherence + 0.3 * selfReflectionDepth + 0.2 * innerWhyStrength,
  );

  const trajectoryDiscipline = clamp01(0.5 * seqRatio + 0.3 * innerWhyStrength + 0.1);

  const replanningFlexibility = clamp01(
    0.4 * selfReflectionDepth + 0.2 * (1 - sequenceCapacity.dropoffRate) + 0.2,
  );

  return {
    purposeHorizon,
    trajectoryDiscipline,
    replanningFlexibility,
    note: 'L5: вектор направления — горизонт, дисциплина и гибкость пересборки курса.',
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
