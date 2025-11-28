export type RGB = { r: number; g: number; b: number };

export const HEX = (c: RGB): string =>
  '#' + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('');

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * Math.max(0, Math.min(1, t));

export const mix = (a: RGB, b: RGB, t: number): RGB => ({
  r: Math.round(lerp(a.r, b.r, t)),
  g: Math.round(lerp(a.g, b.g, t)),
  b: Math.round(lerp(a.b, b.b, t)),
});

const GREEN: RGB = { r: 34, g: 197, b: 94 };
const YELLOW: RGB = { r: 234, g: 179, b: 8 };
const RED: RGB = { r: 239, g: 68, b: 68 };
const GRAY: RGB = { r: 148, g: 163, b: 184 };

export const triGradient = (a: RGB, b: RGB, c: RGB, t: number): RGB => {
  const x = Math.max(0, Math.min(1, t));
  if (x <= 0.5) return mix(a, b, x / 0.5);
  return mix(b, c, (x - 0.5) / 0.5);
};

export const colorForStress = (stressIndex: number): string => HEX(triGradient(GREEN, YELLOW, RED, stressIndex));

export const colorForRecovery = (recoveryScore: number): string => HEX(triGradient(RED, YELLOW, GREEN, recoveryScore));

export const colorForOverloadRisk = (risk: number): string => {
  const start = mix(GRAY, GREEN, 0.35);
  return HEX(triGradient(start, YELLOW, RED, risk));
};

export const colorForMode = (
  mode: 'normal' | 'recovery' | 'deep_recovery' | 'overload',
): string => {
  switch (mode) {
    case 'normal':
      return HEX(GREEN);
    case 'recovery':
      return HEX(YELLOW);
    case 'deep_recovery':
      return HEX(mix(YELLOW, GREEN, 0.25));
    case 'overload':
    default:
      return HEX(RED);
  }
};

