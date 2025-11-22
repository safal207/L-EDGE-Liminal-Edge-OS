import { v4 as uuidv4 } from 'uuid';
import type { GenesisPlan, GenesisSeed, GenesisUpdateInput, SeedKind } from './types';

const DEFAULT_SHAPES: Record<SeedKind, string> = {
  soma_cell: 'Stability soma cell to buffer load and keep rhythms even',
  metric_probe: 'Lightweight probe to watch stress, tension, and field noise',
  resonance_agent: 'Agent to listen to external field shifts and mirror intent gently',
  memory_trace: 'Trace to deepen recall of recent transitions and emotional pivots',
  integration_task: 'Tasklet to integrate recent changes and normalize pathways',
};

const buildSeed = (
  kind: SeedKind,
  priority: GenesisSeed['priority'],
  reason: string,
  suggestedShape?: string,
): GenesisSeed => ({
  id: `${kind}_${uuidv4()}`,
  kind,
  priority,
  reason,
  suggestedShape: suggestedShape ?? DEFAULT_SHAPES[kind],
});

const summarize = (plan: GenesisPlan, mode: string): string => {
  const readyKinds = plan.ready.map((s) => s.kind);
  const deferredKinds = plan.deferred.map((s) => s.kind);
  const readySummary = readyKinds.length ? `ready: ${readyKinds.join(', ')}` : 'no immediate seeds';
  const deferredSummary = deferredKinds.length ? `deferred: ${deferredKinds.join(', ')}` : 'no deferred seeds';
  return [`mode ${mode}`, readySummary, deferredSummary].join(' | ');
};

export class GenesisSeeds {
  private lastPlan: GenesisPlan | null = null;

  constructor(private readonly config: { maxReady?: number; maxDeferred?: number } = {}) {}

  update({ origin, pathway, fuzzy, tuning }: GenesisUpdateInput): GenesisPlan {
    const now = Date.now();
    const mode = tuning?.mode ?? 'steady_growth';
    const ready: GenesisSeed[] = [];
    const deferred: GenesisSeed[] = [];
    const tensionHigh = fuzzy.pressure.tension.high ?? 0;
    const coherenceHigh = fuzzy.pressure.coherence.high ?? 0;
    const alignmentHigh = fuzzy.pressure.alignment.high ?? 0;

    if (tensionHigh > 0.45) {
      const seed = buildSeed(
        'metric_probe',
        mode === 'rapid_expansion' ? 'medium' : 'high',
        'High tension detected — system wants better sensing to avoid overload.',
      );
      (mode === 'deep_rest' || mode === 'integration' ? deferred : ready).push(seed);
    }

    if (coherenceHigh < 0.35 || alignmentHigh < 0.3 || pathway.growthVector.alignmentScore < 0.5) {
      const seed = buildSeed(
        'integration_task',
        mode === 'rapid_expansion' ? 'medium' : 'high',
        'Coherence or alignment is soft — propose integration tasks before further growth.',
      );
      (mode === 'rapid_expansion' ? deferred : ready).push(seed);
    }

    if (pathway.futurePull.intensity > 0.6 && (mode === 'steady_growth' || mode === 'rapid_expansion')) {
      ready.push(
        buildSeed(
          'soma_cell',
          'high',
          'Future pull is strong — add a stability soma cell to carry growth load.',
          'Stability-focused soma cell to anchor growth in core rhythms.',
        ),
      );
    }

    if (origin.intentionCore.clarity > 0.55 && mode !== 'deep_rest') {
      const seed = buildSeed(
        'resonance_agent',
        mode === 'rapid_expansion' ? 'high' : 'medium',
        'Origin clarity is present — cultivate an agent to gently mirror intent outward.',
      );
      (mode === 'integration' ? deferred : ready).push(seed);
    }

    if (pathway.futurePull.ideas.length > 1 && mode !== 'deep_rest') {
      const seed = buildSeed(
        'memory_trace',
        'medium',
        'Multiple ideas emerging — deepen memory traces to keep narrative continuity.',
      );
      ready.push(seed);
    }

    if (mode === 'deep_rest' || mode === 'integration') {
      const restSeed = buildSeed(
        'integration_task',
        'high',
        'System favors restoration — integrate before new growth.',
      );
      ready.unshift(restSeed);
      const stabilizationSeed = buildSeed(
        'soma_cell',
        'medium',
        'Stabilize rhythms while tension settles.',
      );
      deferred.push(stabilizationSeed);
    }

    const maxReady = this.config.maxReady ?? 6;
    const maxDeferred = this.config.maxDeferred ?? 6;

    const plan: GenesisPlan = {
      timestamp: now,
      mode,
      ready: ready.slice(0, maxReady),
      deferred: deferred.slice(0, maxDeferred),
      summary: '',
    };

    plan.summary = summarize(plan, mode);

    this.lastPlan = plan;
    return plan;
  }

  getLastPlan(): GenesisPlan | null {
    return this.lastPlan;
  }
}
