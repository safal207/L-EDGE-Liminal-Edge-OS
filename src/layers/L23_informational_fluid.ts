import type { CorePulseSnapshot } from "./L22_core_pulse";
import type { BreathingState } from "./L33_breathing";

export interface InformationalFieldState {
  viscosity: number; // 0..1, higher = thicker medium
  coherence: number; // 0..1, higher = more aligned
  phaseBias: "protective" | "expansive" | "neutral";
}

export interface InformationalFluidContext {
  corePulse?: CorePulseSnapshot;
  breathing?: BreathingState;
}

export function computeInformationalField(ctx: InformationalFluidContext): InformationalFieldState {
  let state: InformationalFieldState = {
    viscosity: 0.5,
    coherence: 0.5,
    phaseBias: "neutral",
  };

  if (ctx.corePulse) {
    const overload = clamp(ctx.corePulse.overloadLevel ?? ctx.corePulse.current?.overloadRisk ?? 0);
    const readiness = clamp(ctx.corePulse.readiness ?? 0.5);
    const drift: CorePulseSnapshot["drift"] = ctx.corePulse.drift ?? "stable";

    state.viscosity += overload * 0.35 - readiness * 0.2;
    state.coherence += readiness * 0.25 - overload * 0.3;

    if (overload > 0.6) {
      state.phaseBias = "protective";
    } else if (readiness > 0.6 && (drift === "rising" || drift === "stable")) {
      state.phaseBias = "expansive";
    }
  }

  if (ctx.breathing) {
    const stance =
      ctx.breathing.coreCoupling?.level ?? ctx.breathing.coreCouplingSnapshot?.mode ?? "neutral";
    const coherence = ctx.breathing.coreCoupling?.stability ?? ctx.breathing.coreCouplingSnapshot?.stability;

    if (stance === "protective" || stance === "irregular") {
      state.viscosity += 0.12;
      state.coherence -= 0.05;
      state.phaseBias = "protective";
    }

    if (stance === "coherent" || stance === "expansive") {
      state.viscosity -= 0.08;
      state.coherence += 0.12;
      if (state.phaseBias !== "protective") {
        state.phaseBias = stance === "expansive" ? "expansive" : state.phaseBias;
      }
    }

    if (stance === "neutral" && coherence && coherence > 0.55) {
      state.coherence += 0.08 * coherence;
      state.viscosity -= 0.05 * coherence;
    }
  }

  return {
    viscosity: clamp(state.viscosity),
    coherence: clamp(state.coherence),
    phaseBias: state.phaseBias,
  };
}

export type PhaseState = "frozen" | "fluid" | "vapor" | "metastable";

export type ImprintTone = "supportive" | "neutral" | "stress" | "conflict";

export type InformationalFlowState = "stalled" | "normal" | "amplified";

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
  flowState?: InformationalFlowState;
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
  private lastPulseSnapshot?: CorePulseSnapshot;

  constructor(private config: InformationalFluidConfig) {}

  applyImprint(imprint: Imprint, pulse?: CorePulseSnapshot): void {
    const region = this.ensureRegion(imprint.regionId);
    region.recentImprints.push(imprint);
    this.updatePattern(region, pulse);
  }

  getRegionState(regionId: string): FluidRegionState | undefined {
    return this.regions.get(regionId);
  }

  getSnapshot(): InformationalFluidSnapshot {
    const averageCoherence = this.computeAverageCoherence();
    const flowState = this.deriveFlowState(averageCoherence, this.lastPulseSnapshot);
    return {
      regions: Object.fromEntries(this.regions.entries()),
      lastGlobalUpdate: this.lastGlobalUpdate,
      flowState,
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

  private updatePattern(region: FluidRegionState, pulse?: CorePulseSnapshot): void {
    const now = Date.now();
    const { pattern } = region;

    // 1) Обновляем веса тонов с учётом "затухания" старых импринтов
    this.decayImprints(region, now);
    this.recalculateWeights(region);

    // 2) Обновляем фазу в зависимости от баланса тонов и инерции
    this.updatePhase(pattern);

    // 3) Обновляем coherence (упорядоченность)
    this.updateCoherence(pattern);
    this.applyCorePulseModulation(pattern, pulse);

    pattern.lastUpdated = now;
    this.lastGlobalUpdate = now;
    if (pulse) {
      this.lastPulseSnapshot = pulse;
    }
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

  private applyCorePulseModulation(pattern: CrystalPattern, pulse?: CorePulseSnapshot): void {
    if (!pulse) return;

    const modulationLevel = clamp(pulse.modulationLevel);
    const baselineLevel = clamp(pulse.baselineLevel);

    const phaseShift = this.derivePhaseShift(pulse.phase);

    const driftStability = this.deriveDriftStability(pulse.drift);

    // Responsiveness: plasticity follows modulation and phase.
    pattern.plasticity = clamp(
      pattern.plasticity + modulationLevel * 0.12 + phaseShift * 0.08 - driftStability * 0.05,
    );

    // Inertia is dampened when the pulse is rising and increased when falling/irregular.
    pattern.inertia = clamp(pattern.inertia + driftStability * 0.1 - modulationLevel * 0.05);

    // Coherence lightly follows baseline tone with a modulation accent.
    pattern.coherence = clamp(pattern.coherence + baselineLevel * 0.05 + modulationLevel * 0.05);
  }

  private derivePhaseShift(phase: CorePulseSnapshot["phase"]): number {
    switch (phase) {
      case "rise":
        return 0.4;
      case "peak":
        return 0.25;
      case "recovery":
        return -0.15;
      default:
        return 0;
    }
  }

  private deriveDriftStability(drift: CorePulseSnapshot["drift"]): number {
    switch (drift) {
      case "rising":
        return -0.1;
      case "falling":
        return 0.2;
      case "irregular":
        return 0.3;
      default:
        return 0;
    }
  }

  private computeAverageCoherence(): number {
    if (this.regions.size === 0) return 0;
    let total = 0;
    for (const region of this.regions.values()) {
      total += region.pattern.coherence;
    }
    return total / this.regions.size;
  }

  private deriveFlowState(coherence: number, pulse?: CorePulseSnapshot): InformationalFlowState {
    if (!pulse) return "normal";

    const modulation = clamp(pulse.modulationLevel);
    const stableFlow = pulse.drift !== "falling" && pulse.drift !== "irregular";

    if (coherence > 0.6 && modulation > 0.6 && stableFlow && (pulse.phase === "rise" || pulse.phase === "peak")) {
      return "amplified";
    }

    if (modulation < 0.25 && (pulse.drift === "falling" || pulse.drift === "irregular")) {
      return "stalled";
    }

    return "normal";
  }
}

function clamp(value: number, min = 0, max = 1): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

