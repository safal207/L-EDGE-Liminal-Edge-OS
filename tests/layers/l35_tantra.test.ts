import { describe, expect, it } from 'vitest';

import type { OrganismTone } from '@/layers/shared/organismTone';
import {
  bind,
  mergePatterns,
  resonanceThread,
  type TantraSignal,
  weave,
} from '@/layers/L35_tantra';

const livelyTone: OrganismTone = {
  phase: 'inhale',
  fuzzChaos: 0.22,
  fuzzStability: 0.78,
  fuzzGrowth: 0.72,
  fuzzFatigue: 0.18,
  luckSynergyScore: 0.82,
  isInFlow: true,
  isOverwhelmed: false,
  needsRecovery: false,
};

const stabilizingTone: OrganismTone = {
  phase: 'hold',
  fuzzChaos: 0.55,
  fuzzStability: 0.65,
  fuzzGrowth: 0.35,
  fuzzFatigue: 0.42,
  luckSynergyScore: 0.55,
  isInFlow: false,
  isOverwhelmed: false,
  needsRecovery: false,
};

const seedSignals: TantraSignal[] = [
  { id: 'foresight', layer: 'L34', intensity: 0.82, rhythm: 0.76, clarity: 0.72, bias: 'explore' },
  { id: 'breathing', layer: 'L33', intensity: 0.64, rhythm: 0.74, clarity: 0.78, bias: 'balance' },
  { id: 'retrospective', layer: 'L32', intensity: 0.55, rhythm: 0.52, clarity: 0.68, bias: 'stabilize' },
];

const additionalSignals: TantraSignal[] = [
  { id: 'luck', layer: 'L21', intensity: 0.58, rhythm: 0.48, clarity: 0.61, bias: 'balance' },
  { id: 'insight', layer: 'L30', intensity: 0.77, rhythm: 0.71, clarity: 0.8, bias: 'explore' },
];

describe('L35 tantra layer', () => {
  it('bind accentuates close rhythms and harmonizes bias', () => {
    const close = bind(seedSignals[0], seedSignals[1], { tone: livelyTone });
    const distant = bind(seedSignals[0], additionalSignals[0], { tone: livelyTone });

    expect(close.resonance).toBeGreaterThan(0.9);
    expect(close.strength).toBeGreaterThan(distant.strength);
    expect(close.meaning).toBe('expansion corridor');
  });

  it('weaves a fabric that surfaces insight density and lucky windows', () => {
    const fabric = weave(seedSignals, { tone: livelyTone, minLinkStrength: 0.2 });

    expect(fabric.threads).toHaveLength(3);
    expect(fabric.links.length).toBeGreaterThanOrEqual(2);
    expect(fabric.flowScore).toBeGreaterThan(0.55);
    expect(fabric.insightDensity).toBeGreaterThan(0);
    expect(fabric.luckyWindows).toBeGreaterThan(0);
  });

  it('mergePatterns retains backbone and improves resilience', () => {
    const initial = weave(seedSignals.slice(0, 2), { tone: stabilizingTone, minLinkStrength: 0.2 });
    const merged = mergePatterns(initial, additionalSignals, { tone: stabilizingTone, retainExisting: true, minLinkStrength: 0.2 });

    expect(merged.threads.length).toBeGreaterThan(initial.threads.length);
    expect(merged.resilienceScore).toBeGreaterThan(initial.resilienceScore - 0.05);
    expect(merged.links.length).toBeGreaterThan(initial.links.length);
  });

  it('resonanceThread surfaces the most aligned path for a goal', () => {
    const fabric = weave([...seedSignals, additionalSignals[1]], { tone: livelyTone });

    const expansion = resonanceThread(fabric, { mode: 'expansion' });
    const stability = resonanceThread(fabric, { mode: 'stability' });

    expect(expansion?.id).toBe('insight');
    expect(stability?.id).toBe('retrospective');
  });
});
