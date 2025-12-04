import type { CorePulseSnapshot } from "./L22_core_pulse";
import type { InformationalFieldState } from "./L23_informational_fluid";
import type { DecisionOutcome } from "./L31_foresight_engine";
import type { BreathingState } from "./L33_breathing";

export interface ResourceState {
  energy: number; // 0..1, usable energy right now
  mineralReserve: number; // 0..1, short-term view of the buffer
  strain: number; // 0..1, how overloaded the system feels
  regenerationTendency: number; // 0..1, how much the system leans into recovery
}

export type DecisionEnvelope = DecisionOutcome & { intensity?: number };

export interface ResourceContext {
  corePulse?: CorePulseSnapshot;
  breathing?: BreathingState;
  informationalField?: InformationalFieldState;
  lastDecision?: DecisionEnvelope | null;
  previousState?: ResourceState;
}

export function computeResourceState(ctx: ResourceContext): ResourceState {
  let state: ResourceState = {
    energy: 0.7,
    mineralReserve: 0.7,
    strain: 0.3,
    regenerationTendency: 0.5,
  };

  if (ctx.corePulse) {
    const overload = clamp01(ctx.corePulse.overloadLevel ?? ctx.corePulse.current?.overloadRisk ?? 0);
    const readiness = clamp01(ctx.corePulse.readiness ?? 0.5);
    const drift: CorePulseSnapshot["drift"] = ctx.corePulse.drift ?? "stable";

    state.strain += overload * 0.5;
    state.energy -= overload * 0.25;
    state.regenerationTendency += (1 - overload) * 0.05;

    if (readiness > 0.6 && (drift === "rising" || drift === "stable")) {
      // Healthy, rising pulse lets the system spend a bit more without feeling strained.
      state.energy += 0.1 * readiness;
      state.strain -= 0.05 * readiness;
    }

    if (drift === "irregular") {
      // Irregular drift is a caution flag: raise strain and dampen recovery.
      state.strain += 0.08;
      state.regenerationTendency -= 0.05;
    }

    if (overload > 0.7) {
      // When overload spikes, dip into short-term reserves slightly.
      state.mineralReserve -= 0.05 + overload * 0.05;
    }
  }

  if (ctx.informationalField) {
    const { viscosity, coherence, phaseBias } = ctx.informationalField;
    const visc = clamp01(viscosity);
    const coh = clamp01(coherence);

    if (phaseBias === "protective") {
      // Protective and viscous fields feel heavier to move through.
      state.strain += visc * 0.25 + (1 - coh) * 0.1;
      state.energy -= visc * 0.15;
      state.regenerationTendency -= 0.05;
    }

    if (phaseBias === "expansive" && coh > 0.55) {
      // Expansive coherence supports smoother flow.
      state.strain -= 0.1 * coh;
      state.energy += 0.05 * coh;
      state.regenerationTendency += 0.08 * coh;
    }
  }

  if (ctx.breathing) {
    const couplingLevel =
      ctx.breathing.coreCoupling?.level ?? ctx.breathing.coreCouplingSnapshot?.mode ?? "neutral";
    const couplingStability = ctx.breathing.coreCoupling?.stability ?? ctx.breathing.coreCouplingSnapshot?.stability ?? 0.5;

    if (couplingLevel === "protective" || couplingLevel === "irregular") {
      // Protective or irregular breathing signals strain and slows recovery.
      state.strain += 0.12;
      state.energy -= 0.06;
      state.regenerationTendency -= 0.1 - couplingStability * 0.05;
    }

    if (couplingLevel === "coherent" || couplingLevel === "expansive") {
      // Coherent / expansive breathing lifts recovery and eases tension.
      state.regenerationTendency += 0.15 * couplingStability;
      state.strain -= 0.08 * couplingStability;
      state.energy += 0.06 * couplingStability;
    }

    if (ctx.breathing.mode === "ground" || ctx.breathing.mode === "steady") {
      // Grounding cadence gently tops up the near-term reserve.
      state.mineralReserve += 0.04 * couplingStability;
    }
  }

  if (ctx.lastDecision) {
    const decisionIntensity = clamp01(
      Math.max(
        ctx.lastDecision.intensity ?? 0,
        ctx.lastDecision.tension ?? 0,
        Math.abs(ctx.lastDecision.reward ?? 0),
        Math.abs(ctx.lastDecision.risk ?? 0),
      ),
    );

    if (decisionIntensity > 0.6) {
      // Recent heavy decision keeps the system braced.
      state.strain += 0.1 + decisionIntensity * 0.1;
      state.energy -= 0.08;
      state.regenerationTendency -= 0.05;
    } else if (decisionIntensity < 0.35) {
      state.regenerationTendency += 0.04;
    }
  }

  // Regeneration gently nudges mineralReserve unless strain dominates.
  state.mineralReserve += (state.regenerationTendency - state.strain) * 0.08;

  if (ctx.previousState) {
    // Temporal smoothing to avoid abrupt jumps between ticks.
    const blend = 0.65;
    state = {
      energy: ctx.previousState.energy * (1 - blend) + state.energy * blend,
      mineralReserve: ctx.previousState.mineralReserve * (1 - blend) + state.mineralReserve * blend,
      strain: ctx.previousState.strain * (1 - blend) + state.strain * blend,
      regenerationTendency:
        ctx.previousState.regenerationTendency * (1 - blend) + state.regenerationTendency * blend,
    };
  }

  return {
    energy: clamp01(state.energy),
    mineralReserve: clamp01(state.mineralReserve),
    strain: clamp01(state.strain),
    regenerationTendency: clamp01(state.regenerationTendency),
  } satisfies ResourceState;
}

