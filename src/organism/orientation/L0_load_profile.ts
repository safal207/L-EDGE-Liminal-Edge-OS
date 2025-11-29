import type { OrientationSnapshot } from './L0_center';
import type { PolaritySnapshot } from './L0_polarity';

export interface LoadProfile {
  globalStress: number;
  embodimentFocus: number;
  playExplorationFocus: number;
  skillDrillFocus: number;
  meaningReflectionFocus: number;
  socialFocus: number;
  cosmicExplorationFocus: number;
  yinBias: number; // -1..1 — -1 = more yang/action, +1 = more yin/integration
  tauSupport: number; // 0..1 — support for tau (gray) state where yin ~= yang
  note: string;
}

export function computeLoadProfile(
  orientation: OrientationSnapshot,
  polarity?: PolaritySnapshot,
): LoadProfile {
  const { balanceIndex, mode } = orientation;

  let globalStress = 0.5;
  let embodimentFocus = 0.5;
  let playExplorationFocus = 0.5;
  let skillDrillFocus = 0.5;
  let meaningReflectionFocus = 0.5;
  let socialFocus = 0.5;
  let cosmicExplorationFocus = 0.5;
  let yinBias = 0;
  let tauSupport = 0.5;

  if (polarity) {
    yinBias = clampMinus1to1(Math.log2(polarity.globalRatio || 1));
    tauSupport = clamp01(polarity.globalTau);
  }

  globalStress = 0.3 + 0.4 * balanceIndex;
  applyModeAdjustments();
  applyYinYangBias();
  applyTauSupport();

  const noteParts: string[] = [];
  noteParts.push(buildNote(mode, balanceIndex));
  if (polarity) {
    noteParts.push(
      `Yin/Yang drift=${yinBias.toFixed(2)}, globalTau=${polarity.globalTau.toFixed(2)}`,
    );
  }
  noteParts.push(`tauSupport=${tauSupport.toFixed(2)}`);
  const note = noteParts.join(' | ');

  return {
    globalStress: clamp01(globalStress),
    embodimentFocus: clamp01(embodimentFocus),
    playExplorationFocus: clamp01(playExplorationFocus),
    skillDrillFocus: clamp01(skillDrillFocus),
    meaningReflectionFocus: clamp01(meaningReflectionFocus),
    socialFocus: clamp01(socialFocus),
    cosmicExplorationFocus: clamp01(cosmicExplorationFocus),
    yinBias,
    tauSupport,
    note,
  };

  function applyModeAdjustments() {
    if (mode === 'balanced') return;

    if (mode === 'L_overload') {
      meaningReflectionFocus += 0.1;
      skillDrillFocus -= 0.05;
      socialFocus -= 0.05;
      globalStress -= 0.05;
    } else if (mode === 'S_overload') {
      socialFocus += 0.1;
      embodimentFocus -= 0.05;
      playExplorationFocus -= 0.05;
      globalStress += 0.05;
    } else if (mode === 'C_overload') {
      cosmicExplorationFocus += 0.1;
      meaningReflectionFocus -= 0.05;
      skillDrillFocus -= 0.05;
    } else if (mode === 'L_starved') {
      meaningReflectionFocus += 0.1;
      skillDrillFocus += 0.05;
      globalStress += 0.05;
    } else if (mode === 'S_starved') {
      embodimentFocus += 0.1;
      socialFocus += 0.1;
      playExplorationFocus += 0.05;
    } else if (mode === 'C_starved') {
      cosmicExplorationFocus += 0.1;
      skillDrillFocus += 0.05;
      playExplorationFocus += 0.05;
    }
  }

  function applyYinYangBias() {
    if (yinBias > 0.1) {
      meaningReflectionFocus += 0.2 * yinBias;
      playExplorationFocus += 0.1 * yinBias;

      skillDrillFocus -= 0.1 * yinBias;
      socialFocus -= 0.1 * yinBias;
      globalStress -= 0.05 * yinBias;
    } else if (yinBias < -0.1) {
      const k = -yinBias;
      skillDrillFocus += 0.2 * k;
      socialFocus += 0.2 * k;
      playExplorationFocus += 0.1 * k;

      meaningReflectionFocus -= 0.1 * k;
      globalStress += 0.05 * k;
    }
  }

  function applyTauSupport() {
    if (tauSupport >= 0.7) {
      globalStress -= 0.05 * (tauSupport - 0.7) / 0.3;
      playExplorationFocus += 0.05 * tauSupport;
      meaningReflectionFocus += 0.05 * tauSupport;
    } else if (tauSupport <= 0.3) {
      const deficit = (0.3 - tauSupport) / 0.3;
      globalStress += 0.05 * deficit;

      if (yinBias > 0.1) {
        const k = deficit * yinBias;
        skillDrillFocus += 0.1 * k;
        socialFocus += 0.1 * k;
      } else if (yinBias < -0.1) {
        const k = deficit * -yinBias;
        meaningReflectionFocus += 0.1 * k;
        playExplorationFocus += 0.1 * k;
      }
    }
  }
}

function buildNote(mode: OrientationSnapshot['mode'], balanceIndex: number): string {
  return `L0-load: mode=${mode}, balance=${balanceIndex.toFixed(2)}.`;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function clampMinus1to1(x: number): number {
  return Math.min(1, Math.max(-1, x));
}
