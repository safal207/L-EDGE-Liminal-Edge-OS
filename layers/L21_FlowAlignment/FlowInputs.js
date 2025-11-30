export function buildFlowInputs(innerState = {}, contextState = {}, phaseState = {}, collectiveState = null) {
  return {
    time: {
      age_phase: innerState.time?.age_phase ?? "L0",
      tmi: innerState.time?.tmi ?? 0,
      drift: innerState.time?.drift ?? 0
    },
    meaning: {
      purpose_alignment: innerState.meaning?.purpose_alignment ?? 0,
      contentment: innerState.meaning?.contentment ?? 0,
      finiteness: innerState.meaning?.finiteness ?? 0
    },
    phase: {
      state: phaseState.state ?? "liquid",
      stability: phaseState.stability ?? 0.5
    },
    context: {
      pressure_type: contextState.pressure_type ?? "neutral",
      pressure_intensity: contextState.pressure_intensity ?? 0,
      relevance: contextState.relevance ?? 0
    },
    collective: {
      cohesion: collectiveState?.cohesion ?? 0,
      pass_network: collectiveState?.pass_network ?? 0,
      conflict_level: collectiveState?.conflict_level ?? 0
    }
  };
}
