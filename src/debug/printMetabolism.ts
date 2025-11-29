import { colorForMode, colorForOverloadRisk, colorForRecovery, colorForStress } from '@/ui/colorScale';

const bar = (value: number, length = 20): string => {
  const clamped = Math.max(0, Math.min(1, value));
  const filled = Math.round(clamped * length);
  return '█'.repeat(filled) + '·'.repeat(Math.max(0, length - filled));
};

const paint = (hex: string, text: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
};

export interface PrintableMetabolism {
  stressIndex: number;
  recoveryScore: number;
  overloadRisk: number;
  mode: 'normal' | 'recovery' | 'deep_recovery' | 'overload';
  overloadAxes: Array<'L' | 'S' | 'C'>;
  note?: string;
}

export const printMetabolism = (meta: PrintableMetabolism): void => {
  const stressColor = colorForStress(meta.stressIndex);
  const recoveryColor = colorForRecovery(meta.recoveryScore);
  const riskColor = colorForOverloadRisk(meta.overloadRisk);
  const modeColor = colorForMode(meta.mode);

  console.log('— Metabolism —');
  console.log(`mode          : ${paint(modeColor, meta.mode)}`);
  console.log(
    `stressIndex   : ${paint(stressColor, meta.stressIndex.toFixed(2))}  ${paint(stressColor, bar(meta.stressIndex))}`,
  );
  console.log(
    `recoveryScore : ${paint(recoveryColor, meta.recoveryScore.toFixed(2))}  ${paint(
      recoveryColor,
      bar(meta.recoveryScore),
    )}`,
  );
  console.log(
    `overloadRisk  : ${paint(riskColor, meta.overloadRisk.toFixed(2))}  ${paint(riskColor, bar(meta.overloadRisk))}`,
  );
  console.log(`overloadAxes  : ${meta.overloadAxes.length ? meta.overloadAxes.join(', ') : '—'}`);
  if (meta.note) {
    console.log(`note          : ${meta.note}`);
  }
};

