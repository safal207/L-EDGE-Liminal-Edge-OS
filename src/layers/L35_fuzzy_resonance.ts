import type { OrganismTone } from '@/layers/shared/organismTone';
import type { TantraFabric, TantraLink } from '@/layers/L35_tantra';

export type FuzzyLevelLabel = 'low' | 'medium' | 'high';

export const STABILITY_BRAID_MEANING = 'stability braid' as const;

export interface FuzzyValue {
  value: number; // 0..1
  label: FuzzyLevelLabel;
}

export type FuzzyResonanceTag =
  | 'lucky_corridor'
  | 'stability_braid'
  | 'chaotic_bridge'
  | 'deep_insight_thread'
  | 'shallow_noise'
  | 'latent_potential';

export interface FuzzyLinkProfile {
  linkId: string;
  resonance: FuzzyValue;
  tension: FuzzyValue;
  clarity: FuzzyValue;
  luck: FuzzyValue;
  tag: FuzzyResonanceTag;
  comment: string;
}

export interface FuzzyFabricProfile {
  fabricId: string;
  links: FuzzyLinkProfile[];
  dominantTags: FuzzyResonanceTag[];
  overallLuck: FuzzyValue;
}

export function toFuzzy(value: number): FuzzyValue {
  const v = clamp01(value);

  if (v < 0.33) return { value: v, label: 'low' };
  if (v < 0.66) return { value: v, label: 'medium' };
  return { value: v, label: 'high' };
}

interface TagContext {
  resonance: FuzzyValue;
  tension: FuzzyValue;
  clarity: FuzzyValue;
  luck: FuzzyValue;
  meaning: TantraLink['meaning'];
  tone: OrganismTone;
}

export function deriveFuzzyTag(ctx: TagContext): FuzzyResonanceTag {
  const { resonance, tension, clarity, luck, meaning, tone } = ctx;

  if (resonance.label === 'high' && clarity.label !== 'low' && luck.label === 'high' && tone.isInFlow) {
    return 'lucky_corridor';
  }

  if (
    meaning === STABILITY_BRAID_MEANING ||
    (tension.label === 'low' && clarity.label === 'high' && (tone.fuzzStability ?? 0) > (tone.fuzzChaos ?? 0))
  ) {
    return 'stability_braid';
  }

  if (tension.label === 'high' && resonance.label !== 'low' && (tone.fuzzChaos ?? 0) > (tone.fuzzStability ?? 0)) {
    return 'chaotic_bridge';
  }

  if (resonance.label === 'high' && clarity.label === 'high' && luck.label !== 'low') {
    return 'deep_insight_thread';
  }

  if (resonance.label === 'medium' && clarity.label === 'medium') {
    return 'latent_potential';
  }

  return 'shallow_noise';
}

interface CommentContext {
  resonance: FuzzyValue;
  tension: FuzzyValue;
  clarity: FuzzyValue;
  luck: FuzzyValue;
  tag: FuzzyResonanceTag;
}

export function buildFuzzyComment(ctx: CommentContext): string {
  const { resonance, tension, clarity, luck, tag } = ctx;

  switch (tag) {
    case 'lucky_corridor':
      return 'Сильный резонанс и высокий везучий контекст — окно удачного шага.';
    case 'stability_braid':
      return 'Связь удерживает стабильность при низком напряжении.';
    case 'chaotic_bridge':
      return 'Мост через хаотичное состояние — использовать аккуратно.';
    case 'deep_insight_thread':
      return 'Чистая и глубокая связь, несущая редкий инсайт.';
    case 'latent_potential':
      return 'Средняя сила и ясность — потенциал для роста при внимательной настройке.';
    case 'shallow_noise':
    default:
      return `Шумная связка (resonance=${resonance.label}, clarity=${clarity.label}, tension=${tension.label}, luck=${luck.label}).`;
  }
}

export function profileLink(link: TantraLink, tone: OrganismTone): FuzzyLinkProfile {
  const resonance = toFuzzy(link.resonance);
  const tension = toFuzzy(link.tension);
  const clarity = toFuzzy(link.strength);
  const luckBase = tone.luckSynergyScore ?? 0.5;
  const luck = toFuzzy(link.resonance * 0.7 + luckBase * 0.3);

  const tag = deriveFuzzyTag({
    resonance,
    tension,
    clarity,
    luck,
    meaning: link.meaning,
    tone,
  });

  const comment = buildFuzzyComment({ resonance, tension, clarity, luck, tag });

  return {
    linkId: `${link.from}->${link.to}`,
    resonance,
    tension,
    clarity,
    luck,
    tag,
    comment,
  };
}

export function profileFabric(fabric: TantraFabric, tone: OrganismTone): FuzzyFabricProfile {
  const profiles = fabric.links.map((link) => profileLink(link, tone));

  const overallLuckValue =
    profiles.length === 0 ? 0 : profiles.reduce((acc, p) => acc + p.luck.value, 0) / profiles.length;

  const overallLuck = toFuzzy(overallLuckValue);

  const tagCounts = new Map<FuzzyResonanceTag, number>();
  for (const p of profiles) {
    tagCounts.set(p.tag, (tagCounts.get(p.tag) ?? 0) + 1);
  }

  const dominantTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);

  return {
    fabricId: fabric.toneSignature ?? `fabric_${fabric.createdAt}`,
    links: profiles,
    dominantTags,
    overallLuck,
  };
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
