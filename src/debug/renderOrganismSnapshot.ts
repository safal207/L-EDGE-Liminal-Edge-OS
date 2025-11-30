import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import { renderResponseFrame } from '@/nerve/L13_response_render';
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

const growthModeColor = (
  mode: NonNullable<OrganismSnapshot['growthMode']>['mode'],
): string => {
  switch (mode) {
    case 'gentle':
      return colorForRecovery(0.8);
    case 'exploratory':
      return colorForRecovery(0.7);
    case 'intensive':
      return colorForOverloadRisk(0.45);
    case 'stabilizing':
      return colorForStress(0.4);
    case 'therapeutic':
      return colorForOverloadRisk(0.6);
    case 'frozen':
    default:
      return colorForOverloadRisk(0.9);
  }
};

export const renderOrganismSnapshot = (snapshot: OrganismSnapshot): void => {
  console.log('=== L-EDGE Organism Snapshot ===');
  console.log(`stage: L${snapshot.stage}  time: ${new Date(snapshot.timestamp).toISOString()}`);
  console.log(`axes: L=${snapshot.triAxis.L.value.toFixed(2)}  S=${snapshot.triAxis.S.value.toFixed(2)}  C=${snapshot.triAxis.C.value.toFixed(2)}`);

  if (snapshot.externalSignals) {
    const ext = snapshot.externalSignals;
    console.log('\n--- L12: External Signals ---');
    console.log(`externalStress      : ${ext.externalStress.toFixed(2)}`);
    console.log(`externalRecovery    : ${ext.externalRecovery.toFixed(2)}`);
    console.log(`externalExploration : ${ext.externalExploration.toFixed(2)}`);
    if (ext.lastStrongSignal) {
      console.log(
        `lastStrongSignal    : [${ext.lastStrongSignal.source}] ${ext.lastStrongSignal.kind} (intensity=${ext.lastStrongSignal.intensity.toFixed(
          2,
        )})`,
      );
    }
  }

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

  console.log('\n--- L11: Growth Mode ---');
  if (snapshot.growthMode) {
    const gm = snapshot.growthMode;
    const gmColor = growthModeColor(gm.mode);

    console.log(`mode          : ${paint(gmColor, gm.mode)} (conf=${gm.confidence.toFixed(2)})`);
    console.log(`reason        : ${gm.reason}`);
    if (gm.recommendations) {
      console.log('recommendations:', gm.recommendations);
    }
  } else {
    console.log('no growth mode data');
  }

  if (snapshot.temporal) {
    const { state, decision, timeCrystal } = snapshot.temporal;
    console.log('\n--- L17: Temporal Self-Steering ---');
    console.log(
      `mode          : ${decision.mode} (warning=${decision.warningLevel}, safe=${decision.safeToAdjust})`,
    );
    console.log(`tmi           : ${timeCrystal.tmi.value.toFixed(2)}  ${bar(Math.min(1, timeCrystal.tmi.value / 3))}`);
    console.log(`drift         : ${timeCrystal.drift.value.toFixed(2)}  ${bar(timeCrystal.drift.value)}`);
    console.log(`alignment     : ${timeCrystal.alignment.value.toFixed(2)}  ${bar(timeCrystal.alignment.value)}`);
    console.log(
      `deltaAxes     : inner=${timeCrystal.deltaAxes.inner.toFixed(2)} social=${timeCrystal.deltaAxes.social.toFixed(
        2,
      )} cosmic=${timeCrystal.deltaAxes.cosmic.toFixed(2)}`,
    );
    console.log(
      `phase target  : ${timeCrystal.targetPhase.toFixed(2)} (conf=${timeCrystal.confidence.toFixed(2)}, horizon=${
        timeCrystal.horizonSteps
      })`,
    );
    console.log(`history size  : ${state.past.length}`);
  }

  if (snapshot.autopoietic) {
    const auto = snapshot.autopoietic;
    const tenseColor = colorForOverloadRisk(auto.tensegrityPotential);
    const stabilityColor = colorForRecovery(auto.stability.stabilityIndex);

    console.log('\n--- L16: Autopoietic Assembly ---');
    console.log(
      `frame        : ${auto.currentFrame.frameId} → target ${auto.targetFrame.frameId} (${auto.immuneCycle.phase})`,
    );
    console.log(
      `tensegrity   : ${paint(tenseColor, auto.tensegrityPotential.toFixed(2))}  ${paint(
        tenseColor,
        bar(auto.tensegrityPotential),
      )}`,
    );
    console.log(
      `stabilityIdx : ${paint(stabilityColor, auto.stability.stabilityIndex.toFixed(2))}  ${paint(
        stabilityColor,
        bar(auto.stability.stabilityIndex),
      )}`,
    );
    console.log(
      `recoveryTime : ${auto.stability.recoveryTimeMs}ms  overshoot=${auto.stability.overshootLevel.toFixed(
        2,
      )}  learningGain=${auto.stability.learningGain.toFixed(2)}`,
    );
    if (auto.immuneCycle.activeDisturbance) {
      console.log(
        `disturbance : ${auto.immuneCycle.activeDisturbance.id} (mag=${auto.immuneCycle.activeDisturbance.magnitude.toFixed(
          2,
        )})`,
      );
    }
    if (auto.note) console.log(`note         : ${auto.note}`);
  }

  if (snapshot.responseFrame) {
    renderResponseFrame(snapshot.responseFrame);
  }

  console.log('==============================================');
};
