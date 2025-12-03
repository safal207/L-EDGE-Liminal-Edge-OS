import type { OrganismTone } from '@/layers/shared/organismTone';

export type TantraBias = 'explore' | 'stabilize' | 'balance';

export interface TantraSignal {
  id: string;
  layer: string;
  intensity: number; // 0..1 — energy of the thread
  rhythm: number; // 0..1 — phase alignment with system rhythm
  clarity: number; // 0..1 — signal confidence / coherence
  bias?: TantraBias;
  payload?: Record<string, unknown>;
}

export interface TantraThread extends TantraSignal {
  biasVector: number; // 0..1 where 1 = explore, 0 = stabilize
  resonanceScore: number; // local resonance of the thread with current tone
  synergyScore: number; // how much value the thread brings to the fabric
}

export interface TantraLink {
  from: string;
  to: string;
  strength: number; // 0..1 — how tightly threads are bound
  resonance: number; // 0..1 — rhythm overlap
  tension: number; // 0..1 — creative tension (higher = more tension)
  meaning: string;
}

export interface TantraFabric {
  threads: TantraThread[];
  links: TantraLink[];
  flowScore: number;
  resilienceScore: number;
  insightDensity: number;
  luckyWindows: number;
  toneSignature?: string;
  createdAt: string;
}

export interface WeaveOptions {
  tone?: OrganismTone | null;
  desiredBias?: TantraBias;
  minLinkStrength?: number;
}

export interface MergeOptions extends WeaveOptions {
  retainExisting?: boolean;
}

export interface ResonanceGoal {
  mode?: 'insight' | 'stability' | 'expansion';
  minimumStrength?: number;
}

export function weave(signals: TantraSignal[], options: WeaveOptions = {}): TantraFabric {
  const tone = options.tone ?? null;
  const threads = signals.map((signal) => normalizeThread(signal, tone));
  const minLinkStrength = options.minLinkStrength ?? 0.25;

  const links: TantraLink[] = [];
  for (let i = 0; i < threads.length; i += 1) {
    for (let j = i + 1; j < threads.length; j += 1) {
      const link = bind(threads[i], threads[j], options);
      if (link.strength >= minLinkStrength) {
        links.push(link);
      }
    }
  }

  const flowScore = computeFlowScore(threads, links, tone);
  const resilienceScore = computeResilience(threads, links);
  const insightDensity = links.length === 0 ? 0 : links.filter((l) => l.strength > 0.55).length / links.length;
  const luckyWindows = computeLuckyWindows(links, tone);

  return {
    threads,
    links,
    flowScore,
    resilienceScore,
    insightDensity,
    luckyWindows,
    toneSignature: buildToneSignature(tone),
    createdAt: new Date().toISOString(),
  };
}

export function bind(
  a: TantraSignal | TantraThread,
  b: TantraSignal | TantraThread,
  options: WeaveOptions = {},
): TantraLink {
  const tone = options.tone ?? null;
  const threadA = 'biasVector' in a ? a : normalizeThread(a, tone);
  const threadB = 'biasVector' in b ? b : normalizeThread(b, tone);

  const rhythmResonance = clamp01(1 - Math.abs(threadA.rhythm - threadB.rhythm));
  const clarityCoupling = (threadA.clarity + threadB.clarity) / 2;
  const biasAffinity = 1 - Math.abs(threadA.biasVector - threadB.biasVector);
  const toneFlow = tone ? computeToneFlow(tone) : 0.5;
  const desiredBiasPull = options.desiredBias
    ? 1 - Math.abs(threadA.biasVector - biasToScalar(options.desiredBias)) * 0.5
    : 1;

  const strength = clamp01(
    (0.4 * rhythmResonance + 0.25 * clarityCoupling + 0.15 * biasAffinity + 0.2 * toneFlow) * desiredBiasPull,
  );

  const tension = clamp01(0.5 * Math.abs(threadA.rhythm - threadB.rhythm) + 0.5 * Math.abs(threadA.biasVector - threadB.biasVector));

  return {
    from: threadA.id,
    to: threadB.id,
    strength,
    resonance: rhythmResonance,
    tension,
    meaning: deriveMeaning(threadA, threadB),
  };
}

export function mergePatterns(
  fabric: TantraFabric,
  newSignals: TantraSignal[],
  options: MergeOptions = {},
): TantraFabric {
  const baseSignals: TantraSignal[] = options.retainExisting
    ? [...fabric.threads.map(threadToSignal)]
    : fabric.threads.slice(-3).map(threadToSignal);

  const tone = options.tone ?? null;
  const merged = weave([...baseSignals, ...newSignals], { ...options, tone });

  return {
    ...merged,
    createdAt: new Date().toISOString(),
  };
}

