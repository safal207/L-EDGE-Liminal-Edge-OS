import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import { colorForMode, colorForOverloadRisk, colorForRecovery, colorForStress } from '@/ui/colorScale';

const paint = (hex: string, text: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
};

const bar = (value: number, length = 20): string => {
  const clamped = Math.max(0, Math.min(1, value));
  const filled = Math.round(clamped * length);
  return '█'.repeat(filled) + '·'.repeat(Math.max(0, length - filled));
};

export const renderOrganismSnapshot = (snapshot: OrganismSnapshot): void => {
  console.log('=== L-EDGE Organism Snapshot ===');
  console.log(`stage: L${snapshot.stage}  time: ${new Date(snapshot.timestamp).toISOString()}`);
  console.log(`axes: L=${snapshot.triAxis.L.value.toFixed(2)}  S=${snapshot.triAxis.S.value.toFixed(2)}  C=${snapshot.triAxis.C.value.toFixed(2)}`);

  console.log('\n--- L9: Metabolism ---');
  if (snapshot.metabolism) {
    const m = snapshot.metabolism;
    const stressColor = colorForStress(m.stressIndex);
    const recoveryColor = colorForRecovery(m.recoveryScore);
    const riskColor = colorForOverloadRisk(m.overloadRisk);
    const modeColor = colorForMode(m.mode);

    console.log(`mode          : ${paint(modeColor, m.mode)}`);
    console.log(`stressIndex   : ${paint(stressColor, m.stressIndex.toFixed(2))}  ${paint(stressColor, bar(m.stressIndex))}`);
    console.log(`recoveryScore : ${paint(recoveryColor, m.recoveryScore.toFixed(2))}  ${paint(recoveryColor, bar(m.recoveryScore))}`);
    console.log(`overloadRisk  : ${paint(riskColor, m.overloadRisk.toFixed(2))}  ${paint(riskColor, bar(m.overloadRisk))}`);
    console.log(`overloadAxes  : ${m.overloadAxes.length ? m.overloadAxes.join(', ') : '—'}`);
    if (m.note) console.log(`note          : ${m.note}`);
  } else {
    console.log('no metabolism data');
  }

  console.log('\n--- L10: Crystal Growth ---');
  if (snapshot.crystal) {
    const c10 = snapshot.crystal;
    const harmonyColor = colorForRecovery(c10.harmony.harmonyIndex);
    const tensionColor = colorForOverloadRisk(c10.harmony.metabolicTension);
    const growthColor = colorForRecovery(c10.growth.growthMomentum);
    const stabilityColor = colorForRecovery(c10.growth.stabilityIndex);
    const overallColor = colorForRecovery(c10.overallScore);

    console.log(`harmonyIndex   : ${paint(harmonyColor, c10.harmony.harmonyIndex.toFixed(2))}  ${paint(harmonyColor, bar(c10.harmony.harmonyIndex))}`);
    console.log(`metabolicTension: ${paint(tensionColor, c10.harmony.metabolicTension.toFixed(2))}  ${paint(tensionColor, bar(c10.harmony.metabolicTension))}`);
    console.log(`growthMomentum : ${paint(growthColor, c10.growth.growthMomentum.toFixed(2))}  ${paint(growthColor, bar(c10.growth.growthMomentum))}`);
    console.log(`stabilityIndex : ${paint(stabilityColor, c10.growth.stabilityIndex.toFixed(2))}  ${paint(stabilityColor, bar(c10.growth.stabilityIndex))}`);
    console.log(`overallScore   : ${paint(overallColor, c10.overallScore.toFixed(2))}  ${paint(overallColor, bar(c10.overallScore))}`);
    console.log(`adjustments    : ${c10.growth.preferredAdjustments.length ? c10.growth.preferredAdjustments.join(', ') : '—'}`);
    if (c10.note) console.log(`note          : ${c10.note}`);
  } else {
    console.log('no crystal data');
  }

  console.log('==============================================');
};
