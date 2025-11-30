export function evaluateCooperativeField(inputs, collectiveState) {
  const c = inputs.collective;

  const cohesion = c.cohesion ?? 0;
  const spacing = c.pass_network ?? 0; // упрощённо считаем, что чем больше линий паса, тем лучше "раскрытие"
  const conflict_level = c.conflict_level ?? 0;
  const passing_lanes = c.pass_network ?? 0;

  return {
    cohesion,
    spacing,
    passing_lanes,
    conflict_level
  };
}