export function resonanceThread(fabric: TantraFabric, goal: ResonanceGoal = {}): TantraThread | null {
  if (fabric.threads.length === 0) return null;

  const minimumStrength = goal.minimumStrength ?? 0.2;
  const mode = goal.mode ?? 'insight';

  const scored = fabric.threads
    .map((thread) => {
      const biasScore = mode === 'stability' ? 1 - thread.biasVector : thread.biasVector;
      const expansionBonus = mode === 'expansion' ? thread.intensity : 0;
      const resonanceEmphasis =
        mode === 'insight' ? thread.clarity : (thread.resonanceScore + thread.clarity) / 2;
      const clarityBonus = 0.05 * thread.clarity;

      const score = clamp01(
        0.35 * thread.resonanceScore + 0.25 * resonanceEmphasis + 0.2 * biasScore + 0.15 * expansionBonus + clarityBonus,
      );

      return { thread, score };
    })
    .filter(({ score }) => score >= minimumStrength)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.thread ?? null;
}

function normalizeThread(signal: TantraSignal, tone: OrganismTone | null): TantraThread {
  const biasVector = biasToScalar(signal.bias ?? 'balance');
  const resonancePriming = tone ? computeToneFlow(tone) : 0.5;
  const resonanceScore = clamp01(0.5 * signal.rhythm + 0.3 * signal.clarity + 0.2 * resonancePriming);
  const synergyScore = clamp01(0.5 * signal.intensity + 0.2 * signal.clarity + 0.3 * biasVector);

  return {
    ...signal,
    biasVector,
    resonanceScore,
    synergyScore,
  };
}

function computeFlowScore(threads: TantraThread[], links: TantraLink[], tone: OrganismTone | null): number {
  const averageResonance = threads.reduce((acc, t) => acc + t.resonanceScore, 0) / Math.max(threads.length, 1);
  const linkDensity = links.length / Math.max((threads.length * (threads.length - 1)) / 2, 1);
  const toneFlow = tone ? computeToneFlow(tone) : 0.5;

  return clamp01(0.4 * averageResonance + 0.35 * linkDensity + 0.25 * toneFlow);
}

function computeResilience(threads: TantraThread[], links: TantraLink[]): number {
  const clarityAvg = threads.reduce((acc, t) => acc + t.clarity, 0) / Math.max(threads.length, 1);
  const biasBalance = 1 - Math.abs(
    threads.reduce((acc, t) => acc + (t.biasVector - 0.5), 0) / Math.max(threads.length, 1),
  );
  const connectivity = links.length / Math.max(threads.length, 1);

  return clamp01(0.35 * clarityAvg + 0.35 * biasBalance + 0.3 * clamp01(connectivity / 4));
}

function computeLuckyWindows(links: TantraLink[], tone: OrganismTone | null): number {
  if (links.length === 0) return 0;
  const toneLuck = tone ? tone.luckSynergyScore ?? 0.5 : 0.5;
  const highResonanceLinks = links.filter((link) => link.resonance > 0.6 && link.strength > 0.55);
  return clamp01((highResonanceLinks.length / links.length) * toneLuck);
}

function deriveMeaning(a: TantraThread, b: TantraThread): string {
  const biasBlend = (a.biasVector + b.biasVector) / 2;
  if (biasBlend > 0.65) return 'expansion corridor';
  if (biasBlend < 0.35) return 'stability braid';
  return 'harmonic crossfade';
}

function buildToneSignature(tone: OrganismTone | null): string | undefined {
  if (!tone) return undefined;
  const phase = tone.phase ?? 'unknown';
  const luck = (tone.luckSynergyScore ?? 0.5).toFixed(2);
  return `${phase}-luck${luck}`;
}

function biasToScalar(bias: TantraBias): number {
  if (bias === 'explore') return 1;
  if (bias === 'stabilize') return 0;
  return 0.5;
}

function threadToSignal(thread: TantraThread): TantraSignal {
  const { id, layer, intensity, rhythm, clarity, bias, payload } = thread;
  return { id, layer, intensity, rhythm, clarity, bias, payload };
}

function computeToneFlow(tone: OrganismTone): number {
  const flow = tone.isInFlow ? 1 : 0;
  const chaosBrake = 1 - clamp01(tone.fuzzChaos ?? 0);
  const stability = clamp01(tone.fuzzStability ?? 0.5);
  const growth = clamp01(tone.fuzzGrowth ?? 0.5);
  const fatiguePenalty = clamp01(tone.fuzzFatigue ?? 0);
  const luck = clamp01(tone.luckSynergyScore ?? 0.5);

  return clamp01(0.25 * flow + 0.2 * stability + 0.15 * growth + 0.2 * chaosBrake + 0.2 * luck - 0.1 * fatiguePenalty);
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

