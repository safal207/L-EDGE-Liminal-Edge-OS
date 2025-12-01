export function detectLuckWindow(inputs, alignment) {
  const fai = alignment.fai;
  const pressure = inputs.context.pressure_intensity;
  const phaseStability = inputs.phase.stability;

  const is_open = fai > 0.7 && phaseStability > 0.5;
  const strength = clamp01((fai - 0.7) * 2 * phaseStability * (1 - pressure));

  let expected_duration_steps = 0;
  if (is_open) {
    if (strength > 0.8) expected_duration_steps = 3;
    else if (strength > 0.5) expected_duration_steps = 2;
    else expected_duration_steps = 1;
  }

  const recommended_mode = chooseRecommendedMode(fai, pressure, phaseStability);

  return {
    is_open,
    strength,
    expected_duration_steps,
    recommended_mode
  };
}

function chooseRecommendedMode(fai, pressure, phase) {
  if (fai > 0.8 && pressure < 0.4 && phase > 0.6) return "push";
  if (fai > 0.7 && pressure < 0.6) return "explore";
  if (pressure > 0.7) return "stabilize";
  if (phase < 0.4) return "slow_down";
  return "stabilize";
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v ?? 0));
}
