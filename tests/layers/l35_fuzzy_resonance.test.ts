import { describe, expect, it } from 'vitest';

import type { OrganismTone } from '@/layers/shared/organismTone';
import type { TantraFabric, TantraLink } from '@/layers/L35_tantra';
import {
  buildFuzzyComment,
  deriveFuzzyTag,
  profileFabric,
  profileLink,
  toFuzzy,
  type FuzzyResonanceTag,
} from '@/layers/L35_fuzzy_resonance';

const baseTone: OrganismTone = {
  phase: 'inhale',
  fuzzChaos: 0.2,
  fuzzStability: 0.8,
  fuzzGrowth: 0.6,
  fuzzFatigue: 0.2,
  luckSynergyScore: 0.5,
  isInFlow: false,
  isOverwhelmed: false,
  needsRecovery: false,
};

const flowTone: OrganismTone = { ...baseTone, isInFlow: true, luckSynergyScore: 0.9 };

function mockLink(partial: Partial<TantraLink>): TantraLink {
  return {
    from: 'a',
    to: 'b',
    strength: 0.5,
    resonance: 0.5,
    tension: 0.5,
    meaning: 'harmonic crossfade',
    ...partial,
  };
}

describe('L35 fuzzy resonance', () => {
  it('translates numeric ranges to fuzzy labels', () => {
    expect(toFuzzy(0.1).label).toBe('low');
    expect(toFuzzy(0.5).label).toBe('medium');
    expect(toFuzzy(0.9).label).toBe('high');
  });

  it('profiles a link with a lucky corridor tag in flow context', () => {
    const link: TantraLink = mockLink({ resonance: 0.9, tension: 0.2, strength: 0.8 });
    const profile = profileLink(link, flowTone);

    expect(profile.tag).toBe('lucky_corridor');
    expect(profile.comment).toContain('удачного шага');
  });

  it('profiles stabilizing links as stability braids', () => {
    const link: TantraLink = mockLink({ tension: 0.1, strength: 0.92, resonance: 0.55, meaning: 'stability braid' });
    const profile = profileLink(link, baseTone);

    expect(profile.tag).toBe('stability_braid');
    expect(profile.comment).toContain('стабильность');
  });

  it('profiles a fabric and extracts dominant tags and overall luck', () => {
    const links: TantraLink[] = [
      mockLink({ from: 'x', to: 'y', resonance: 0.9, strength: 0.85, tension: 0.15 }),
      mockLink({ from: 'y', to: 'z', resonance: 0.6, strength: 0.6, tension: 0.8 }),
      mockLink({ from: 'z', to: 'x', resonance: 0.4, strength: 0.4, tension: 0.2 }),
    ];

    const fabric: TantraFabric = {
      threads: [],
      links,
      flowScore: 0,
      resilienceScore: 0,
      insightDensity: 0,
      luckyWindows: 0,
      createdAt: 'now',
    };

    const profile = profileFabric(fabric, flowTone);

    expect(profile.links).toHaveLength(3);
    expect(profile.dominantTags.length).toBeGreaterThan(0);
    expect(profile.overallLuck.value).toBeGreaterThan(0);
  });

  it('derives tags for chaotic, latent, and noisy links', () => {
    const chaoticTag = deriveFuzzyTag({
      resonance: toFuzzy(0.7),
      tension: toFuzzy(0.9),
      clarity: toFuzzy(0.6),
      luck: toFuzzy(0.4),
      meaning: 'harmonic crossfade',
      tone: { ...baseTone, fuzzChaos: 0.9, fuzzStability: 0.2 },
    });

    const latentTag = deriveFuzzyTag({
      resonance: toFuzzy(0.5),
      tension: toFuzzy(0.4),
      clarity: toFuzzy(0.5),
      luck: toFuzzy(0.5),
      meaning: 'harmonic crossfade',
      tone: baseTone,
    });

    const noiseTag = deriveFuzzyTag({
      resonance: toFuzzy(0.1),
      tension: toFuzzy(0.2),
      clarity: toFuzzy(0.1),
      luck: toFuzzy(0.1),
      meaning: 'harmonic crossfade',
      tone: baseTone,
    });

    expect(chaoticTag).toBe('chaotic_bridge');
    expect(latentTag).toBe('latent_potential');
    expect(noiseTag).toBe('shallow_noise');
  });

  it('renders contextual comments for each tag', () => {
    const tags: FuzzyResonanceTag[] = [
      'lucky_corridor',
      'stability_braid',
      'chaotic_bridge',
      'deep_insight_thread',
      'latent_potential',
      'shallow_noise',
    ];

    for (const tag of tags) {
      const comment = buildFuzzyComment({
        resonance: toFuzzy(0.5),
        tension: toFuzzy(0.5),
        clarity: toFuzzy(0.5),
        luck: toFuzzy(0.5),
        tag,
      });

      expect(typeof comment).toBe('string');
      expect(comment.length).toBeGreaterThan(0);
    }
  });
});
