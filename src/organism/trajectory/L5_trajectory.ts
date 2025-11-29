// L5 Trajectory snapshot — how many steps the organism plans and keeps when following its purpose.

export interface L5TrajectorySnapshot {
  stepsPlanned: number; // сколько шагов существо планирует вперёд
  stepsKept: number; // сколько реально удерживает
  courseStability: number; // 0..1 — насколько стабилен курс
  note: string;
}

export function computeL5TrajectorySnapshot(params: {
  purposeHorizon: number; // из L5PurposeVector
  trajectoryDiscipline: number; // из L5PurposeVector
  replanningFlexibility: number; // из L5PurposeVector
  sequenceCapacity: {
    maxSteps: number; // из L4TaskSequenceCapacity
    reliableSteps: number; // из L4TaskSequenceCapacity
  };
}): L5TrajectorySnapshot {
  const { purposeHorizon, trajectoryDiscipline, replanningFlexibility, sequenceCapacity } = params;

  const baseSteps = sequenceCapacity.maxSteps;
  const plannedScale = 2 + Math.round(3 * purposeHorizon); // условно 2–5 блоков

  const stepsPlanned = plannedScale * Math.max(1, baseSteps);
  const stepsKept = Math.round(
    stepsPlanned * (0.5 + 0.3 * trajectoryDiscipline - 0.1 * replanningFlexibility),
  );

  const courseStability = clamp01(
    0.5 * trajectoryDiscipline + 0.3 * (stepsKept / Math.max(1, stepsPlanned)) + 0.1,
  );

  return {
    stepsPlanned,
    stepsKept: Math.max(0, stepsKept),
    courseStability,
    note: `L5: удержание траектории — ${stepsKept}/${stepsPlanned} условных шагов, стабильность≈${courseStability.toFixed(2)}.`,
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