export type EnergyLevel = "LOW" | "NORMAL" | "HIGH" | "OVERDRIVE";

export interface EnergyState {
  capacity: number; // 0..1
  current: number; // 0..1
  recoveryRate: number; // 0..1
  fatigue: number; // 0..1
  level: EnergyLevel;
}

export interface EnergyDemand {
  cost: number; // 0..1
  priority: number; // 0..1
  layerId: string; // who is asking (L21/L24/etc.)
}

export interface EnergyDecision {
  approved: boolean;
  adjustedCost: number;
  reason: "OK" | "INSUFFICIENT" | "DEFERRED";
}

export interface LayerTension {
  layerId: string;
  load: number; // 0..1
  strain: number; // 0..1
  stability: number; // 0..1
}

export interface TensionSnapshot {
  timestamp: number;
  layers: LayerTension[];
}

export interface TensionAlert {
  kind: "OVERLOAD" | "FRAGILE" | "BALANCED";
  affectedLayers: string[];
  summary: string;
}

export interface DecisionEvent {
  id: string;
  timestamp: number;
  tags?: string[];
  impact?: number; // 0..1 positive impact
  outcome?: "success" | "failure" | "neutral";
}

export interface GoalDescriptor {
  id: string;
  tags?: string[];
  priority: number; // 0..1
  horizonMs?: number;
}

export interface TemporalMarker {
  tPastScore: number; // 0..1
  tFuturePull: number; // 0..1
  repetitionRisk: number; // 0..1
}

export interface TemporalContext {
  marker: TemporalMarker;
  comment?: string;
}

export interface CellDecisionInput {
  energy: EnergyState;
  tension: TensionSnapshot;
  temporal: TemporalContext;
  waveDecision: WaveDecision;
  energyDemandOverride?: EnergyDemand;
}

export type CellDecisionOutcome = "GO_FULL" | "GO_SOFT" | "DEFER" | "CANCEL";

export interface CellDecision {
  outcome: CellDecisionOutcome;
  energyDecision: EnergyDecision;
  tensionAlerts: TensionAlert[];
  note?: string;
}

export interface WaveOptionForCell {
  predictedGain: number; // 0..1
  predictedRisk: number; // 0..1
  id: string;
  label?: string;
  tags?: string[];
}

export interface WaveDecision {
  chosen: WaveOptionForCell | null;
  ranked: { option: WaveOptionForCell }[];
  context: { goalDescription: string; forbiddenTags?: string[]; hardConstraints?: string[] };
  reasonSummary: string;
}

