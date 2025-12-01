import { defaultL21FlowConfig } from "./L21_config.js";

export function detectLuckWindow(inputs, alignment, config = defaultL21FlowConfig) {
  const fai = alignment.fai;
  const pressure = inputs.context.pressure_intensity;
  const phaseStability = inputs.phase.stability;

  const is_open = fai >= config.luckThresholds.open && phaseStability > 0.5;
  const strength = clamp01((fai - config.luckThresholds.open) * 2 * phaseStability * (1 - pressure));

  let expected_duration_steps = 0;
  if (is_open) {
    if (strength > 0.8) expected_duration_steps = 3;
    else if (strength > 0.5) expected_duration_steps = 2;
    else expected_duration_steps = 1;
  }

  const recommended_mode = chooseRecommendedMode(fai, pressure, phaseStability, config);

  const timing = computeTiming(is_open, expected_duration_steps);

  return {
    is_open,
    strength,
    expected_duration_steps,
    recommended_mode,
    timing,
    openness: strength
  };
}

function chooseRecommendedMode(fai, pressure, phase, config) {
  const { pressureSweetSpot } = config;
  const inSweetSpot = pressure >= pressureSweetSpot.min && pressure <= pressureSweetSpot.max;

  if (fai > 0.8 && pressure < pressureSweetSpot.max && phase > 0.6) return "push";
  if (fai > 0.7 && inSweetSpot) return "explore";
  if (pressure > pressureSweetSpot.max) return "stabilize";
  if (phase < 0.4) return "slow_down";
  return "stabilize";
}

function computeTiming(isOpen, durationSteps) {
  if (isOpen && durationSteps >= 2) return "now";
  if (isOpen) return "soon";
  return "later";
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v ?? 0));
}
