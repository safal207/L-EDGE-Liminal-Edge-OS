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

  if (polarity) {
    yinBias = clampMinus1to1(Math.log2(polarity.globalRatio || 1));
  }

  globalStress = 0.3 + 0.4 * balanceIndex;
  applyModeAdjustments();
  applyYinYangBias();

  const note =
    buildNote(mode, balanceIndex) +
    (polarity ? ` Yin/Yang drift=${yinBias.toFixed(2)}. ${polarity.note}` : '');

  return {
    globalStress: clamp01(globalStress),
    embodimentFocus: clamp01(embodimentFocus),
    playExplorationFocus: clamp01(playExplorationFocus),
    skillDrillFocus: clamp01(skillDrillFocus),
    meaningReflectionFocus: clamp01(meaningReflectionFocus),
    socialFocus: clamp01(socialFocus),
    cosmicExplorationFocus: clamp01(cosmicExplorationFocus),
    yinBias,
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