export function evaluateEnergyDemand(
  state: EnergyState,
  demand: EnergyDemand,
): EnergyDecision {
  const available = clamp01(state.capacity) * clamp01(state.current);
  const fatiguePenalty = clamp01(state.fatigue) * 0.5;
  const effectiveAvailable = clamp01(available - fatiguePenalty);
  const requestedCost = clamp01(demand.cost);
  const urgency = clamp01(demand.priority);

  if (effectiveAvailable <= 0.05) {
    return {
      approved: false,
      adjustedCost: 0,
      reason: "INSUFFICIENT",
    } satisfies EnergyDecision;
  }

  if (requestedCost <= effectiveAvailable) {
    return {
      approved: true,
      adjustedCost: requestedCost,
      reason: "OK",
    } satisfies EnergyDecision;
  }

  const partialBudget = effectiveAvailable * Math.min(1, 0.5 + urgency * 0.6);
  const canPartiallyFund = partialBudget > requestedCost * 0.35;

  if (canPartiallyFund) {
    return {
      approved: true,
      adjustedCost: clamp01(partialBudget),
      reason: "DEFERRED",
    } satisfies EnergyDecision;
  }

  return {
    approved: false,
    adjustedCost: 0,
    reason: "INSUFFICIENT",
  } satisfies EnergyDecision;
}

export function updateEnergyState(
  state: EnergyState,
  delta: { spent?: number; recovered?: number; fatigueDelta?: number },
): EnergyState {
  const spent = clamp01(delta.spent ?? 0);
  const recovered = clamp01(delta.recovered ?? 0);
  const fatigueDelta = delta.fatigueDelta ?? 0;

  const netCurrent = clamp01(state.current - spent + recovered);
  const netFatigue = clamp01(state.fatigue + fatigueDelta - recovered * 0.25);
  const level = deriveEnergyLevel({ ...state, current: netCurrent, fatigue: netFatigue });

  return {
    ...state,
    current: netCurrent,
    fatigue: netFatigue,
    level,
  } satisfies EnergyState;
}

export function analyzeTension(snapshot: TensionSnapshot): TensionAlert[] {
  const overloaded = snapshot.layers.filter(
    (layer) => layer.strain > 0.75 || layer.load > 0.8 || layer.stability < 0.25,
  );
  const fragile = snapshot.layers.filter(
    (layer) => !overloaded.includes(layer) && (layer.stability < 0.45 || layer.strain > 0.55),
  );
  const balanced = snapshot.layers.filter(
    (layer) => layer.strain <= 0.55 && layer.load < 0.7 && layer.stability >= 0.45,
  );

  const alerts: TensionAlert[] = [];

  if (overloaded.length > 0) {
    alerts.push({
      kind: "OVERLOAD",
      affectedLayers: overloaded.map((l) => l.layerId),
      summary: `Overloaded: ${overloaded.map((l) => `${l.layerId}↑${l.strain.toFixed(2)}`).join(", ")}`,
    });
  }

  if (fragile.length > 0) {
    alerts.push({
      kind: "FRAGILE",
      affectedLayers: fragile.map((l) => l.layerId),
      summary: `Fragile: ${fragile.map((l) => `${l.layerId} stability ${l.stability.toFixed(2)}`).join(", ")}`,
    });
  }

  if (balanced.length > 0 && alerts.length === 0) {
    alerts.push({
      kind: "BALANCED",
      affectedLayers: balanced.map((l) => l.layerId),
      summary: `Balanced load across ${balanced.length} layers`,
    });
  }

  return alerts;
}

export function computeTemporalContext(
  historyWindow: DecisionEvent[],
  goals: GoalDescriptor[],
): TemporalContext {
  if (!historyWindow.length) {
    return {
      marker: { tPastScore: 0, tFuturePull: 0, repetitionRisk: 0 },
      comment: "Нет истории — клетке нужен первичный опыт.",
    } satisfies TemporalContext;
  }

  const latest = historyWindow[historyWindow.length - 1];
  const now = Date.now();

  let similarityAccum = 0;
  let weightAccum = 0;
  let failureOverlap = 0;
  let failureWeight = 0;

  for (let i = 0; i < historyWindow.length - 1; i++) {
    const event = historyWindow[i];
    const similarity = jaccardIndex(latest.tags ?? [], event.tags ?? []);
    const decay = temporalDecay(now - event.timestamp);
    similarityAccum += similarity * decay;
    weightAccum += decay;

    if (event.outcome === "failure") {
      failureOverlap += similarity * decay;
      failureWeight += decay;
    }
  }

  const tPastScore = clamp01(weightAccum === 0 ? 0 : similarityAccum / weightAccum);
  const repetitionRisk = clamp01(failureWeight === 0 ? tPastScore * 0.35 : failureOverlap / failureWeight);

  const tFuturePull = computeFuturePull(latest.tags ?? [], goals);

  const commentParts = [
    `Past resonance=${tPastScore.toFixed(2)}`,
    `Future pull=${tFuturePull.toFixed(2)}`,
    `Repetition risk=${repetitionRisk.toFixed(2)}`,
  ];

  return {
    marker: { tPastScore, tFuturePull, repetitionRisk },
    comment: commentParts.join(" | "),
  } satisfies TemporalContext;
}

