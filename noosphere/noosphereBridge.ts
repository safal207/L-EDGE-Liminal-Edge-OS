import imprints from './imprints.json';
import { clamp } from '../meta/patternDetector';
import {
  NoosphereBridgeOptions,
  NoosphereContext,
  NoosphereSnapshot,
  NoosphereState,
  WorldImprint,
  WorldImprintMatch,
} from './contracts';

const SUPPORT_TAGS = ['growth', 'recovery', 'corridor', 'stability', 'calm', 'expansion'];
const TENSION_TAGS = ['crisis', 'compression', 'trap', 'tension', 'turbulence', 'overload'];

export class NoosphereBridge {
  private readonly weightFloor: number;
  private state: NoosphereState;

  constructor(customImprints?: WorldImprint[], options?: NoosphereBridgeOptions) {
    this.weightFloor = options?.weightFloor ?? 0.05;
    const registry = customImprints ?? (imprints as WorldImprint[]);
    this.state = {
      snapshot: {
        activeImprints: [],
        supportLevel: 0,
        tensionLevel: 0,
        lastUpdated: Date.now(),
      },
      imprints: registry,
    } satisfies NoosphereState;
  }

  compute(context: NoosphereContext): NoosphereSnapshot {
    const activeImprints = this.state.imprints
      .map((imprint) => ({
        ...imprint,
        weight: this.scoreImprint(imprint, context),
      }))
      .filter((imprint) => imprint.weight >= this.weightFloor)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 12);

    const supportLevel = clamp(
      activeImprints
        .filter((imprint) => imprint.tags.some((tag) => SUPPORT_TAGS.includes(tag.toLowerCase())))
        .reduce((sum, imprint) => sum + imprint.weight, 0),
    );

    const tensionLevel = clamp(
      activeImprints
        .filter((imprint) => imprint.tags.some((tag) => TENSION_TAGS.includes(tag.toLowerCase())))
        .reduce((sum, imprint) => sum + imprint.weight, 0),
    );

    const dominantTag = activeImprints[0]?.tags[0];

    const snapshot: NoosphereSnapshot = {
      activeImprints,
      dominantTag,
      supportLevel,
      tensionLevel,
      lastUpdated: Date.now(),
    };

    this.state = { ...this.state, snapshot } satisfies NoosphereState;
    return snapshot;
  }

  getSnapshot(): NoosphereSnapshot {
    return this.state.snapshot;
  }

  listImprints(): WorldImprint[] {
    return [...this.state.imprints];
  }

  private scoreImprint(imprint: WorldImprint, context: NoosphereContext): number {
    const match = imprint.match;
    const base = clamp(imprint.baseWeight ?? 0.3);
    let weight = base;

    const hasCorridor = Boolean(context.field?.futureField.candidatePatterns.some((p) => p.kind === 'corridor'));
    const hasTrap = Boolean(context.field?.pastField.dominantPatterns.some((p) => p.kind === 'trap'));
    const hasLoop = Boolean(context.field?.pastField.dominantPatterns.some((p) => p.kind === 'loop'));

    weight += this.applyRequirement(match, 'requiresCorridor', hasCorridor, 0.25);
    weight += this.applyRequirement(match, 'requiresTrap', hasTrap, 0.2);
    weight += this.applyRequirement(match, 'requiresLoop', hasLoop, 0.15);

    const stress = context.homeostasis?.stressScore ?? 0.5;
    if (typeof match?.maxStress === 'number') {
      weight += stress <= match.maxStress ? 0.18 : -0.15;
    }
    if (typeof match?.minStress === 'number') {
      weight += stress >= match.minStress ? 0.14 : -0.12;
    }

    const entropy = context.field?.pastField.entropy ?? 0.5;
    if (typeof match?.maxEntropy === 'number') {
      weight += entropy <= match.maxEntropy ? 0.12 : -0.08;
    }

    const confidence = context.field?.futureField.confidence ?? 0;
    if (typeof match?.minConfidence === 'number') {
      weight += confidence >= match.minConfidence ? 0.1 : -0.06;
    }

    const opportunity = context.perception?.opportunityScore ?? 0;
    if (typeof match?.minOpportunity === 'number') {
      weight += opportunity >= match.minOpportunity ? 0.08 : -0.05;
    }

    const threat = context.perception?.threatScore ?? 0;
    if (typeof match?.threatAbove === 'number') {
      weight += threat >= match.threatAbove ? 0.08 : -0.05;
    }

    const volatility = context.self?.volatility ?? entropy;
    if (typeof match?.minVolatility === 'number') {
      weight += volatility >= match.minVolatility ? 0.05 : -0.05;
    }
    if (typeof match?.maxVolatility === 'number') {
      weight += volatility <= match.maxVolatility ? 0.05 : -0.05;
    }

    const emotion = context.emotion?.state.toLowerCase();
    if (emotion) {
      if (imprint.tags.some((tag) => /growth|expansion|corridor/i.test(tag)) && emotion.includes('calm')) {
        weight += 0.05;
      }
      if (imprint.tags.some((tag) => /crisis|trap|tension/i.test(tag)) && /alert|threat/i.test(emotion)) {
        weight += 0.05;
      }
    }

    return clamp(weight);
  }

  private applyRequirement(
    match: WorldImprintMatch | undefined,
    field: keyof WorldImprintMatch,
    condition: boolean,
    reward: number,
  ): number {
    if (!match || match[field] !== true) return 0;
    return condition ? reward : -reward;
  }
}
