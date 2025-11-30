export function computeFlowAlignmentIndex(inputs) {
  const { time, meaning, phase, context, collective } = inputs;

  const inner_alignment = avg([
    meaning.purpose_alignment,
    meaning.contentment,
    1 - Math.abs(time.drift)
  ]);

  const social_alignment = avg([
    collective.cohesion,
    collective.pass_network,
    1 - collective.conflict_level
  ]);

  const cosmic_alignment = avg([
    meaning.finiteness,
    time.tmi
  ]);

  const phase_fit = phase.stability;
  const context_fit = 1 - context.pressure_intensity * (context.pressure_type === "challenge" ? 0.7 : 0.4);

  const fai = avg([
    inner_alignment,
    social_alignment,
    cosmic_alignment,
    phase_fit,
    context_fit
  ]);

  return {
    fai: clamp01(fai),
    inner_alignment: clamp01(inner_alignment),
    social_alignment: clamp01(social_alignment),
    cosmic_alignment: clamp01(cosmic_alignment),
    phase_fit: clamp01(phase_fit),
    context_fit: clamp01(context_fit)
  };
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + (b ?? 0), 0) / arr.length;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v ?? 0));
}
