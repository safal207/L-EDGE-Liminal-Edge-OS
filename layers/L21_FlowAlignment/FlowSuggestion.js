export function buildFlowSuggestion(inputs, alignment, luckWindow, cooperativeField) {
  const fai = alignment.fai;
  const pressure = inputs.context.pressure_intensity;
  const phase = inputs.phase.stability;

  let mode = "stabilize";

  if (luckWindow.is_open) {
    if (luckWindow.recommended_mode) {
      mode = luckWindow.recommended_mode;
    } else if (fai > 0.8 && pressure < 0.5 && phase > 0.6) {
      mode = "push";
    } else if (fai > 0.7) {
      mode = "explore";
    }
  } else {
    if (pressure > 0.7 || phase < 0.4) {
      mode = "slow_down";
    } else {
      mode = "stabilize";
    }
  }

  const confidence = computeConfidence(fai, luckWindow, phase, pressure);

  return {
    mode,
    confidence,
    reasoning: {
      fai,
      luck_window: luckWindow.is_open,
      luck_strength: luckWindow.strength,
      context_pressure_type: inputs.context.pressure_type,
      phase_state: inputs.phase.state
    }
  };
}

function computeConfidence(fai, luckWindow, phase, pressure) {
  let base = fai;
  if (luckWindow.is_open) base += luckWindow.strength * 0.2;
  base += (phase - pressure) * 0.1;
  return Math.max(0, Math.min(1, base));
}
