export interface ResonancePreset {
  name: 'soft' | 'balanced' | 'strict' | 'circadian' | 'focus';
  baseFreqHz: number;
  lWeight: number;
  sWeight: number;
  cWeight: number;
  phaseShiftLS: number;
  phaseShiftLC: number;
  phaseShiftSC: number;
  longWaveFactor: number;
  couplingGain: number;
}

export const RESONANCE_PRESETS: Record<string, ResonancePreset> = {
  soft: {
    name: 'soft',
    baseFreqHz: 0.08,
    lWeight: 0.38,
    sWeight: 0.32,
    cWeight: 0.3,
    phaseShiftLS: 0.15,
    phaseShiftLC: 0.2,
    phaseShiftSC: 0.1,
    longWaveFactor: 0.6,
    couplingGain: 0.4,
  },
  balanced: {
    name: 'balanced',
    baseFreqHz: 0.12,
    lWeight: 0.34,
    sWeight: 0.33,
    cWeight: 0.33,
    phaseShiftLS: 0.25,
    phaseShiftLC: 0.25,
    phaseShiftSC: 0.25,
    longWaveFactor: 0.8,
    couplingGain: 0.6,
  },
  strict: {
    name: 'strict',
    baseFreqHz: 0.16,
    lWeight: 0.33,
    sWeight: 0.37,
    cWeight: 0.3,
    phaseShiftLS: 0.35,
    phaseShiftLC: 0.15,
    phaseShiftSC: 0.3,
    longWaveFactor: 0.5,
    couplingGain: 0.8,
  },
  circadian: {
    name: 'circadian',
    baseFreqHz: 1 / 86400,
    lWeight: 0.35,
    sWeight: 0.35,
    cWeight: 0.3,
    phaseShiftLS: 0,
    phaseShiftLC: Math.PI / 4,
    phaseShiftSC: Math.PI / 6,
    longWaveFactor: 1,
    couplingGain: 0.5,
  },
  focus: {
    name: 'focus',
    baseFreqHz: 0.2,
    lWeight: 0.4,
    sWeight: 0.3,
    cWeight: 0.3,
    phaseShiftLS: 0.5,
    phaseShiftLC: 0.2,
    phaseShiftSC: 0.4,
    longWaveFactor: 0.4,
    couplingGain: 0.9,
  },
};

export function resolveResonancePreset(mode: string | undefined): ResonancePreset {
  if (!mode) return RESONANCE_PRESETS.balanced;
  return RESONANCE_PRESETS[mode] ?? RESONANCE_PRESETS.balanced;
}
