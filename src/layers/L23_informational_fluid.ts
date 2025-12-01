export type PhaseState = "frozen" | "fluid" | "vapor" | "metastable";

export type ImprintTone = "supportive" | "neutral" | "stress" | "conflict";

export interface Imprint {
  id: string;
  regionId: string;
  sourceLayer: string; // e.g. "L21", "L22"
  timestamp: number;
  tone: ImprintTone;
  intensity: number; // 0..1 (нормированная сила события)
  tags?: string[]; // "user:123", "agent:soma", "topic:money"
}

export interface CrystalPattern {
  regionId: string;
  lastUpdated: number;

  // степень упорядоченности: 0 - хаос, 1 - кристалл
  coherence: number; // 0..1

  // баланс тонов
  supportiveWeight: number; // накопленная "поддержка"
  stressWeight: number; // накопленный "стресс"
  conflictWeight: number; // накопленный "конфликт"
  neutralWeight: number;

  // динамика среды
  phase: PhaseState;
  plasticity: number; // 0..1 - насколько легко "перекристаллизуется"
  inertia: number; // 0..1 - насколько долго держит форму

  // для будущего: простая топология
  dominantTags?: string[];
}

export interface FluidRegionState {
  regionId: string;
  pattern: CrystalPattern;
  recentImprints: Imprint[];
}

export interface InformationalFluidSnapshot {
  regions: Record<string, FluidRegionState>;
  lastGlobalUpdate: number;
}

export interface InformationalFluidConfig {
  // скорость "испарения" старых импринтов
  imprintHalfLifeMs: number;

  // как сильно один imprint влияет на фазу
  phaseSensitivity: number;

  // базовая пластичность и инерция
  basePlasticity: number;
  baseInertia: number;
}

export class InformationalFluid {
  private regions: Map<string, FluidRegionState> = new Map();
  private lastGlobalUpdate = Date.now();

  constructor(private config: InformationalFluidConfig) {}

  applyImprint(imprint: Imprint): void {
    const region = this.ensureRegion(imprint.regionId);
    region.recentImprints.push(imprint);
    this.updatePattern(region);
  }

  getRegionState(regionId: string): FluidRegionState | undefined {
    return this.regions.get(regionId);
  }

  getSnapshot(): InformationalFluidSnapshot {
    return {
      regions: Object.fromEntries(this.regions.entries()),
      lastGlobalUpdate: this.lastGlobalUpdate,
    };
  }

  // 🔽 Внутренняя логика

  private ensureRegion(regionId: string): FluidRegionState {
    let region = this.regions.get(regionId);
    if (!region) {
      region = {
        regionId,
        recentImprints: [],
        pattern: this.createInitialPattern(regionId),
      };
      this.regions.set(regionId, region);
    }
    return region;
  }

  private createInitialPattern(regionId: string): CrystalPattern {
    const now = Date.now();
    return {
      regionId,
      lastUpdated: now,
      coherence: 0.5,
      supportiveWeight: 0,
      stressWeight: 0,
      conflictWeight: 0,
      neutralWeight: 0,
      phase: "fluid",
      plasticity: this.config.basePlasticity,
      inertia: this.config.baseInertia,
    };
  }

  private updatePattern(region: FluidRegionState): void {
    const now = Date.now();
    const { pattern } = region;

    // 1) Обновляем веса тонов с учётом "затухания" старых импринтов
    this.decayImprints(region, now);
    this.recalculateWeights(region);

    // 2) Обновляем фазу в зависимости от баланса тонов и инерции
    this.updatePhase(pattern);

    // 3) Обновляем coherence (упорядоченность)
    this.updateCoherence(pattern);

    pattern.lastUpdated = now;
    this.lastGlobalUpdate = now;
  }

  private decayImprints(region: FluidRegionState, now: number): void {
    const { imprintHalfLifeMs } = this.config;
    const horizon = now - imprintHalfLifeMs * 4; // "хвост" памяти: 4 полураспада

    region.recentImprints = region.recentImprints.filter((imp) => imp.timestamp >= horizon);
  }

  private recalculateWeights(region: FluidRegionState): void {
    // простая сумма для начала; потом можно ввести экспоненциальные веса
    const { pattern } = region;

    pattern.supportiveWeight = 0;
    pattern.stressWeight = 0;
    pattern.conflictWeight = 0;
    pattern.neutralWeight = 0;

    for (const imp of region.recentImprints) {
      const weight = imp.intensity;
      switch (imp.tone) {
        case "supportive":
          pattern.supportiveWeight += weight;
          break;
        case "stress":
          pattern.stressWeight += weight;
          break;
        case "conflict":
          pattern.conflictWeight += weight;
          break;
        case "neutral":
          pattern.neutralWeight += weight;
          break;
      }
    }
  }

  private updatePhase(pattern: CrystalPattern): void {
    const total =
      pattern.supportiveWeight + pattern.stressWeight + pattern.conflictWeight + pattern.neutralWeight;

    if (total === 0) {
      pattern.phase = "fluid";
      return;
    }

    const sensitivity = Math.max(0.1, Math.min(2, this.config.phaseSensitivity));

    const stressRatio = (pattern.stressWeight + pattern.conflictWeight) / total;
    const supportRatio = pattern.supportiveWeight / total;

    const stressMetric = Math.min(1, stressRatio * sensitivity);
    const supportMetric = Math.min(1, supportRatio * sensitivity);

    if (stressMetric < 0.1 && supportMetric > 0.6) {
      pattern.phase = "fluid"; // тёплая, поддерживающая вода
    } else if (stressMetric > 0.7) {
      pattern.phase = "vapor"; // перегретый хаос
    } else if (supportMetric < 0.1 && stressMetric > 0.4) {
      pattern.phase = "frozen"; // замороженное поле
    } else {
      pattern.phase = "metastable"; // на границе перелома
    }
  }

  private updateCoherence(pattern: CrystalPattern): void {
    const total =
      pattern.supportiveWeight + pattern.stressWeight + pattern.conflictWeight + pattern.neutralWeight;

    if (total === 0) {
      pattern.coherence = 0.0;
      return;
    }

    // упрощённо: coherence выше, если доминирует один тон
    const maxWeight = Math.max(
      pattern.supportiveWeight,
      pattern.stressWeight,
      pattern.conflictWeight,
      pattern.neutralWeight,
    );

    pattern.coherence = maxWeight / total;
  }
}