export function decideAtCellLevel(input: CellDecisionInput): CellDecision {
  const energyDemand =
    input.energyDemandOverride || deriveEnergyDemandFromWaveDecision(input.waveDecision, input.energy);
  const energyDecision = evaluateEnergyDemand(input.energy, energyDemand);
  const tensionAlerts = analyzeTension(input.tension);

  const overloadAlert = tensionAlerts.find((alert) => alert.kind === "OVERLOAD");
  const fragileAlert = tensionAlerts.find((alert) => alert.kind === "FRAGILE");

  const energyLow = input.energy.level === "LOW" || input.energy.fatigue > 0.75;
  const temporalRisky = input.temporal.marker.repetitionRisk > 0.75;
  const futureStrong = input.temporal.marker.tFuturePull > 0.65;

  let outcome: CellDecisionOutcome = "GO_FULL";

  if (!energyDecision.approved && energyDecision.reason === "INSUFFICIENT") {
    outcome = "CANCEL";
  } else if (overloadAlert || temporalRisky) {
    outcome = energyLow ? "CANCEL" : "DEFER";
  } else if (energyDecision.reason === "DEFERRED" || fragileAlert) {
    outcome = "GO_SOFT";
  }

  if (outcome === "GO_FULL" && energyLow) {
    outcome = "GO_SOFT";
  }

  if (outcome === "GO_SOFT" && futureStrong && !overloadAlert) {
    outcome = "GO_FULL";
  }

  const noteParts = [input.waveDecision.reasonSummary];
  if (overloadAlert) noteParts.push(overloadAlert.summary);
  if (fragileAlert) noteParts.push(fragileAlert.summary);
  if (energyLow) noteParts.push("Energy low — avoid overdrive.");
  if (temporalRisky) noteParts.push("Pattern repetition risk detected.");

  return {
    outcome,
    energyDecision,
    tensionAlerts,
    note: noteParts.filter(Boolean).join(" | "),
  } satisfies CellDecision;
}

function deriveEnergyLevel(state: Pick<EnergyState, "capacity" | "current" | "fatigue">): EnergyLevel {
  const charge = clamp01(state.capacity) * clamp01(state.current);
  const fatigue = clamp01(state.fatigue);

  if (charge > 0.9 && fatigue < 0.25) return "OVERDRIVE";
  if (charge < 0.2 || fatigue > 0.8) return "LOW";
  if (charge > 0.65 && fatigue < 0.6) return "HIGH";
  return "NORMAL";
}

function deriveEnergyDemandFromWaveDecision(
  waveDecision: WaveDecision,
  energy: EnergyState,
): EnergyDemand {
  const chosen = waveDecision.chosen ?? waveDecision.ranked[0]?.option;

  const costBase = chosen
    ? clamp01((clamp01(chosen.predictedRisk) + clamp01(1 - energy.recoveryRate)) / 2)
    : 0.2;
  const priority = chosen ? clamp01(0.4 + clamp01(chosen.predictedGain) * 0.6) : 0.3;

  return {
    cost: costBase,
    priority,
    layerId: "L24",
  } satisfies EnergyDemand;
}

function computeFuturePull(tags: string[], goals: GoalDescriptor[]): number {
  if (!goals.length || !tags.length) return 0;

  let score = 0;
  let weight = 0;

  for (const goal of goals) {
    const overlap = jaccardIndex(tags, goal.tags ?? []);
    const priority = clamp01(goal.priority);
    const horizonWeight = goal.horizonMs ? temporalDecay(goal.horizonMs / 10) : 1;
    score += overlap * priority * horizonWeight;
    weight += priority * horizonWeight;
  }

  return clamp01(weight === 0 ? 0 : score / weight);
}

function jaccardIndex(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const value of setA) {
    if (setB.has(value)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function temporalDecay(deltaMs: number): number {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return 1;
  const hours = deltaMs / (1000 * 60 * 60);
  return 1 / (1 + hours * 0.05);
}

function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}
