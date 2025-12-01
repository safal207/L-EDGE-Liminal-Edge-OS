import { classifyFlowQuality, defaultL21FlowConfig } from "./L21_config.js";

export function buildFlowSuggestion(inputs, alignment, luckWindow, cooperativeField, config = defaultL21FlowConfig) {
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

  const confidence = computeConfidence(fai, luckWindow, phase, pressure, config);
  const explain = buildFlowExplain({
    mode,
    fai,
    pressure,
    phase,
    luckWindow,
    alignmentQuality: classifyFlowQuality(fai, config),
    cooperativeField,
  });

  return {
    mode,
    confidence,
    explain,
    reasoning: {
      fai,
      luck_window: luckWindow.is_open,
      luck_strength: luckWindow.strength,
      context_pressure_type: inputs.context.pressure_type,
      phase_state: inputs.phase.state
    }
  };
}

function computeConfidence(fai, luckWindow, phase, pressure, config) {
  let base = fai;
  if (luckWindow.is_open) base += luckWindow.strength * 0.2;
  const { min, max } = config.pressureSweetSpot;
  const pressureFit = pressure >= min && pressure <= max ? 0.05 : -0.05;
  base += (phase - pressure) * 0.1 + pressureFit;
  return Math.max(0, Math.min(1, base));
}

function buildFlowExplain({ mode, fai, pressure, phase, luckWindow, alignmentQuality, cooperativeField }) {
  const messages = [];

  const luckMsg = luckWindow.is_open
    ? `Luck window open (${(luckWindow.strength * 100).toFixed(0)}%)`
    : "Luck window closed";
  const pressureMsg = `Context pressure ${(pressure * 100).toFixed(0)}%`;
  const phaseMsg = `Phase stability ${(phase * 100).toFixed(0)}% (${mode})`;
  const coop = cooperativeField || {};
  const cooperativeScore = ((coop.cohesion ?? 0) + (coop.spacing ?? 0) + (coop.passing_lanes ?? 0)) / 3;
  const coopMsg = `Cooperative field ${(cooperativeScore * 100).toFixed(0)}% (conflict ${(coop.conflict_level ?? 0) * 100}%)`;

  messages.push(`Flow alignment ${alignmentQuality} (FAI ${(fai * 100).toFixed(0)}%)`);
  messages.push(luckMsg);
  messages.push(pressureMsg);
  messages.push(phaseMsg);
  messages.push(coopMsg);
  messages.push(`Chosen flow mode: ${mode}`);

  return messages;
}
