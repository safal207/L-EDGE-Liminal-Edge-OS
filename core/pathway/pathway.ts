import { clamp } from '../../meta/patternDetector';
import type { MetaSystemSnapshot } from '../metaOrchestrator/types';
import type { OriginState } from '../origin/types';
import type { PathwayConfig, PathwayPace, PathwayState, PathwayUpdateInput } from './types';

const DEFAULT_BRANCH_LIMIT = 8;

const pickPace = (metaSnapshot: MetaSystemSnapshot): PathwayPace => {
  const tension = metaSnapshot.meta.tension ?? 0;
  const coherence = metaSnapshot.meta.coherence ?? 0;

  if (tension > 0.7) return 'slow';
  if (coherence > 0.7 && tension < 0.4) return 'fast';
  return 'steady';
};

const boundBranches = (items: string[], limit: number): string[] =>
  items.length > limit ? items.slice(items.length - limit) : items;

export class PathwayNode {
  private state: PathwayState;
  private readonly branchLimit: number;

  constructor(config: PathwayConfig = {}) {
    this.branchLimit = config.branchLimit ?? DEFAULT_BRANCH_LIMIT;
    this.state = {
      timestamp: Date.now(),
      growthVector: {
        trajectory: config.defaultTrajectory ?? 'orientation',
        pace: 'steady',
        alignmentScore: 0.5,
      },
      branches: {
        active: [config.defaultTrajectory ?? 'orientation'],
        emerging: [],
        fading: [],
      },
      futurePull: {
        ideas: config.defaultIdeas ?? ['clarity', 'supportive-growth'],
        intensity: 0.4,
      },
      summary: 'Pathway initialized. Awaiting origin and meta context.',
    };
  }

  update({ originState, metaSnapshot }: PathwayUpdateInput): PathwayState {
    const pace = pickPace(metaSnapshot);
    const alignmentScore = this.computeAlignment(originState, metaSnapshot);
    const trajectory = this.deriveTrajectory(originState, metaSnapshot);

    const activeBranches = new Set(this.state.branches.active);
    activeBranches.add(trajectory);
    if (metaSnapshot.intent?.kind) {
      activeBranches.add(metaSnapshot.intent.kind);
    }

    const emerging = this.deriveEmerging(metaSnapshot);
    const fading = this.deriveFading(emerging);

    const ideas = this.deriveIdeas(originState, metaSnapshot);
    const intensity = clamp((metaSnapshot.meta.coherence ?? 0) * 0.6 + (1 - (metaSnapshot.meta.tension ?? 0)) * 0.4);

    this.state = {
      timestamp: metaSnapshot.timestamp ?? Date.now(),
      growthVector: { trajectory, pace, alignmentScore },
      branches: {
        active: boundBranches(Array.from(activeBranches), this.branchLimit),
        emerging: boundBranches(emerging, this.branchLimit),
        fading: boundBranches(fading, this.branchLimit),
      },
      futurePull: { ideas: boundBranches(ideas, this.branchLimit), intensity },
      summary: this.composeSummary({ trajectory, pace, alignmentScore, intensity, originState, metaSnapshot }),
    };

    return this.state;
  }

  getState(): PathwayState {
    return this.state;
  }

  private computeAlignment(originState: OriginState, metaSnapshot: MetaSystemSnapshot): number {
    const intentAlignment = metaSnapshot.intent?.fieldAlignment;
    const fieldMode = metaSnapshot.field?.mode ?? 'unknown';
    const coherence = metaSnapshot.meta.coherence ?? 0;
    const tension = metaSnapshot.meta.tension ?? 0;

    let alignment = 0.5;
    if (intentAlignment === 'aligned') alignment += 0.2;
    if (intentAlignment === 'against_field') alignment -= 0.2;

    if (fieldMode === 'supportive') alignment += 0.15;
    if (fieldMode === 'high_tension') alignment -= 0.15;

    alignment += coherence * 0.1;
    alignment -= tension * 0.1;

    if (originState.rootVector.direction === 'expansion' && fieldMode === 'supportive') {
      alignment += 0.05;
    }

    return clamp(alignment);
  }

  private deriveTrajectory(originState: OriginState, metaSnapshot: MetaSystemSnapshot): string {
    if ((metaSnapshot.meta.tension ?? 0) > 0.65) return 'stabilize-core';
    if (originState.rootVector.direction === 'expansion') return 'expand-capillaries';
    if ((metaSnapshot.meta.coherence ?? 0) > 0.65) return 'consolidate-growth';
    return originState.rootVector.direction;
  }

  private deriveEmerging(metaSnapshot: MetaSystemSnapshot): string[] {
    const emerging: string[] = [];
    if ((metaSnapshot.field?.mode ?? 'unknown') === 'supportive') {
      emerging.push('supportive-paths');
    }
    if (metaSnapshot.resonance?.primaryMode === 'resonant') {
      emerging.push('resonant-bridges');
    }
    if ((metaSnapshot.meta.coherence ?? 0) > 0.7) {
      emerging.push('deep-focus');
    }
    if ((metaSnapshot.meta.tension ?? 0) > 0.6) {
      emerging.push('stability-buffer');
    }
    return emerging;
  }

  private deriveFading(emerging: string[]): string[] {
    const fading = this.state.branches.active.filter((branch) => !emerging.includes(branch));
    if (fading.length === 0 && this.state.branches.fading.length) {
      return boundBranches(this.state.branches.fading, this.branchLimit);
    }
    return fading;
  }

  private deriveIdeas(originState: OriginState, metaSnapshot: MetaSystemSnapshot): string[] {
    const ideas = new Set<string>(this.state.futurePull.ideas);
    ideas.add(originState.intentionCore.purpose);
    if ((metaSnapshot.meta.coherence ?? 0) > 0.6) {
      ideas.add('amplify-strengths');
    }
    if ((metaSnapshot.meta.tension ?? 0) > 0.65) {
      ideas.add('prioritize-restoration');
    }
    return Array.from(ideas);
  }

  private composeSummary({
    trajectory,
    pace,
    alignmentScore,
    intensity,
    originState,
    metaSnapshot,
  }: {
    trajectory: string;
    pace: PathwayPace;
    alignmentScore: number;
    intensity: number;
    originState: OriginState;
    metaSnapshot: MetaSystemSnapshot;
  }): string {
    const coherence = metaSnapshot.meta.coherence ?? 0;
    const tension = metaSnapshot.meta.tension ?? 0;
    return [
      `Pathway moving along ${trajectory} at ${pace} pace`,
      `alignment ${(alignmentScore * 100).toFixed(0)}% with origin ${originState.rootVector.meaning}`,
      `future pull ${(intensity * 100).toFixed(0)}%`,
      `coherence ${(coherence * 100).toFixed(0)}% / tension ${(tension * 100).toFixed(0)}%`,
    ].join(' | ');
  }
}
