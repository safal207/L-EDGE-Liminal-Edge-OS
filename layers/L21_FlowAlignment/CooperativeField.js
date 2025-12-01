export function evaluateCooperativeField(inputs, collectiveState) {
  const c = inputs.collective;

  const cohesion = c.cohesion ?? 0;
  const spacing = c.pass_network ?? 0; // упрощённо считаем, что чем больше линий паса, тем лучше "раскрытие"
  const conflict_level = c.conflict_level ?? 0;
  const passing_lanes = c.pass_network ?? 0;

  const rawScore = (cohesion + spacing + passing_lanes) / 3;
  const score = clamp01(rawScore - conflict_level * 0.5);
  const mode = computeMode({ cohesion, conflict_level, spacing });

  return {
    cohesion,
    spacing,
    passing_lanes,
    conflict_level,
    score,
    mode
  };
}

function computeMode({ cohesion, conflict_level, spacing }) {
  if (conflict_level > 0.6) return "solo";
  if (cohesion > 0.6 && spacing > 0.6) return "team";
  return "clustered";
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v ?? 0));
}
