import type { OrganismSnapshot } from '@/core/types/organismSnapshot';
import { crystalToMetricBundle, metabolismToMetricBundle } from '@/core/types/metrics';
import { printMetabolism } from '@/debug/printMetabolism';
import { colorForOverloadRisk, colorForRecovery, colorForStress } from '@/ui/colorScale';

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

const printMetricBundle = (group: ReturnType<typeof metabolismToMetricBundle>) => {
  console.log(`— ${group.groupId.toUpperCase()} —`);
  group.metrics.forEach((m) => {
    const color =
      m.id === 'stressIndex'
        ? colorForStress(m.value)
        : m.id === 'recoveryScore'
        ? colorForRecovery(m.value)
        : colorForOverloadRisk(m.value);
    console.log(`${m.label.padEnd(15)}: ${paint(color, m.value.toFixed(2))}  ${paint(color, bar(m.value))}`);
  });
};

export const renderOrganismSnapshot = (snapshot: OrganismSnapshot): void => {
  console.log('=== Organism Snapshot ===');
  console.log(`stage: ${snapshot.stage}  timestamp: ${snapshot.timestamp}`);
  console.log(`axes: L=${snapshot.triAxis.L.value.toFixed(2)} S=${snapshot.triAxis.S.value.toFixed(2)} C=${snapshot.triAxis.C.value.toFixed(2)}`);

  if (snapshot.metabolism) {
    printMetricBundle(metabolismToMetricBundle(snapshot.metabolism));
    printMetabolism({
      stressIndex: snapshot.metabolism.stressIndex,
      recoveryScore: snapshot.metabolism.recoveryScore,
      overloadRisk: snapshot.metabolism.overloadRisk,
      mode: snapshot.metabolism.mode,
      overloadAxes: snapshot.metabolism.overloadAxes,
      note: snapshot.metabolism.note,
    });
  }

  if (snapshot.crystal) {
    const bundle = crystalToMetricBundle(snapshot.crystal);
    console.log('— Crystal (L10) —');
    bundle.metrics.forEach((m) => {
      const color = m.direction === 'good-down' ? colorForOverloadRisk(m.value) : colorForRecovery(m.value);
      console.log(`${m.label.padEnd(15)}: ${paint(color, m.value.toFixed(2))}  ${paint(color, bar(m.value))}`);
    });
    console.log(
      `adjustments: ${snapshot.crystal.growth.preferredAdjustments.length ? snapshot.crystal.growth.preferredAdjustments.join(', ') : '—'}`,
    );
    if (snapshot.crystal.note) {
      console.log(`note: ${snapshot.crystal.note}`);
    }
  }
};
